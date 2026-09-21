import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const name=id=>id+'/44444444-4444-4444-8444-444444444444.webp';
async function user(id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);}
try{
  await db.exec(`create role authenticated;create role anon;create schema auth;create schema storage;
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(bucket_id text references storage.buckets(id),name text,primary key(bucket_id,name));
    alter table storage.objects enable row level security;
    grant usage on schema storage,auth to authenticated,anon;
    grant select,insert,update,delete on storage.objects to authenticated,anon;`);
  await db.exec(await readFile(new URL('../supabase/migrations/20260918180000_note_images.sql',import.meta.url),'utf8'));
  const bucket=(await db.query('select * from storage.buckets')).rows[0];assert.equal(bucket.public,false);assert.equal(Number(bucket.file_size_limit),2097152);assert.deepEqual(bucket.allowed_mime_types,['image/webp']);
  for(const id of [A,B]){await user(id);await db.query("insert into storage.objects values('note-images',$1)",[name(id)]);}
  await user(A);assert.deepEqual((await db.query('select name from storage.objects')).rows.map(r=>r.name),[name(A)]);
  await assert.rejects(db.query("insert into storage.objects values('note-images',$1)",[B+'/new.webp']),e=>e.code==='42501');
  await assert.rejects(db.query("insert into storage.objects values('note-images',$1)",[A+'/bad.svg']),e=>e.code==='42501');
  await assert.rejects(db.query('update storage.objects set name=$1',[name(B)]),e=>e.code==='42501');
  assert.equal((await db.query('delete from storage.objects where name=$1 returning name',[name(B)])).rows.length,0);
  assert.equal((await db.query('update storage.objects set name=name where name=$1 returning name',[name(B)])).rows.length,0);
  await db.query("insert into storage.objects values('note-images',$1) on conflict(bucket_id,name) do update set name=excluded.name",[name(A)]);
  await user('','anon');assert.equal((await db.query('select * from storage.objects')).rows.length,0);
  await assert.rejects(db.query("insert into storage.objects values('note-images',$1)",[name(A)]),e=>e.code==='42501');
  await user(A);assert.equal((await db.query('delete from storage.objects returning name')).rows.length,1);
  console.log('Private image SQL: bucket restrictions, owner CRUD/upsert, anonymous denial and cross-owner isolation passed.');
}finally{await db.close();}
