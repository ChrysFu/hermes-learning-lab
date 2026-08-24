import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Copy,
  Download,
  GitFork,
  GraduationCap,
  Mail,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Wrench,
} from "lucide-react";
import { createProgressRepository, getCloudClient, getCloudConfig, signInWithEmail, signInWithGitHub, signOutCloud } from "./cloudSync";
import { buildPrompt, calculateDomainMastery, evaluateEvidence, learningPaths, mergeProgress, recommendPath } from "./learningEngine";

const diagnosticOptions = {
  goal: [
    { id: "quick", label: "先跑通" },
    { id: "daily", label: "日常助手" },
    { id: "engineering", label: "工程交付" },
  ],
  experience: [
    { id: "beginner", label: "第一次使用" },
    { id: "some", label: "已有基础" },
    { id: "advanced", label: "熟悉 Agent" },
  ],
  channel: [
    { id: "desktop", label: "Desktop" },
    { id: "feishu", label: "飞书" },
    { id: "both", label: "两端都用" },
  ],
};

function SegmentedQuestion({ label, value, options, onChange }) {
  return (
    <fieldset className="route-question">
      <legend>{label}</legend>
      <div>
        {options.map((option) => <button type="button" key={option.id} className={value === option.id ? "is-active" : ""} aria-pressed={value === option.id} onClick={() => onChange(option.id)}>{option.label}</button>)}
      </div>
    </fieldset>
  );
}

export function LearningHub({ lessons, pathId, completed, verifiedLabs, onSelectPath, onNavigate }) {
  const [answers, setAnswers] = useState({ goal: "quick", experience: "beginner", channel: "desktop" });
  const [recommendation, setRecommendation] = useState(null);

  const runDiagnostic = () => {
    const result = recommendPath(answers);
    setRecommendation(result);
    onSelectPath(result.pathId);
  };

  return (
    <div className="hub-view">
      <section className="hub-header">
        <div><span className="section-label">Learning Routes</span><h1>选择一条能产出结果的 Hermes 路线</h1><p>13 节课程保持不变；路线只改变优先顺序。每个节点都要求模拟结果、真实状态或脱敏证据。</p></div>
        <div className="capability-strip" aria-label="练习能力">
          <span className="is-ready"><CheckCircle2 size={15} />浏览器模拟</span>
          <span><SquareTerminal size={15} />本机 Companion</span>
          <span><ClipboardCheck size={15} />证据导入</span>
          <span className={getCloudConfig().configured ? "is-ready" : ""}><Cloud size={15} />可选云同步</span>
        </div>
      </section>

      <section className="route-diagnostic" aria-labelledby="route-diagnostic-title">
        <div className="route-diagnostic-copy"><Sparkles size={19} /><div><span className="section-label">入门诊断</span><h2 id="route-diagnostic-title">用三个选择生成起点</h2><p>推荐不会锁课，你可以随时切换路线或直接打开任意课程。</p></div></div>
        <div className="route-question-grid">
          <SegmentedQuestion label="目标" value={answers.goal} options={diagnosticOptions.goal} onChange={(goal) => setAnswers((current) => ({ ...current, goal }))} />
          <SegmentedQuestion label="经验" value={answers.experience} options={diagnosticOptions.experience} onChange={(experience) => setAnswers((current) => ({ ...current, experience }))} />
          <SegmentedQuestion label="主要入口" value={answers.channel} options={diagnosticOptions.channel} onChange={(channel) => setAnswers((current) => ({ ...current, channel }))} />
        </div>
        <div className="route-diagnostic-action">
          <p aria-live="polite">{recommendation ? recommendation.reason : "完成选择后生成推荐路线与第一节课。"}</p>
          <button className="primary-button" onClick={runDiagnostic}>生成推荐<ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="path-grid" aria-label="学习路线">
        {learningPaths.map((path) => {
          const mastered = path.lessonIds.filter((id) => completed.includes(id) && verifiedLabs.includes(id)).length;
          return (
            <article key={path.id} className={pathId === path.id ? "is-active" : ""}>
              <div className="path-card-heading"><span>{path.id === "quick-start" ? "01" : path.id === "daily-use" ? "02" : "03"}</span><div><h2>{path.label}</h2><small>{mastered} / {path.lessonIds.length} 已掌握</small></div></div>
              <p>{path.summary}</p>
              <div className="path-lesson-chips">{path.lessonIds.map((id) => { const lesson = lessons.find((item) => item.id === id); return <span key={id}>{lesson?.number} {lesson?.title}</span>; })}</div>
              <div className="path-card-actions">
                <button className="text-button" onClick={() => onSelectPath(path.id)}>{pathId === path.id ? <><Check size={14} />当前路线</> : "设为当前路线"}</button>
                <button className="secondary-action" onClick={() => onNavigate(lessons.findIndex((lesson) => lesson.id === path.startLessonId))}>从路线起点开始<ArrowRight size={14} /></button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

const promptTemplates = {
  research: { label: "资料调研", task: "调研 Hermes 的最新官方能力", scope: "只读官方文档与仓库", output: "带来源链接的对比表", constraints: "不安装依赖，不修改本地文件" },
  feishu: { label: "飞书周报", task: "总结本周项目进展", scope: "只读取指定飞书群文件", output: "完成项、阻塞项、下周动作三段摘要", constraints: "不发送消息，不读取其他群聊" },
  skill: { label: "Skill 审查", task: "审查候选 Hermes Skill", scope: "只读取 Skill 文件与声明的依赖", output: "权限、网络、写入和卸载检查表", constraints: "不安装、不执行任何脚本" },
};

const recoveryScenarios = [
  { id: "offline", title: "网页提示 Companion 未连接", prompt: "第一步应该做什么？", options: ["重装 Hermes", "确认本机服务监听 127.0.0.1:43127", "关闭浏览器安全策略"], correct: 1, feedback: "先确认最短链路：服务是否启动、端口是否只监听 loopback，再重新配对。" },
  { id: "feishu", title: "飞书群里机器人不回复", prompt: "优先核对哪组状态？", options: ["主题颜色和头像", "应用发布、事件订阅、Gateway、@提及与白名单", "重新创建模型账号"], correct: 1, feedback: "这五项覆盖从飞书事件到 Hermes Gateway 的完整消息链。" },
  { id: "skill", title: "新 Skill 首次运行越界写入", prompt: "最合适的恢复动作是什么？", options: ["继续观察", "停止回合、撤销变更、收窄工具和路径后重试", "永久允许工具"], correct: 1, feedback: "恢复必须先停止副作用，再撤销、收窄范围并重新做冒烟测试。" },
];

export function PracticeWorkbench({ onEvidenceReport }) {
  const [templateId, setTemplateId] = useState("research");
  const [values, setValues] = useState(promptTemplates.research);
  const [copyState, setCopyState] = useState("idle");
  const [evidence, setEvidence] = useState("");
  const [evidenceResult, setEvidenceResult] = useState(null);
  const [scenarioId, setScenarioId] = useState("offline");
  const [recoveryChoice, setRecoveryChoice] = useState(null);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const prompt = buildPrompt(values);
  const scenario = recoveryScenarios.find((item) => item.id === scenarioId);

  const selectTemplate = (id) => { setTemplateId(id); setValues(promptTemplates[id]); };
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 1200);
  };
  const scoreEvidence = () => {
    const result = evaluateEvidence(evidence);
    setEvidenceResult(result);
    onEvidenceReport({ id: `${Date.now()}`, score: result.score, passed: result.passed, matched: result.matched, createdAt: new Date().toISOString() });
  };
  const importFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEvidence((await file.text()).slice(0, 20000));
    setEvidenceResult(null);
  };

  return (
    <div className="workbench-view">
      <section className="workbench-header"><span className="section-label">Practice Workbench</span><h1>把任务写清楚，再用证据结束</h1><p>工作台不会执行 Prompt 或上传证据；生成、检查和评分都在当前浏览器完成。</p></section>

      <section className="prompt-workbench" aria-labelledby="prompt-workbench-title">
        <div className="workbench-section-heading"><div><Wrench size={18} /><span><small>01</small><h2 id="prompt-workbench-title">Prompt 契约生成器</h2></span></div><div className="template-tabs">{Object.entries(promptTemplates).map(([id, item]) => <button key={id} className={templateId === id ? "is-active" : ""} onClick={() => selectTemplate(id)}>{item.label}</button>)}</div></div>
        <div className="prompt-builder-layout">
          <div className="prompt-fields">
            {[{ id: "task", label: "任务" }, { id: "scope", label: "允许范围" }, { id: "output", label: "验收结果" }, { id: "constraints", label: "约束" }].map((field) => <label key={field.id}><span>{field.label}</span><textarea value={values[field.id]} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} /></label>)}
          </div>
          <div className="prompt-preview"><div><strong>生成结果</strong><button className="icon-button" onClick={copyPrompt} aria-label={copyState === "error" ? "复制失败" : copyState === "copied" ? "Prompt 已复制" : "复制 Prompt"} title={copyState === "error" ? "复制失败" : copyState === "copied" ? "Prompt 已复制" : "复制 Prompt"}>{copyState === "copied" ? <Check size={16} /> : copyState === "error" ? <AlertTriangle size={16} /> : <Copy size={16} />}</button></div><pre>{prompt}</pre><p><ShieldCheck size={14} />已加入停止条件与越界确认。</p></div>
        </div>
      </section>

      <section className="evidence-workbench" aria-labelledby="evidence-title">
        <div className="workbench-section-heading"><div><ClipboardCheck size={18} /><span><small>02</small><h2 id="evidence-title">脱敏实验结果评分</h2></span></div><label className="file-import"><Download size={14} />导入 TXT / JSON<input type="file" accept=".txt,.json,text/plain,application/json" onChange={importFile} /></label></div>
        <div className="evidence-layout">
          <label><span>粘贴 Hermes 版本、Doctor、固定回执、运行状态与恢复记录</span><textarea value={evidence} onChange={(event) => { setEvidence(event.target.value); setEvidenceResult(null); }} placeholder={'Hermes v0.20.5\nDoctor: pass\nDESKTOP_OK\nGateway: running\nRecovery: gateway stopped'} /></label>
          <div className="evidence-score">
            <strong>{evidenceResult ? evidenceResult.score : 0}<small>/100</small></strong>
            <div>{["version", "doctor", "receipt", "runtime", "recovery"].map((id) => <span key={id} className={evidenceResult?.matched.includes(id) ? "is-done" : ""}>{evidenceResult?.matched.includes(id) ? <Check size={12} /> : null}{id}</span>)}</div>
            {evidenceResult ? <p className={evidenceResult.passed ? "is-success" : "is-error"}>{evidenceResult.feedback.join(" ")}</p> : <p>结果仅保存在本机，疑似密钥会使评分归零。</p>}
            <button className="primary-button" onClick={scoreEvidence} disabled={!evidence.trim()}><Play size={14} />运行评分</button>
          </div>
        </div>
      </section>

      <section className="recovery-workbench" aria-labelledby="recovery-title">
        <div className="workbench-section-heading"><div><RotateCcw size={18} /><span><small>03</small><h2 id="recovery-title">故障恢复演练</h2></span></div><div className="template-tabs">{recoveryScenarios.map((item) => <button key={item.id} className={scenarioId === item.id ? "is-active" : ""} onClick={() => { setScenarioId(item.id); setRecoveryChoice(null); setRecoveryResult(null); }}>{item.title}</button>)}</div></div>
        <div className="recovery-scenario"><div><span>症状</span><h3>{scenario.title}</h3><p>{scenario.prompt}</p></div><div className="recovery-options">{scenario.options.map((option, index) => <button key={option} className={recoveryChoice === index ? "is-selected" : ""} onClick={() => { setRecoveryChoice(index); setRecoveryResult(null); }}><span>{recoveryChoice === index ? <Check size={12} /> : null}</span>{option}</button>)}</div><div className={`recovery-feedback ${recoveryResult === false ? "is-error" : recoveryResult ? "is-success" : ""}`} aria-live="polite">{recoveryResult === null ? "选择恢复动作后检查。" : recoveryResult ? <><CheckCircle2 size={15} />{scenario.feedback}</> : <><AlertTriangle size={15} />先缩小故障域，不要同时重装或放宽安全边界。</>}<button className="secondary-action" disabled={recoveryChoice === null} onClick={() => setRecoveryResult(recoveryChoice === scenario.correct)}>检查恢复动作</button></div></div>
      </section>
    </div>
  );
}

function downloadReport(progress, domains) {
  const lines = ["# Hermes Learning Report", "", `Generated: ${new Date().toISOString()}`, `Path: ${learningPaths.find((path) => path.id === progress.pathId)?.label || progress.pathId}`, "", "## Domain mastery", ...domains.map((domain) => `- ${domain.label}: ${domain.score}%`), "", `Post-checks: ${progress.completed.length}`, `Verified labs: ${progress.verifiedLabs.length}`, `Evidence reports: ${progress.evidenceReports.length}`];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "hermes-learning-report.md"; anchor.click(); URL.revokeObjectURL(url);
}

function CloudSyncPanel({ progress, onMerge }) {
  const configured = getCloudConfig().configured;
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(configured ? "checking" : "unavailable");

  useEffect(() => {
    if (!configured) return undefined;
    let subscription;
    getCloudClient().then(async (client) => {
      const { data } = await client.auth.getSession();
      setUser(data.session?.user || null);
      setStatus(data.session ? "ready" : "signed-out");
      subscription = client.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); setStatus(session ? "ready" : "signed-out"); }).data.subscription;
    }).catch(() => setStatus("error"));
    return () => subscription?.unsubscribe();
  }, [configured]);

  const emailSignIn = async () => { setStatus("sending"); try { const { error } = await signInWithEmail(email); if (error) throw error; setStatus("email-sent"); } catch { setStatus("error"); } };
  const githubSignIn = async () => { setStatus("sending"); try { const { error } = await signInWithGitHub(); if (error) throw error; } catch { setStatus("error"); } };
  const sync = async () => { setStatus("syncing"); try { const client = await getCloudClient(); const repository = createProgressRepository(client); const remote = await repository.load(user.id); const merged = mergeProgress(progress, remote || {}); await repository.save(user.id, merged); onMerge(merged); setStatus("synced"); } catch { setStatus("error"); } };
  const signOut = async () => { await signOutCloud(); setUser(null); setStatus("signed-out"); };

  return (
    <section className="cloud-sync-panel">
      <div><Cloud size={19} /><span><span className="section-label">Optional Sync</span><h2>跨设备进度</h2></span></div>
      {!configured ? <p>当前部署未配置 Supabase，所有课程仍可离线完整使用。仓库已提供迁移、RLS 与部署变量说明。</p> : null}
      {configured && !user ? <><p>使用 GitHub 或邮箱登录；只同步课程进度，不同步 Prompt、原始证据或 Hermes 数据。</p><div className="cloud-auth-actions"><button className="secondary-action" onClick={githubSignIn}><GitFork size={15} />使用 GitHub</button><div><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" aria-label="同步邮箱" /><button className="secondary-action" onClick={emailSignIn} disabled={!email.includes("@")}><Mail size={15} />发送登录链接</button></div></div></> : null}
      {user ? <div className="cloud-user"><p><CheckCircle2 size={15} />已登录 {user.email || "GitHub 用户"}</p><div><button className="primary-button" onClick={sync}>合并并同步</button><button className="text-button" onClick={signOut}>退出</button></div></div> : null}
      <small aria-live="polite">{status === "email-sent" ? "登录链接已发送，请检查邮箱。" : status === "synced" ? "本机与云端进度已合并。" : status === "error" ? "同步失败，本地进度未受影响。" : status === "syncing" ? "正在合并进度…" : "本地优先 · 登录可选"}</small>
    </section>
  );
}

export function LearningReport({ progress, onMerge }) {
  const domains = calculateDomainMastery(progress.completed, progress.verifiedLabs);
  const overall = Math.round(domains.reduce((sum, domain) => sum + domain.score, 0) / domains.length);
  return (
    <div className="report-view">
      <section className="report-header"><div><span className="section-label">Mastery Report</span><h1>掌握度来自两种证据</h1><p>课后检查证明理解，实验验收证明真实操作；两者缺一不可。</p></div><button className="secondary-action" onClick={() => downloadReport(progress, domains)}><Download size={15} />导出报告</button></section>
      <section className="report-summary"><div className="report-score"><strong>{overall}%</strong><span>综合掌握度</span></div><div><span><strong>{progress.completed.length}</strong>课后检查</span><span><strong>{progress.verifiedLabs.length}</strong>实验验收</span><span><strong>{progress.evidenceReports.length}</strong>证据评分</span></div></section>
      <section className="mastery-grid">{domains.map((domain) => <article key={domain.id}><div><GraduationCap size={17} /><strong>{domain.label}</strong><span>{domain.score}%</span></div><div className="mastery-bar"><span style={{ width: `${domain.score}%` }} /></div><p>{domain.completed} 次课后检查 · {domain.verified} 次实验验收</p></article>)}</section>
      <CloudSyncPanel progress={progress} onMerge={onMerge} />
    </div>
  );
}
