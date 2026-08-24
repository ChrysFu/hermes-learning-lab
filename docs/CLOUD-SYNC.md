# Optional cloud progress sync

Hermes Learning Lab is local-first. Every lesson, simulation, evidence check, and report works without an account. Supabase adds optional progress sync only; Prompt drafts, raw evidence, Hermes configuration, secrets, messages, and Companion status are never uploaded.

## Configure Supabase

1. Create a Supabase project.
2. Run [`supabase/migrations/20260824000000_learning_progress.sql`](../supabase/migrations/20260824000000_learning_progress.sql) in the SQL editor or through the Supabase CLI.
3. Enable Email and GitHub under **Authentication → Providers**.
4. Add the local and deployed URLs to **Authentication → URL Configuration**:
   - `http://127.0.0.1:5173/`
   - `https://chrysfu.github.io/hermes-learning-lab/`
5. Copy `.env.example` to `.env.local` for local development and set the public project URL and anon key.
6. Add the same values as GitHub repository variables named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

The anon key is intended for browser use. Never expose a Supabase service-role key through a `VITE_` variable.

## Data boundary

The `learning_progress` table stores one JSON progress document per authenticated user. Row Level Security limits select, insert, and update operations to `auth.uid() = user_id`. Local and remote arrays are merged so a sync cannot erase evidence already stored on either device.

When the deployment variables are absent or Supabase is unavailable, the UI reports local-only mode and keeps the browser progress unchanged.
