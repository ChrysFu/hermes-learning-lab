# 0004. Local-first progress with optional cloud sync

- **Status**: accepted
- **Date**: 2026-08-24
- **Deciders**: Codex, user

## Context

Learners need a zero-account path and may also want progress on more than one device. Raw prompts, experiment evidence, Hermes configuration, and Companion state are more sensitive than the small mastery record required for synchronization.

## Decision

- `localStorage v4` remains the source available to every learner.
- Supabase Auth optionally supports GitHub OAuth and email magic links.
- Only lesson IDs, diagnostics, selected path, recent position, and redacted evidence scores are synchronized.
- The browser dynamically loads the Supabase client only when public deployment variables exist.
- The database uses one row per authenticated user and Row Level Security for all operations.
- Local and remote progress are merged before upload; cloud failure cannot block or erase local learning.

## Consequences

- The public course works without a backend and degrades visibly to local-only mode.
- Repository owners must provision Supabase, enable both providers, apply the migration, and set GitHub variables before login buttons become active.
- Prompt drafts, imported evidence text, secrets, Hermes status, and messages remain outside cloud storage.

## References

- [Cloud sync setup](../CLOUD-SYNC.md)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
