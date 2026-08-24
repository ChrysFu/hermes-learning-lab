create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learning_progress enable row level security;

create policy "learners can read their own progress"
  on public.learning_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "learners can create their own progress"
  on public.learning_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "learners can update their own progress"
  on public.learning_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
