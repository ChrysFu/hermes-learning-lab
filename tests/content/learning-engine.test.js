import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPrompt,
  calculateDomainMastery,
  evaluateEvidence,
  learningPaths,
  mergeProgress,
  migrateProgress,
  recommendPath,
  searchLessons,
} from "../../src/learningEngine.js";
const lessonSearchFixture = [
  { id: "installation-channels", title: "下载与多端接入", shortTitle: "桌面与飞书首轮体验", summary: "连接飞书", objective: "完成接入", takeaways: [] },
  { id: "automation", title: "自动化", shortTitle: "Gateway 与 Cron", summary: "通过飞书验收排程", objective: "可靠运行", takeaways: [] },
  { id: "sandbox-security", title: "安全", shortTitle: "隔离", summary: "限制网络", objective: "安全运行", takeaways: [] },
];

test("recommends an engineering route to experienced automation learners", () => {
  const result = recommendPath({ goal: "engineering", experience: "advanced", channel: "both" });

  assert.equal(result.pathId, "engineering");
  assert.equal(result.startLessonId, "tools-context");
  assert.match(result.reason, /工程/);
});

test("keeps quick start focused on the minimum working Hermes loop", () => {
  assert.deepEqual(learningPaths.find((path) => path.id === "quick-start").lessonIds, [
    "installation-channels",
    "setup-doctor",
    "prompt-contracts",
    "skills-plugins-mcp",
    "automation",
  ]);
});

test("searches lessons by operations and filters to the selected path", () => {
  const results = searchLessons(lessonSearchFixture, "飞书", "quick-start");

  assert.deepEqual(results.map((lesson) => lesson.id), ["installation-channels", "automation"]);
});

test("scores a redacted Hermes evidence receipt and rejects secrets", () => {
  const safe = evaluateEvidence("Hermes v0.20.0\nDoctor: pass\nDESKTOP_OK\nGateway: running\nRecovery: gateway stopped");
  const unsafe = evaluateEvidence("Doctor: pass\napi_key=sk-live-super-secret-value\nDESKTOP_OK");
  const githubToken = evaluateEvidence("Doctor: pass\nghp_abcdefghijklmnopqrstuv\nDESKTOP_OK");

  assert.equal(safe.passed, true);
  assert.equal(safe.score, 100);
  assert.deepEqual(safe.matched, ["version", "doctor", "receipt", "runtime", "recovery"]);
  assert.equal(unsafe.passed, false);
  assert.equal(unsafe.hasSensitiveData, true);
  assert.equal(githubToken.hasSensitiveData, true);
  assert.match(unsafe.feedback[0], /敏感/);
});

test("builds an auditable prompt contract", () => {
  const prompt = buildPrompt({
    task: "调研三个 Hermes Skills",
    scope: "只读官方仓库",
    output: "Markdown 对比表",
    constraints: "不安装任何 Skill",
  });

  assert.match(prompt, /任务：调研三个 Hermes Skills/);
  assert.match(prompt, /允许范围：只读官方仓库/);
  assert.match(prompt, /验收结果：Markdown 对比表/);
  assert.match(prompt, /停止条件/);
});

test("calculates domain mastery from two independent evidence types", () => {
  const domains = calculateDomainMastery(
    ["installation-channels", "setup-doctor", "prompt-contracts"],
    ["installation-channels", "prompt-contracts"],
  );

  assert.equal(domains.find((domain) => domain.id === "setup").score, 75);
  assert.equal(domains.find((domain) => domain.id === "reliability").score, 25);
});

test("migrates v3 progress and merges cloud progress without losing local evidence", () => {
  const local = migrateProgress({ version: 3, completed: ["setup-doctor"], verifiedLabs: [], activeLesson: 1, diagnostics: {} });
  const merged = mergeProgress(local, {
    version: 4,
    completed: [],
    verifiedLabs: ["setup-doctor"],
    activeLesson: 0,
    diagnostics: { "setup-doctor": "correct" },
    pathId: "daily-use",
    evidenceReports: [],
  });

  assert.equal(local.version, 4);
  assert.equal(local.pathId, "quick-start");
  assert.deepEqual(merged.completed, ["setup-doctor"]);
  assert.deepEqual(merged.verifiedLabs, ["setup-doctor"]);
  assert.equal(merged.diagnostics["setup-doctor"], "correct");
});

test("an empty first-time cloud row cannot reset the selected local route", () => {
  const local = migrateProgress({ version: 4, pathId: "engineering", activeLesson: 8, completed: [], verifiedLabs: [], diagnostics: {}, evidenceReports: [] });

  const merged = mergeProgress(local, {});

  assert.equal(merged.pathId, "engineering");
  assert.equal(merged.activeLesson, 8);
});

test("migration clamps a corrupted negative lesson index", () => {
  assert.equal(migrateProgress({ completed: [], activeLesson: -9 }).activeLesson, 0);
});
