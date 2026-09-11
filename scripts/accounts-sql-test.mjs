import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Actual PostgreSQL SQL/RLS execution, with only the Supabase identity boundary
// stubbed. No project, network request, credentials or bypass-role client needed.
const migration = await readFile(new URL('../supabase/migrations/20260911160700_accounts_sync.sql', import.meta.url), 'utf8');
const users = ['00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002'];
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
async function denied(db, sql, params = [], code = '42501') {
  await assert.rejects(db.query(sql, params), error => error.code === code);
  checks++;
}
async function asUser(db, id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id || '']);
  await db.exec(`set role ${role}`);
}
async function setup() {
  const db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  await db.exec(migration);
  for (const id of users) await db.query('insert into auth.users(id) values ($1)', [id]);
  return db;
}
const definitions = [
  { table: 'study_state', columns: 'user_id, version, state', values: '$1, 1, $2::jsonb', payload: '{"version":1,"lastVisited":null,"lessons":{}}', conflict: 'user_id', change: "state = '{\"version\":1,\"lastVisited\":null,\"lessons\":{\"1\":{}}}'::jsonb", update: 'version = excluded.version, state = excluded.state' },
  { table: 'quiz_states', columns: 'user_id, version, state, quiz_key', values: "$1, 1, $2::jsonb, 'bb.quiz.celula.v1'", payload: '{"version":1,"questions":{}}', conflict: 'user_id, quiz_key', change: "state = '{\"version\":1,\"questions\":{\"ce-001\":{\"verified\":true}}}'::jsonb", update: 'version = excluded.version, state = excluded.state' },
  { table: 'notes', columns: 'user_id, body, chapter_num, section_id', values: "$1, $2, 1, 'home'", payload: 'Notița mea', conflict: 'user_id, chapter_num, section_id', change: "body = 'Notiță actualizată'", update: 'body = excluded.body' }
];
const db = await setup();
try {
  const policies = await db.query("select tablename, cmd from pg_policies where schemaname = 'public' order by tablename, cmd");
  check(policies.rows.length === 12, 'Four explicit operation policies on each table');
  const security = await db.query("select relname, relrowsecurity from pg_class where relname in ('study_state', 'quiz_states', 'notes')");
  check(security.rows.every(row => row.relrowsecurity), 'RLS enabled on all tables');
  const fn = await db.query("select prosecdef, proconfig from pg_proc where proname = 'bb_set_cloud_timestamps'");
  check(fn.rows.length === 1 && fn.rows[0].prosecdef === false && fn.rows[0].proconfig.includes('search_path=""'), 'Timestamp trigger has invoker privileges and empty search path');

  for (const def of definitions) {
    const insert = `insert into public.${def.table} (${def.columns}) values (${def.values})`;
    for (const id of users) {
      await asUser(db, id);
      await db.query(insert, [id, def.payload]);
      check((await db.query(`select * from public.${def.table}`)).rows.length === 1, `${def.table}: user only sees their inserted row`);
    }
    await asUser(db, users[0]);
    check((await db.query(`select * from public.${def.table}`)).rows.every(row => row.user_id === users[0]), `${def.table}: foreign rows hidden`);
    await denied(db, insert, [users[1], def.payload]);
    await denied(db, `update public.${def.table} set user_id = $1 where user_id = $2`, [users[1], users[0]]);
    check((await db.query(`update public.${def.table} set ${def.change} where user_id = $1 returning user_id`, [users[1]])).rows.length === 0, `${def.table}: foreign UPDATE affects no rows`);
    check((await db.query(`delete from public.${def.table} where user_id = $1 returning user_id`, [users[1]])).rows.length === 0, `${def.table}: foreign DELETE affects no rows`);
    const original = (await db.query(`select * from public.${def.table}`)).rows[0];
    const updated = (await db.query(`update public.${def.table} set ${def.change}, updated_at = '2000-01-01' where user_id = $1 returning *`, [users[0]])).rows[0];
    check(updated && +new Date(updated.updated_at) >= +new Date(original.updated_at) && +new Date(updated.updated_at) > +new Date('2020-01-01'), `${def.table}: own UPDATE and server timestamp`);
    const upsert = `${insert} on conflict (${def.conflict}) do update set ${def.update} returning *`;
    check((await db.query(upsert, [users[0], def.payload])).rows.length === 1, `${def.table}: own upsert accepted`);
    await denied(db, upsert, [users[1], def.payload]);
    await asUser(db, null);
    check((await db.query(`select * from public.${def.table}`)).rows.length === 0, `${def.table}: authenticated role without identity sees nothing`);
    await denied(db, insert, [users[0], def.payload]);
    await asUser(db, null, 'anon');
    for (const sql of [`select * from public.${def.table}`, insert, `update public.${def.table} set ${def.change}`, `delete from public.${def.table}`]) {
      await denied(db, sql, sql === insert ? [users[0], def.payload] : []);
    }
    await asUser(db, users[0]);
    check((await db.query(`delete from public.${def.table} where user_id = $1 returning user_id`, [users[0]])).rows.length === 1, `${def.table}: own DELETE accepted`);
    check((await db.query(upsert, [users[0], def.payload])).rows.length === 1, `${def.table}: insert branch of upsert accepted`);
    console.log(`PASS ${def.table}: two-user RLS, CRUD, ownership reassignment, anonymous denial, upsert, timestamps`);
  }

  await asUser(db, users[0]);
  for (const table of ['study_state', 'quiz_states']) {
    for (const value of ['[]', '{}', '{"version":null}', '{"version":2}', '{"version":"1"}']) {
      await denied(db, `update public.${table} set state = $1::jsonb`, [value], '23514');
    }
    await denied(db, `update public.${table} set state = $1::jsonb`, [JSON.stringify({ version: 1, body: 'a'.repeat(1048576) })], '23514');
    await denied(db, `update public.${table} set version = 0, state = '{"version":0}'`, [], '23514');
    await denied(db, `update public.${table} set state = null`, [], '23502');
  }
  for (const section of ['', '../home', 'home space', '<script>', 'x'.repeat(161)]) {
    await denied(db, 'update public.notes set section_id = $1', [section], '23514');
  }
  await denied(db, 'update public.notes set body = $1', ['ă'.repeat(20001)], '23514');
  await denied(db, 'update public.notes set chapter_num = 0', [], '23514');
  await db.query('update public.notes set body = $1, section_id = $2', ['ă'.repeat(20000), 'x'.repeat(160)]);
  check((await db.query('select char_length(body) as size from public.notes')).rows[0].size === 20000, 'Unicode note uses character limit, inclusive maximum accepted');
  const before = (await db.query('select created_at from public.notes')).rows[0].created_at;
  await db.exec("update public.notes set created_at = '2000-01-01'");
  check(+new Date((await db.query('select created_at from public.notes')).rows[0].created_at) === +new Date(before), 'created_at is immutable on update');
  await db.query("insert into public.notes (user_id,chapter_num,section_id,body,created_at,updated_at) values ($1,2,'home','Capitolul 2','2000-01-01','2000-01-01'), ($1,2,'celula','Secțiunea 2','2000-01-01','2000-01-01')", [users[0]]);
  check((await db.query('select * from public.notes')).rows.length === 3, 'Two chapters and multiple sections retain distinct notes');
  check((await db.query('select created_at, updated_at from public.notes where chapter_num = 2')).rows.every(row => +new Date(row.created_at) > +new Date('2020-01-01') && +new Date(row.created_at) === +new Date(row.updated_at)), 'Insert timestamps are server-owned');
  for (const key of ['', 'anything', 'bb.quiz.celula.v0', 'bb.quiz.x.v1 '.repeat(20)]) {
    await denied(db, 'update public.quiz_states set quiz_key = $1', [key], '23514');
  }
  console.log('PASS JSON/version/size constraints, quiz keys, note limits, section identifiers, chapter isolation and immutable creation time');

  await db.exec('reset role');
  await db.query('delete from auth.users where id = $1', [users[0]]);
  for (const { table } of definitions) {
    const rows = (await db.query(`select user_id from public.${table}`)).rows;
    check(rows.length === 1 && rows[0].user_id === users[1], `${table}: deleting auth user cascades only own records`);
  }
  console.log('PASS auth.users deletion cascades across all tables without touching another user');
} finally { await db.close(); }

// Reproducible means the checked-in migration builds a new empty database;
// history-aware Supabase migration tooling applies it once, not twice in place.
const fresh = await setup();
try {
  check((await fresh.query("select count(*)::int as count from pg_policies where schemaname = 'public'")).rows[0].count === 12, 'Migration reproduces policies in a second clean database');
} finally { await fresh.close(); }
console.log(`PASS accounts SQL: ${checks} assertions; migration executed on two independent PostgreSQL databases (PGlite).`);
