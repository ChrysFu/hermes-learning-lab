import assert from "node:assert/strict";
import test from "node:test";

import { createProgressRepository, getCloudConfig } from "../../src/cloudSync.js";

test("cloud sync remains optional when deployment variables are absent", () => {
  assert.deepEqual(getCloudConfig({}), { configured: false, url: "", anonKey: "" });
});

test("recognizes a complete public Supabase configuration", () => {
  assert.deepEqual(getCloudConfig({ VITE_SUPABASE_URL: "https://demo.supabase.co", VITE_SUPABASE_ANON_KEY: "anon-public" }), {
    configured: true,
    url: "https://demo.supabase.co",
    anonKey: "anon-public",
  });
});

test("progress repository reads and writes only the authenticated learner row", async () => {
  const calls = [];
  const query = {
    select(columns) { calls.push(["select", columns]); return this; },
    eq(column, value) { calls.push(["eq", column, value]); return this; },
    maybeSingle() { calls.push(["maybeSingle"]); return Promise.resolve({ data: { progress: { version: 4 } }, error: null }); },
    upsert(value, options) { calls.push(["upsert", value, options]); return Promise.resolve({ error: null }); },
  };
  const client = { from(table) { calls.push(["from", table]); return query; } };
  const repository = createProgressRepository(client);

  assert.deepEqual(await repository.load("learner-1"), { version: 4 });
  await repository.save("learner-1", { version: 4, completed: ["setup-doctor"] });

  assert.deepEqual(calls.slice(0, 4), [["from", "learning_progress"], ["select", "progress"], ["eq", "user_id", "learner-1"], ["maybeSingle"]]);
  assert.equal(calls[5][1].user_id, "learner-1");
  assert.deepEqual(calls[5][2], { onConflict: "user_id" });
});
