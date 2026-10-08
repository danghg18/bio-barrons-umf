-- Prepared locally; register with `supabase migration new account_state_cas`
-- before deployment. Apply before the CAS client. Old clients fail safely on
-- updates, retain their local outbox, and must refresh. Never fall back to upsert.
begin;
alter table public.study_state add column revision bigint not null default 1 check (revision > 0);
alter table public.quiz_states add column revision bigint not null default 1 check (revision > 0);
alter table public.notes add column revision bigint not null default 1 check (revision > 0);
-- Prevent deletion/recreation from resetting a revision while another device
-- has an offline base. Clearing answers or a note is an ordinary CAS write.
revoke delete on public.study_state, public.quiz_states, public.notes from authenticated;
create function public.bb_guard_account_revision() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.revision <> 1 then raise exception 'Initial revision required' using errcode = '40001'; end if;
  else
    if new.user_id <> old.user_id then raise exception 'Owner cannot change' using errcode = '42501'; end if;
    if tg_table_name = 'quiz_states' then
      if new.quiz_key <> old.quiz_key then raise exception 'Key cannot change' using errcode = '22023'; end if;
    end if;
    if tg_table_name = 'notes' then
      if new.chapter_num <> old.chapter_num or new.section_id <> old.section_id then raise exception 'Key cannot change' using errcode = '22023'; end if;
    end if;
    if new.revision <> old.revision + 1 then raise exception 'Revision required' using errcode = '40001'; end if;
  end if;
  return new;
end;
$$;
create trigger study_revision before insert or update on public.study_state for each row execute function public.bb_guard_account_revision();
create trigger quiz_revision before insert or update on public.quiz_states for each row execute function public.bb_guard_account_revision();
create trigger note_revision before insert or update on public.notes for each row execute function public.bb_guard_account_revision();
revoke all on function public.bb_guard_account_revision() from public, anon, authenticated;

create function public.bb_put_account_state(p_owner uuid,p_key text,p_payload jsonb,p_expected bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
  current_row jsonb;
  target text;
  predicate text;
  chapter integer;
  section text;
begin
  if uid is null or p_owner is null or uid <> p_owner then raise exception 'Authenticated owner changed' using errcode = '42501'; end if;
  if p_expected is null or p_expected < 0 or p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'Invalid state' using errcode = '22023'; end if;
  if p_key = 'bb.study.v1' then
    target := 'study_state'; predicate := 'user_id = $1';
    if p_expected = 0 then
      insert into public.study_state(user_id,version,state) values(uid,(p_payload->>'version')::integer,p_payload)
      on conflict do nothing returning to_jsonb(study_state.*) into current_row;
    end if;
  elsif p_key ~ '^bb[.]quiz[.][a-z0-9][a-z0-9-]*[.]v[1-9][0-9]*$' then
    target := 'quiz_states'; predicate := 'user_id = $1 and quiz_key = $2';
    if p_expected = 0 then
      insert into public.quiz_states(user_id,quiz_key,version,state) values(uid,p_key,(p_payload->>'version')::integer,p_payload)
      on conflict do nothing returning to_jsonb(quiz_states.*) into current_row;
    end if;
  elsif p_key ~ '^note:[1-9][0-9]*:[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$' then
    target := 'notes'; predicate := 'user_id = $1 and chapter_num = $3 and section_id = $4';
    chapter := split_part(p_key,':',2)::integer; section := split_part(p_key,':',3);
    if p_payload->>'chapter_num' is distinct from chapter::text or p_payload->>'section_id' is distinct from section or jsonb_typeof(p_payload->'body') is distinct from 'string' then raise exception 'Invalid note association' using errcode = '22023'; end if;
    if p_expected = 0 then
      insert into public.notes(user_id,chapter_num,section_id,body) values(uid,chapter,section,p_payload->>'body')
      on conflict do nothing returning to_jsonb(notes.*) into current_row;
    end if;
  else raise exception 'Invalid key' using errcode = '22023';
  end if;
  if current_row is not null then return jsonb_build_object('accepted',true,'record',current_row); end if;
  -- The row lock serializes compare + update across devices and browser tabs.
  execute format('select to_jsonb(t.*) from public.%I t where %s for update',target,predicate)
    into current_row using uid,p_key,chapter,section;
  if current_row is null then raise exception 'Record revision missing' using errcode = '40001'; end if;
  if (current_row->>'revision')::bigint <> p_expected then return jsonb_build_object('accepted',false,'record',current_row); end if;
  if target = 'notes' then
    update public.notes set body = p_payload->>'body', revision = revision + 1 where user_id = uid and chapter_num = chapter and section_id = section returning to_jsonb(notes.*) into current_row;
  else
    execute format('update public.%I set state = $5, version = ($5->>''version'')::integer, revision = revision + 1 where %s returning to_jsonb(%I.*)',target,predicate,target)
      into current_row using uid,p_key,chapter,section,p_payload;
  end if;
  return jsonb_build_object('accepted',true,'record',current_row);
end;
$$;
revoke all on function public.bb_put_account_state(uuid,text,jsonb,bigint) from public, anon;
grant execute on function public.bb_put_account_state(uuid,text,jsonb,bigint) to authenticated;
commit;
