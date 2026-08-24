const SENSITIVE_PATTERNS = [
  /(?:api[_ -]?key|secret|token|password|authorization)\s*[:=]\s*\S+/i,
  /(?:sk|rk)-[a-z0-9_-]{12,}/i,
  /(?:gh[pousr]_|github_pat_)[a-z0-9_]{12,}/i,
  /xox[baprs]-[a-z0-9-]{12,}/i,
];

export const learningPaths = [
  {
    id: "quick-start",
    label: "快速上手",
    summary: "用最少的课程建立可工作的 Hermes，并完成第一条可验收自动化链路。",
    lessonIds: ["installation-channels", "setup-doctor", "prompt-contracts", "skills-plugins-mcp", "automation"],
    startLessonId: "installation-channels",
  },
  {
    id: "daily-use",
    label: "日常使用",
    summary: "围绕 Desktop、飞书、Memory、Skills 和排程，建立稳定的个人助手工作流。",
    lessonIds: ["installation-channels", "setup-doctor", "agent-loop", "models-profiles", "prompt-contracts", "tools-context", "sessions-memory", "skills-plugins-mcp", "automation"],
    startLessonId: "installation-channels",
  },
  {
    id: "engineering",
    label: "工程进阶",
    summary: "从审批、隔离和并行任务出发，完成可观测、可恢复、可评测的 Agent 交付。",
    lessonIds: ["agent-loop", "models-profiles", "prompt-contracts", "tools-context", "sessions-memory", "skills-plugins-mcp", "automation", "delegation-routing", "sandbox-security", "backup-restore", "capstone"],
    startLessonId: "tools-context",
  },
];

const PATH_GOAL_MAP = { engineering: "engineering", build: "engineering", daily: "daily-use", use: "daily-use", quick: "quick-start", beginner: "quick-start" };

export function recommendPath({ goal = "quick", experience = "beginner", channel = "desktop" } = {}) {
  const normalizedGoal = PATH_GOAL_MAP[String(goal).toLowerCase()] || (experience === "advanced" ? "engineering" : channel === "both" ? "daily-use" : "quick-start");
  const path = learningPaths.find((item) => item.id === normalizedGoal) || learningPaths[0];
  const reasons = {
    "quick-start": "你会先建立最小可工作的 Hermes，再逐步扩展能力。",
    "daily-use": "这条路线优先覆盖桌面端、飞书端和日常自动化。",
    engineering: "工程路线会优先练习工具边界、隔离、并行任务和恢复。",
  };
  return { pathId: path.id, startLessonId: path.startLessonId, reason: reasons[path.id] };
}

export function searchLessons(allLessons, query = "", pathId = "all") {
  const normalized = query.trim().toLowerCase();
  const path = learningPaths.find((item) => item.id === pathId);
  return allLessons.filter((lesson) => {
    const inPath = !path || path.lessonIds.includes(lesson.id);
    const haystack = [lesson.title, lesson.shortTitle, lesson.summary, lesson.objective, ...lesson.takeaways].join(" ").toLowerCase();
    return inPath && (!normalized || haystack.includes(normalized));
  });
}

export function buildPrompt({ task = "", scope = "", output = "", constraints = "" } = {}) {
  return [
    `任务：${task || "未填写"}`,
    `允许范围：${scope || "未填写"}`,
    `验收结果：${output || "未填写"}`,
    `约束：${constraints || "无"}`,
    "停止条件：完成验收结果后停止；遇到超出范围的动作先请求确认。",
  ].join("\n");
}

const EVIDENCE_RULES = [
  ["version", /hermes\s+v?\d|版本\s*[:：]/i],
  ["doctor", /doctor\s*[:：]?\s*(pass|通过|ok|clean|无阻断)/i],
  ["receipt", /(?:desktop_ok|feishu_ok|hermes_ok)/i],
  ["runtime", /(?:gateway|desktop)\s*[:：]?\s*(running|运行|ready|connected)/i],
  ["recovery", /(?:recovery|恢复|stopped|停止|撤销|rollback)/i],
];

export function evaluateEvidence(text = "") {
  const source = String(text).trim();
  const hasSensitiveData = SENSITIVE_PATTERNS.some((pattern) => pattern.test(source));
  const matched = EVIDENCE_RULES.filter(([, pattern]) => pattern.test(source)).map(([id]) => id);
  const feedback = [];
  if (hasSensitiveData) feedback.push("检测到疑似敏感信息，请删除 API Key、Secret、Token 或密码后再提交。 ");
  if (!matched.includes("receipt")) feedback.push("缺少 Desktop/Feishu 的固定回执，例如 DESKTOP_OK 或 FEISHU_OK。 ");
  if (!matched.includes("doctor")) feedback.push("请补充 Doctor 的脱敏结论。 ");
  if (!matched.includes("recovery")) feedback.push("请记录一次可执行的停止、撤销或回滚动作。 ");
  const score = hasSensitiveData ? 0 : Math.round((matched.length / EVIDENCE_RULES.length) * 100);
  return { score, matched, hasSensitiveData, passed: !hasSensitiveData && matched.length === EVIDENCE_RULES.length, feedback: feedback.length ? feedback : ["证据完整且未发现敏感信息。"] };
}

const DOMAIN_RULES = [
  { id: "setup", label: "安装与诊断", lessonIds: ["installation-channels", "setup-doctor"] },
  { id: "reliability", label: "可靠交互", lessonIds: ["agent-loop", "models-profiles", "prompt-contracts", "tools-context"] },
  { id: "memory", label: "Memory 与 Skills", lessonIds: ["sessions-memory", "skills-plugins-mcp"] },
  { id: "automation", label: "自动化与并行", lessonIds: ["automation", "delegation-routing"] },
  { id: "production", label: "安全与恢复", lessonIds: ["sandbox-security", "backup-restore", "capstone"] },
];

export function calculateDomainMastery(completed = [], verifiedLabs = []) {
  return DOMAIN_RULES.map((domain) => {
    const total = domain.lessonIds.length * 2;
    const points = domain.lessonIds.reduce((score, id) => score + (completed.includes(id) ? 1 : 0) + (verifiedLabs.includes(id) ? 1 : 0), 0);
    return { ...domain, score: Math.round((points / total) * 100), completed: domain.lessonIds.filter((id) => completed.includes(id)).length, verified: domain.lessonIds.filter((id) => verifiedLabs.includes(id)).length };
  });
}

export function migrateProgress(progress = {}) {
  const valid = progress && typeof progress === "object" ? progress : {};
  return {
    version: 4,
    completed: Array.isArray(valid.completed) ? valid.completed : [],
    verifiedLabs: Array.isArray(valid.verifiedLabs) ? valid.verifiedLabs : [],
    activeLesson: Number.isInteger(valid.activeLesson) ? Math.max(0, valid.activeLesson) : 0,
    diagnostics: valid.diagnostics && typeof valid.diagnostics === "object" ? valid.diagnostics : {},
    pathId: learningPaths.some((path) => path.id === valid.pathId) ? valid.pathId : "quick-start",
    evidenceReports: Array.isArray(valid.evidenceReports) ? valid.evidenceReports : [],
  };
}

export function mergeProgress(local, remote) {
  const left = migrateProgress(local);
  const right = migrateProgress(remote);
  const remoteHasPath = remote && learningPaths.some((path) => path.id === remote.pathId);
  return {
    ...left,
    completed: [...new Set([...left.completed, ...right.completed])],
    verifiedLabs: [...new Set([...left.verifiedLabs, ...right.verifiedLabs])],
    diagnostics: { ...left.diagnostics, ...right.diagnostics },
    evidenceReports: [...left.evidenceReports, ...right.evidenceReports.filter((report) => !left.evidenceReports.some((item) => item.id === report.id))],
    pathId: remoteHasPath ? right.pathId : left.pathId,
    activeLesson: Math.max(left.activeLesson, right.activeLesson),
  };
}
