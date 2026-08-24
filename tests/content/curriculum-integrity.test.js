import assert from "node:assert/strict";
import test from "node:test";

import { learningResources, lessons } from "../../src/data.js";
import { learningPaths } from "../../src/learningEngine.js";

test("routes and learning resources reference existing lesson ids", () => {
  const ids = new Set(lessons.map((lesson) => lesson.id));

  for (const path of learningPaths) {
    for (const lessonId of path.lessonIds) assert.equal(ids.has(lessonId), true, `${path.id}: ${lessonId}`);
  }
  for (const resource of learningResources) {
    for (const lessonId of resource.lessonIds) assert.equal(ids.has(lessonId), true, `${resource.id}: ${lessonId}`);
  }
});

test("the canonical curriculum keeps 13 unique lessons", () => {
  assert.equal(lessons.length, 13);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 13);
});
