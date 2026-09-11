-- Local caches retain their existing version and JSON contracts. Server timestamps
-- describe accepted cloud writes; client visitedAt/updatedAt remain inside state.
begin;

create table public.study_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  constraint study_state_payload check (
    jsonb_typeof(state) = 'object'
    and state ? 'version'
    and state->'version' = to_jsonb(version)
    and octet_length(state::text) <= 1048576
  )
);

create table public.quiz_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_key text not null check (
    char_length(quiz_key) <= 160
    and quiz_key ~ '^bb[.]quiz[.][a-z0-9][a-z0-9-]*[.]v[1-9][0-9]*$'
  ),
  version integer not null check (version > 0),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, quiz_key),
  constraint quiz_states_payload check (
    jsonb_typeof(state) = 'object'
    and state ? 'version'
    and state->'version' = to_jsonb(version)
    and octet_length(state::text) <= 1048576
  )
);

create table public.notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_num integer not null check (chapter_num > 0),
  section_id text not null check (section_id ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$'),
  body text not null default '' check (char_length(body) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_num, section_id)
);

-- The user_id-leading primary keys also index every ownership policy and FK.
alter table public.study_state enable row level security;
alter table public.quiz_states enable row level security;
alter table public.notes enable row level security;

revoke all on table public.study_state, public.quiz_states, public.notes from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.study_state, public.quiz_states, public.notes to authenticated;

create policy study_state_select on public.study_state for select to authenticated
  using ((select auth.uid()) = user_id);
create policy study_state_insert on public.study_state for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy study_state_update on public.study_state for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy study_state_delete on public.study_state for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy quiz_states_select on public.quiz_states for select to authenticated
  using ((select auth.uid()) = user_id);
create policy quiz_states_insert on public.quiz_states for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy quiz_states_update on public.quiz_states for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quiz_states_delete on public.quiz_states for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy notes_select on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy notes_insert on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy notes_update on public.notes for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy notes_delete on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);

create function public.bb_set_cloud_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.clock_timestamp();
  if tg_table_name = 'notes' then
    if tg_op = 'INSERT' then
      new.created_at := new.updated_at;
    else
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.bb_set_cloud_timestamps() from public, anon, authenticated;

create trigger study_state_timestamps before insert or update on public.study_state
  for each row execute function public.bb_set_cloud_timestamps();
create trigger quiz_states_timestamps before insert or update on public.quiz_states
  for each row execute function public.bb_set_cloud_timestamps();
create trigger notes_timestamps before insert or update on public.notes
  for each row execute function public.bb_set_cloud_timestamps();

commit;
