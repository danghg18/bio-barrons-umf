-- Personal lesson highlights, real quiz history and simulation snapshots.
-- Tombstones are retained. Ordinary clients cannot physically delete history rows.
create table public.personal_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null check (char_length(record_key) <= 540 and record_key ~ '^bb\.(highlight|highlight-clear|analytics|analytics-clear|simulation)\.v1:.+$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and payload ? 'version' and payload->'version' = '1'::jsonb and octet_length(payload::text) <= 2097152),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, record_key)
);
alter table public.personal_records enable row level security;
revoke all on public.personal_records from public, anon, authenticated;
grant select, insert, update on public.personal_records to authenticated;
create policy personal_select on public.personal_records for select to authenticated using ((select auth.uid()) = user_id);
create policy personal_insert on public.personal_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy personal_update on public.personal_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.bb_guard_personal_record() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id then raise exception 'Owner cannot change' using errcode = '42501'; end if;
    if new.record_key <> old.record_key then raise exception 'Record key cannot change' using errcode = '22023'; end if;
    if new.revision <> old.revision + 1 then raise exception 'Revision required' using errcode = '40001'; end if;
    if old.payload->>'deleted' = 'true' then new.payload := old.payload;
    elsif new.payload->>'deleted' = 'true' then null;
    elsif old.record_key like 'bb.simulation.v1:%' then
      -- Preserve the original question snapshot, clock and algorithm forever.
      new.payload := new.payload || jsonb_build_object('questions',old.payload->'questions','startedAt',old.payload->'startedAt','deadline',old.payload->'deadline','minutes',old.payload->'minutes','scoringVersion',old.payload->'scoringVersion','allocation',old.payload->'allocation');
      if old.payload->>'status' = 'completed' then
        new.payload := new.payload || jsonb_build_object('status','completed','answers',old.payload->'answers','result',old.payload->'result','completedAt',old.payload->'completedAt','submissionId',old.payload->'submissionId');
      end if;
    elsif old.record_key like 'bb.analytics.v1:attempt:%' or old.record_key like 'bb.highlight-clear.v1:%' or old.record_key like 'bb.analytics-clear.v1:%' then
      new.payload := old.payload;
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger personal_record_guard before insert or update on public.personal_records for each row execute function public.bb_guard_personal_record();

-- Atomic optimistic concurrency. Caller identity is taken exclusively from JWT.
-- The invoker also remains subject to the table's RLS policies.
create function public.bb_put_personal_record(p_key text, p_payload jsonb, p_expected bigint, p_owner uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  current_row public.personal_records;
  uid uuid := auth.uid();
  inserted boolean := false;
begin
  if uid is null or p_owner is null or uid <> p_owner then raise exception 'Authenticated owner changed' using errcode = '42501'; end if;
  if p_key is null or char_length(p_key) > 540 or p_key !~ '^bb\.(highlight|highlight-clear|analytics|analytics-clear|simulation)\.v1:.+$' or p_expected is null or p_expected < 0 then
    raise exception 'Invalid personal record' using errcode = '22023';
  end if;
  if p_expected = 0 then
    insert into public.personal_records(user_id,record_key,payload) values(uid,p_key,p_payload)
      on conflict(user_id,record_key) do nothing returning * into current_row;
    inserted := found;
    if inserted then return jsonb_build_object('accepted',true,'record',to_jsonb(current_row)); end if;
  end if;
  select * into current_row from public.personal_records where user_id = uid and record_key = p_key for update;
  if not found then raise exception 'Record revision missing' using errcode = '40001'; end if;
  if current_row.revision <> p_expected then return jsonb_build_object('accepted',false,'record',to_jsonb(current_row)); end if;
  update public.personal_records set payload = p_payload, revision = revision + 1
    where user_id = uid and record_key = p_key returning * into current_row;
  return jsonb_build_object('accepted',true,'record',to_jsonb(current_row));
end;
$$;
revoke all on function public.bb_put_personal_record(text,jsonb,bigint,uuid) from public, anon;
grant execute on function public.bb_put_personal_record(text,jsonb,bigint,uuid) to authenticated;
revoke all on function public.bb_guard_personal_record() from public, anon, authenticated;
