import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Apple,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FlaskConical,
  GitFork,
  GraduationCap,
  Laptop,
  Layers3,
  ListChecks,
  Menu,
  MessageCircle,
  MousePointerClick,
  MonitorDown,
  Play,
  Plus,
  RefreshCcw,
  Send,
  ShieldCheck,
  ScanLine,
  SquareTerminal,
  Terminal,
  Wifi,
  X,
} from "lucide-react";
import { architectureLayers, courseMetadata, learningResources, lessons, onboardingTracks, phases, repositories, surfaceGuides } from "./data";
import { learningPaths, migrateProgress, searchLessons } from "./learningEngine";
import { LearningHub, LearningReport, PracticeWorkbench } from "./learningViews";
import { checkCompanion, companionServiceUrl, discoverCompanion, hasCompanionToken, pairCompanion, revokeCompanion } from "./localCompanion";

const STORAGE_KEY = "hermes-learning-lab-progress-v4";
const PREVIOUS_STORAGE_KEYS = ["hermes-learning-lab-progress-v3", "hermes-learning-lab-progress-v2", "hermes-learning-lab-progress-v1"];
function readProgress() {
  for (const key of [STORAGE_KEY, ...PREVIOUS_STORAGE_KEYS]) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (stored && Array.isArray(stored.completed)) return migrateProgress(stored);
    } catch {
      // Invalid local data must never block the course.
    }
  }
  return migrateProgress();
}

function ProgressRing({ value }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="progress-ring" aria-label={`总掌握度 ${value}%`}>
      <svg viewBox="0 0 92 92" aria-hidden="true">
        <circle className="progress-ring-track" cx="46" cy="46" r={radius} />
        <circle className="progress-ring-value" cx="46" cy="46" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function CourseSidebar({ activeIndex, completed, verifiedLabs, onSelect, open, onClose }) {
  const [query, setQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const mastered = lessons.filter((lesson) => completed.includes(lesson.id) && verifiedLabs.includes(lesson.id));
  const shownLessons = searchLessons(lessons, query, filterId);
  return (
    <>
      {open ? <button className="sidebar-scrim" aria-label="关闭课程导航" onClick={onClose} /> : null}
      <aside className={`course-sidebar ${open ? "is-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark"><Bot size={17} /></div>
          <div><strong>HERMES LAB</strong><span>交互式系统课程</span></div>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="关闭课程导航"><X size={18} /></button>
        </div>

        <div className="course-progress-copy"><span>双证据掌握</span><strong>{mastered.length} / {lessons.length}</strong></div>
        <div className="linear-progress" aria-hidden="true"><span style={{ width: `${(mastered.length / lessons.length) * 100}%` }} /></div>

        <div className="sidebar-search">
          <label><span>搜索课程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如 飞书、Memory、恢复" /></label>
          <select aria-label="筛选学习路线" value={filterId} onChange={(event) => setFilterId(event.target.value)}>
            <option value="all">全部 13 课</option>
            {learningPaths.map((path) => <option key={path.id} value={path.id}>{path.label}</option>)}
          </select>
        </div>

        <nav className="lesson-nav" aria-label="课程目录">
          {phases.map((phase) => {
            const phaseLessons = shownLessons.filter((lesson) => lesson.phaseId === phase.id);
            if (!phaseLessons.length) return null;
            const phaseDone = phaseLessons.filter((lesson) => completed.includes(lesson.id) && verifiedLabs.includes(lesson.id)).length;
            return (
              <div className="phase-group" key={phase.id}>
                <div className="phase-heading">
                  <span>阶段 {phase.number} · {phase.title}</span>
                  <small>{phaseDone}/{phaseLessons.length}</small>
                </div>
                {phaseLessons.map((lesson) => {
                  const index = lessons.findIndex((item) => item.id === lesson.id);
                  const isComplete = completed.includes(lesson.id) && verifiedLabs.includes(lesson.id);
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={lesson.id}
                      className={`lesson-link ${isActive ? "is-active" : ""}`}
                      onClick={() => { onSelect(index); onClose(); }}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span className="lesson-index">{isComplete ? <Check size={13} /> : lesson.number}</span>
                      <span><strong>{lesson.title}</strong></span>
                      <ChevronRight size={15} />
                    </button>
                  );
                })}
              </div>
            );
          })}
          {!shownLessons.length ? <p className="sidebar-empty">没有匹配的课程。</p> : null}
        </nav>

        <div className="source-note"><GitFork size={14} /><span>官方资料 + AI-For-Beginners 教学法</span></div>
      </aside>
    </>
  );
}

function AppTopbar({ view, setView, lesson, phase, onOpenMenu }) {
  const tabs = [
    { id: "hub", label: "路线", icon: GraduationCap },
    { id: "course", label: "课程", icon: BookOpen },
    { id: "workbench", label: "练习台", icon: FlaskConical },
    { id: "report", label: "报告", icon: ListChecks },
    { id: "research", label: "资料研究", icon: GitFork },
    { id: "architecture", label: "教学架构", icon: Layers3 },
  ];

  return (
    <header className="app-topbar">
      <div className="topbar-context">
        <button className="icon-button menu-button" onClick={onOpenMenu} aria-label="打开课程导航"><Menu size={19} /></button>
        <span>{view === "course" ? `${phase.title} / ${lesson.number} ${lesson.title}` : "Hermes Learning Lab"}</span>
      </div>
      <div className="view-tabs" role="tablist" aria-label="视图">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} role="tab" aria-label={tab.label} title={tab.label} aria-selected={view === tab.id} className={view === tab.id ? "is-active" : ""} onClick={() => setView(tab.id)}>
              <Icon size={15} /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <span className="save-state"><span />本地自动保存</span>
    </header>
  );
}

function TracePanel({ lesson }) {
  return (
    <div className="trace-strip" aria-label="Hermes 回合轨迹">
      {lesson.trace.map((item, index) => (
        <div key={item}>
          <span>{index + 1}</span><p>{item}</p>{index < lesson.trace.length - 1 ? <ArrowRight size={14} /> : null}
        </div>
      ))}
    </div>
  );
}

function PreQuiz({ lesson, result, onResult }) {
  const [selection, setSelection] = useState("");
  const [revealed, setRevealed] = useState(Boolean(result));
  const passed = selection === lesson.preQuiz.correct;

  const submit = () => {
    if (!selection) return;
    setRevealed(true);
    onResult(passed);
  };

  return (
    <section className="diagnostic-panel" aria-labelledby="diagnostic-title">
      <div className="diagnostic-heading">
        <div><span className="section-label">课前诊断</span><h2 id="diagnostic-title">先判断，再开始</h2></div>
        <span className={`diagnostic-state ${result ? "is-done" : ""}`}>{result ? "已记录" : "不计分"}</span>
      </div>
      <p>{lesson.preQuiz.prompt}</p>
      <div className="diagnostic-options">
        {lesson.preQuiz.options.map((item) => (
          <button key={item.id} className={selection === item.id ? "is-selected" : ""} onClick={() => { setSelection(item.id); setRevealed(false); }} aria-pressed={selection === item.id}>
            <span>{selection === item.id ? <Check size={13} /> : null}</span>
            <strong>{item.label}</strong><small>{item.detail}</small>
          </button>
        ))}
      </div>
      <div className="diagnostic-footer">
        <span className={revealed ? (passed ? "is-success" : "is-review") : ""} aria-live="polite">
          {revealed ? (passed ? `判断正确。${lesson.preQuiz.explanation}` : `建议带着问题学习：${lesson.preQuiz.explanation}`) : "用于激活已有知识，不影响课程解锁。"}
        </span>
        <button className="text-button diagnostic-submit" onClick={submit} disabled={!selection}>提交判断<ArrowRight size={14} /></button>
      </div>
    </section>
  );
}

function BuilderFields({ fields, values, setValues }) {
  return (
    <div className="builder-fields">
      {fields.map((field) => (
        <label key={field.id}>
          <span>{field.label}</span>
          {field.type === "select" ? (
            <select id={`builder-${field.id}`} name={field.id} value={values[field.id] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}>
              <option value="">请选择</option>
              {field.options.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          ) : (
            <input id={`builder-${field.id}`} name={field.id} value={values[field.id] || ""} placeholder={field.placeholder} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} />
          )}
        </label>
      ))}
    </div>
  );
}

const trackIcons = {
  desktop: MonitorDown,
  mac: Apple,
  windows: Laptop,
  wsl: SquareTerminal,
  feishu: MessageCircle,
};

function CommandBlock({ command }) {
  const [copyState, setCopyState] = useState("idle");

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const copyLabel = copyState === "copied" ? "命令已复制" : copyState === "error" ? "复制失败，请手动选择命令" : "复制命令";

  return (
    <div className="setup-command">
      <Terminal size={14} />
      <code>{command}</code>
      <button className={`icon-button copy-${copyState}`} onClick={copyCommand} aria-label={copyLabel} title={copyLabel}>
        {copyState === "copied" ? <Check size={15} /> : copyState === "error" ? <AlertTriangle size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

function InstallGuide() {
  const [activeId, setActiveId] = useState("desktop");
  const track = onboardingTracks.find((item) => item.id === activeId);
  const TrackIcon = trackIcons[track.id];

  return (
    <section className="install-guide" aria-labelledby="install-guide-title">
      <div className="section-heading-row">
        <div><span className="section-label">安装导航</span><h2 id="install-guide-title">选择你的安装与接入方式</h2></div>
        <a href="https://hermes-agent.nousresearch.com/docs/getting-started/installation" target="_blank" rel="noreferrer">官方安装文档<ExternalLink size={13} /></a>
      </div>

      <div className="install-track-tabs" role="tablist" aria-label="安装方式">
        {onboardingTracks.map((item) => {
          const Icon = trackIcons[item.id];
          return (
            <button key={item.id} role="tab" aria-selected={activeId === item.id} className={activeId === item.id ? "is-active" : ""} onClick={() => setActiveId(item.id)}>
              <Icon size={17} /><span>{item.label}</span>{item.recommended ? <small>推荐</small> : null}
            </button>
          );
        })}
      </div>

      <div className="install-track-content" role="tabpanel">
        <div className="install-track-intro">
          <div className="install-track-icon"><TrackIcon size={22} /></div>
          <div><h3>{track.title}</h3><p>{track.summary}</p></div>
        </div>
        <ol className="install-step-list">
          {track.steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
                {step.command ? <CommandBlock command={step.command} /> : null}
                {step.url ? <a className="inline-action" href={step.url} target="_blank" rel="noreferrer"><Download size={14} />{step.action}<ExternalLink size={12} /></a> : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="install-verify"><CheckCircle2 size={17} /><div><strong>完成标志</strong><span>{track.verify}</span></div><a href={track.docs} target="_blank" rel="noreferrer" aria-label={`查看 ${track.label} 官方文档`}><ExternalLink size={15} /></a></div>
      </div>
    </section>
  );
}

function DesktopInterfaceReference({ guide }) {
  const [activeId, setActiveId] = useState(guide.hotspots[0].id);
  const active = guide.hotspots.find((item) => item.id === activeId);

  return (
    <div className="desktop-reference">
      <div className="reference-image-wrap">
        <img src={guide.image} alt={guide.imageAlt} />
        {guide.hotspots.map((item) => (
          <button
            key={item.id}
            className={`reference-marker ${activeId === item.id ? "is-active" : ""}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => setActiveId(item.id)}
            aria-label={`查看界面位置 ${item.number}：${item.label}`}
          >
            {item.number}
          </button>
        ))}
      </div>
      <div className="reference-legend">
        {guide.hotspots.map((item) => (
          <button key={item.id} className={activeId === item.id ? "is-active" : ""} onClick={() => setActiveId(item.id)}>
            <span>{item.number}</span><strong>{item.label}</strong>
          </button>
        ))}
        <div className="reference-detail"><MousePointerClick size={16} /><div><strong>{active.label}</strong><p>{active.detail}</p></div></div>
      </div>
    </div>
  );
}

function FeishuInterfaceReference({ guide }) {
  return (
    <div className="feishu-route-reference">
      {guide.routes.map((route) => (
        <article key={route.title}>
          <div className="route-heading"><span>{route.title === "开发者控制台" ? "CONFIG" : "CLIENT"}</span><h3>{route.title}</h3></div>
          <ol>
            {route.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}
          </ol>
        </article>
      ))}
    </div>
  );
}

function LocalOperationVerifier({ surface, guide }) {
  const [serviceState, setServiceState] = useState("checking");
  const [pairingCode, setPairingCode] = useState("");
  const [probe, setProbe] = useState(null);
  const [receipt, setReceipt] = useState("");
  const [receiptState, setReceiptState] = useState("idle");

  useEffect(() => {
    let active = true;
    discoverCompanion()
      .then(() => { if (active) setServiceState(hasCompanionToken() ? "paired" : "unpaired"); })
      .catch(() => { if (active) setServiceState("offline"); });
    return () => { active = false; };
  }, []);

  const pair = async () => {
    if (!pairingCode.trim()) return;
    setServiceState("pairing");
    try {
      await pairCompanion(pairingCode);
      setPairingCode("");
      setServiceState("paired");
    } catch (error) {
      setServiceState(error.code === "invalid_pairing_code" ? "invalid-code" : "offline");
    }
  };

  const runProbe = async () => {
    setServiceState("checking");
    try {
      setProbe(await checkCompanion());
      setServiceState("done");
    } catch (error) {
      setProbe(null);
      setServiceState(error.code === "confirmation_denied" ? "denied" : error.code === "confirmation_timeout" ? "timeout" : error.code === "pairing_required" ? "unpaired" : "offline");
    }
  };

  const revoke = async () => {
    try { await revokeCompanion(); } catch {
      // Clear the browser token even if the service has already stopped.
    } finally {
      setProbe(null);
      setServiceState("unpaired");
    }
  };

  const verifyReceipt = () => {
    setReceiptState(receipt.trim().toUpperCase() === guide.expected ? "success" : "error");
  };

  const probeItems = probe ? [
    { label: "Hermes CLI", value: probe.hermesInstalled, detail: probe.hermesInstalled ? "已在 PATH 中发现" : "未在 PATH 中发现" },
    { label: "Desktop 进程", value: probe.desktopRunning, detail: probe.desktopRunning ? "应用正在运行" : "未检测到运行进程" },
    { label: "Gateway", value: probe.gatewayRunning, detail: probe.gatewayRunning ? "状态为运行中" : "未确认运行状态" },
  ] : [];

  return (
    <div className="real-verifier">
      <div className="probe-panel">
        <div className="verifier-heading"><ScanLine size={17} /><div><strong>本机只读检测</strong><span>仅在点击时检查命令、Desktop 进程和 Gateway 状态</span></div></div>
        {serviceState === "checking" ? <p className="probe-note">正在寻找本机伴随服务…</p> : null}
        {serviceState === "offline" ? <div className="static-mode-note"><ShieldCheck size={15} /><span><strong>本机伴随服务未连接</strong>在线课程仍可继续；启动本机服务后，页面才能读取脱敏状态。<a href={`${import.meta.env.BASE_URL}downloads/start-hermes-lab.command`} download>下载 macOS 启动脚本</a> · <a href={`${import.meta.env.BASE_URL}downloads/start-hermes-lab.ps1`} download>下载 Windows 启动脚本</a><small>也可在项目目录运行 <code>npm run local:bridge</code>。</small></span></div> : null}
        {serviceState === "unpaired" || serviceState === "invalid-code" ? <div className="pairing-box"><p><strong>先配对这台浏览器</strong>从本机伴随服务终端复制一次性配对码；配对关系会持续到你手动解除。</p><div className="pairing-input-row"><input aria-label="本机伴随服务配对码" value={pairingCode} onChange={(event) => setPairingCode(event.target.value)} placeholder="例如 ABCD-2345" /><button className="secondary-action" onClick={pair} disabled={!pairingCode.trim()}>配对</button></div>{serviceState === "invalid-code" ? <span className="probe-feedback is-error"><AlertTriangle size={14} />配对码无效或已轮换，请从终端复制最新配对码。</span> : null}</div> : null}
        {serviceState === "pairing" ? <p className="probe-note">正在配对本机伴随服务…</p> : null}
        {serviceState === "paired" ? <div className="paired-actions"><button className="secondary-action" onClick={runProbe}>检测本机状态</button><button className="text-button" onClick={revoke}>解除配对</button><p className="probe-note">服务地址：{companionServiceUrl}。每次检测前都需要在本机终端确认。</p></div> : null}
        {serviceState === "checking" && hasCompanionToken() ? <p className="probe-note">等待本机终端确认本次读取…</p> : null}
        {serviceState === "denied" ? <p className="probe-feedback is-error"><AlertTriangle size={14} />本次检测被终端拒绝；允许后重新点击“检测本机状态”。</p> : null}
        {serviceState === "timeout" ? <p className="probe-feedback is-error"><AlertTriangle size={14} />等待终端确认超时；请保持伴随服务运行后重试。</p> : null}
        {serviceState === "offline" ? <p className="probe-note">不会读取配置文件、密钥、会话或飞书消息。</p> : null}
        {serviceState === "done" ? (
          <div className="probe-results">
            {probeItems.map((item) => <div key={item.label} className={item.value ? "is-success" : ""}>{item.value ? <CheckCircle2 size={15} /> : <Circle size={15} />}<span><strong>{item.label}</strong><small>{item.detail}</small></span></div>)}
            <div><Circle size={15} /><span><strong>版本 / Doctor</strong><small>{probe.hermesVersion} · {probe.doctor?.summary}</small></span></div>
          </div>
        ) : null}
      </div>

      <div className="receipt-panel">
        <div className="verifier-heading"><ClipboardCheck size={17} /><div><strong>真实回执验收</strong><span>在 {surface === "desktop" ? "Hermes Desktop" : "飞书"} 执行，再粘贴 Agent 的完整回复</span></div></div>
        <CommandBlock command={guide.verificationPrompt} />
        <label><span>Hermes 回复</span><input value={receipt} onChange={(event) => { setReceipt(event.target.value); setReceiptState("idle"); }} placeholder={`预期仅返回 ${guide.expected}`} /></label>
        <div className="receipt-actions">
          <span className={`probe-feedback is-${receiptState}`} aria-live="polite">
            {receiptState === "idle" ? "只粘贴回复，不要粘贴 Prompt 或任何凭据。" : null}
            {receiptState === "success" ? <><CheckCircle2 size={14} />回执匹配，真实消息链路已通过。</> : null}
            {receiptState === "error" ? <><AlertTriangle size={14} />回执不匹配；检查模型响应、@提及或 Gateway 状态。</> : null}
          </span>
          <button className="primary-button" onClick={verifyReceipt} disabled={!receipt.trim()}>验证回执</button>
        </div>
      </div>
    </div>
  );
}

function RealInterfaceGuide() {
  const [surface, setSurface] = useState("desktop");
  const guide = surfaceGuides[surface];

  return (
    <section className="real-interface-guide" aria-labelledby="real-interface-title">
      <div className="section-heading-row">
        <div><span className="section-label">真实界面陪练</span><h2 id="real-interface-title">从页面地标到真实操作回执</h2></div>
        <div className="surface-switch" role="tablist" aria-label="真实界面指南">
          <button role="tab" aria-selected={surface === "desktop"} className={surface === "desktop" ? "is-active" : ""} onClick={() => setSurface("desktop")}><MonitorDown size={15} />Desktop</button>
          <button role="tab" aria-selected={surface === "feishu"} className={surface === "feishu" ? "is-active" : ""} onClick={() => setSurface("feishu")}><MessageCircle size={15} />飞书</button>
        </div>
      </div>

      <div className="real-interface-intro"><div><strong>{guide.title}</strong><p>{guide.summary}</p></div><a href={guide.docs} target="_blank" rel="noreferrer">打开官方操作文档<ExternalLink size={13} /></a></div>
      {surface === "desktop" ? <DesktopInterfaceReference guide={guide} /> : <FeishuInterfaceReference guide={guide} />}

      <div className="real-operation-steps">
        {guide.steps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.body}</p></div></article>)}
      </div>
      <div className="reference-source"><ShieldCheck size={15} /><span>{guide.sourceNote}</span><a href={guide.sourceUrl} target="_blank" rel="noreferrer">{guide.sourceLabel}<ExternalLink size={12} /></a></div>
      <LocalOperationVerifier key={surface} surface={surface} guide={guide} />
    </section>
  );
}

function DesktopSimulator() {
  const [stage, setStage] = useState(0);
  const [model, setModel] = useState("");

  const reset = () => {
    setStage(0);
    setModel("");
  };

  return (
    <div className="desktop-simulator">
      <div className="sim-window-bar"><span /><span /><span /><strong>Hermes Desktop · 模拟</strong></div>
      <div className="desktop-sim-layout">
        <aside>
          <div className="sim-brand"><Bot size={16} />Hermes</div>
          <button onClick={() => setStage(1)} disabled={stage > 0}><Plus size={14} />新建会话</button>
          <span className={stage > 0 ? "is-active" : ""}>安装体验</span>
          <small>今天</small>
        </aside>
        <div className="desktop-sim-main">
          <header>
            <div><strong>{stage === 0 ? "尚未创建会话" : "安装体验"}</strong><small>{model || "请选择模型"}</small></div>
            <label>模型<select aria-label="桌面模拟模型" value={model} disabled={stage === 0 || stage >= 3} onChange={(event) => { setModel(event.target.value); if (event.target.value) setStage(2); }}><option value="">请选择</option><option value="Hermes 4.3">Hermes 4.3</option><option value="Portal Auto">Portal Auto</option></select></label>
          </header>
          <div className="desktop-sim-chat">
            {stage === 0 ? <div className="sim-empty"><MonitorDown size={25} /><strong>从一个新会话开始</strong><span>桌面端与 CLI 共享相同配置和会话。</span></div> : null}
            {stage >= 1 ? <div className="sim-message is-system"><Bot size={15} /><p>新会话已创建。选择一个模型后即可发送任务。</p></div> : null}
            {stage >= 3 ? <div className="sim-message is-user"><p>请读取当前项目的 README，并给出三点改进建议。</p></div> : null}
            {stage === 3 ? (
              <div className="sim-approval">
                <div><ShieldCheck size={17} /><span><strong>请求工具权限</strong><small>File · 读取 README.md</small></span></div>
                <div><button className="secondary-action" onClick={() => setStage(2)}>拒绝</button><button className="primary-button" onClick={() => setStage(4)}>仅允许本次</button></div>
              </div>
            ) : null}
            {stage >= 4 ? <div className="sim-message is-system"><Bot size={15} /><p>读取完成。建议补充安装前提、飞书权限清单和失败恢复步骤；未修改任何文件。</p></div> : null}
          </div>
          <footer>
            {stage === 2 ? <button className="primary-button" onClick={() => setStage(3)}><Send size={14} />发送示例任务</button> : null}
            {stage === 0 ? <span>先点击左侧“新建会话”</span> : null}
            {stage === 1 ? <span>下一步：从右上角选择模型</span> : null}
            {stage === 3 ? <span>审查工具、路径与权限范围</span> : null}
            {stage === 4 ? <><span className="is-complete"><CheckCircle2 size={14} />桌面端练习完成</span><button className="text-button" onClick={reset}><RefreshCcw size={13} />重新练习</button></> : null}
          </footer>
        </div>
      </div>
    </div>
  );
}

function FeishuSimulator() {
  const [stage, setStage] = useState("ready");

  const sendMention = () => setStage("approval");
  const reset = () => setStage("ready");

  return (
    <div className="feishu-simulator">
      <div className="feishu-header"><div className="feishu-logo"><MessageCircle size={18} /></div><div><strong>项目协作群</strong><span><Wifi size={12} />Hermes Gateway 已连接</span></div></div>
      <div className="feishu-chat">
        <div className="feishu-message"><span className="avatar is-user">陈</span><div><strong>陈晓</strong><p>今天的项目周报已经上传。</p></div></div>
        {stage === "ignored" ? <div className="feishu-message"><span className="avatar is-user">你</span><div><strong>你</strong><p>帮我总结项目周报</p><small>机器人没有响应：群聊默认要求 @提及。</small></div></div> : null}
        {["approval", "complete", "denied"].includes(stage) ? <div className="feishu-message"><span className="avatar is-user">你</span><div><strong>你</strong><p><b>@Hermes</b> 帮我总结项目周报</p></div></div> : null}
        {["approval", "denied"].includes(stage) ? (
          <div className="feishu-message is-bot"><span className="avatar is-bot"><Bot size={15} /></span><div className="feishu-card"><strong>Hermes 请求授权</strong><p>需要读取群文件《项目周报.md》以生成摘要。</p><dl><div><dt>工具</dt><dd>Feishu File</dd></div><div><dt>范围</dt><dd>仅此文件</dd></div></dl>{stage === "denied" ? <small>已拒绝，本次未读取文件。</small> : <div className="feishu-card-actions"><button onClick={() => setStage("denied")}>拒绝</button><button onClick={() => setStage("complete")}>仅允许这一次</button></div>}</div></div>
        ) : null}
        {stage === "complete" ? <div className="feishu-message is-bot"><span className="avatar is-bot"><Bot size={15} /></span><div><strong>Hermes</strong><p>周报摘要：本周完成登录重构；当前阻塞为测试环境配额；下周优先完成灰度发布。</p><small className="delivery-state"><CheckCircle2 size={12} />已完成 · 未修改群文件</small></div></div> : null}
      </div>
      <div className="feishu-actions">
        {stage === "ready" ? <><button className="secondary-action" onClick={() => setStage("ignored")}>直接发送</button><button className="primary-button" onClick={sendMention}><Send size={14} />@Hermes 发送</button></> : null}
        {stage === "ignored" ? <><span>观察到 Mention Gate：未 @ 不触发。</span><button className="primary-button" onClick={sendMention}>改为 @Hermes 发送</button></> : null}
        {stage === "approval" ? <span>在消息卡片中审查工具和范围。</span> : null}
        {stage === "denied" ? <><span>拒绝不会产生副作用。</span><button className="text-button" onClick={reset}><RefreshCcw size={13} />重新练习</button></> : null}
        {stage === "complete" ? <><span className="is-complete"><CheckCircle2 size={14} />飞书端练习完成</span><button className="text-button" onClick={reset}><RefreshCcw size={13} />重新练习</button></> : null}
      </div>
    </div>
  );
}

function InteractionPractice() {
  const [surface, setSurface] = useState("desktop");
  return (
    <section className="surface-practice" aria-labelledby="surface-practice-title">
      <div className="section-heading-row">
        <div><span className="section-label">多端模拟练习</span><h2 id="surface-practice-title">先在安全沙盒熟悉操作</h2></div>
        <div className="surface-switch" role="tablist" aria-label="模拟终端">
          <button role="tab" aria-selected={surface === "desktop"} className={surface === "desktop" ? "is-active" : ""} onClick={() => setSurface("desktop")}><MonitorDown size={15} />桌面端</button>
          <button role="tab" aria-selected={surface === "feishu"} className={surface === "feishu" ? "is-active" : ""} onClick={() => setSurface("feishu")}><MessageCircle size={15} />飞书端</button>
        </div>
      </div>
      <p className="surface-intro">{surface === "desktop" ? "依次完成新建会话、选择模型、发送任务和最小权限审批。" : "体验群聊 @提及门、文件读取审批和结果交付。"}</p>
      {surface === "desktop" ? <DesktopSimulator /> : <FeishuSimulator />}
    </section>
  );
}

function LabBrief({ lab, verified, onVerify }) {
  const [checked, setChecked] = useState(() => verified ? lab.successCriteria : []);
  const allChecked = checked.length === lab.successCriteria.length;

  const toggleCriterion = (criterion) => {
    if (verified) return;
    setChecked((current) => current.includes(criterion) ? current.filter((item) => item !== criterion) : [...current, criterion]);
  };

  return (
    <section className="lab-brief" aria-labelledby="lab-title">
      <div className="lab-title-row"><FlaskConical size={18} /><div><span className="section-label">可执行实验</span><h2 id="lab-title">{lab.task}</h2></div></div>
      <div className="lab-anatomy">
        <div><strong>输入</strong><p>{lab.input}</p></div>
        <div><strong>操作步骤</strong><ol>{lab.procedure.map((item) => <li key={item}>{item}</li>)}</ol></div>
        <div><strong>成功标准</strong><ul>{lab.successCriteria.map((item) => <li key={item}><CheckCircle2 size={14} />{item}</li>)}</ul></div>
      </div>
      <div className="lab-verification">
        <div className="lab-verification-heading"><div><span className="section-label">操作结果检验</span><h3>按真实结果逐项核对</h3></div><span>{checked.length} / {lab.successCriteria.length}</span></div>
        <div className="verification-checklist">
          {lab.successCriteria.map((criterion) => {
            const isChecked = checked.includes(criterion);
            return <button key={criterion} className={isChecked ? "is-checked" : ""} aria-pressed={isChecked} onClick={() => toggleCriterion(criterion)} disabled={verified}><span>{isChecked ? <Check size={13} /> : null}</span>{criterion}</button>;
          })}
        </div>
        <div className="evidence-grid">
          <div><strong>应保存的证据</strong><p>{lab.evidence}</p></div>
          <div><strong>失败后的恢复动作</strong><p>{lab.recovery}</p></div>
        </div>
        <div className="lab-verify-actions">
          <p>{verified ? <><CheckCircle2 size={15} />实验结果已记录，本课还需通过课后检查才计入掌握度。</> : "只有在真实环境取得上述证据后，才确认实验通过。"}</p>
          <button className="primary-button" onClick={onVerify} disabled={!allChecked || verified}><ClipboardCheck size={15} />{verified ? "已验收" : "确认结果已核验"}</button>
        </div>
      </div>
      <p className="lab-safety"><ShieldCheck size={15} />本平台只模拟关键决策；真实命令请在隔离练习环境中执行。</p>
    </section>
  );
}

function PracticePanel({ lesson, isCompleted, onComplete }) {
  const practice = lesson.practice;
  const [selection, setSelection] = useState(practice.type === "multi" ? [] : "");
  const [values, setValues] = useState({});
  const [status, setStatus] = useState(isCompleted ? "success" : "idle");
  const commandPreview = practice.type === "builder" ? practice.commandTemplate(values) : lesson.command;

  const toggleSelection = (id) => {
    if (practice.type === "multi") setSelection((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    else setSelection(id);
    if (status === "error") setStatus("idle");
  };

  const evaluate = () => {
    let passed = false;
    if (practice.type === "choice") passed = selection === practice.correct;
    if (practice.type === "multi") passed = [...selection].sort().join("|") === [...practice.correct].sort().join("|");
    if (practice.type === "builder") {
      const allFilled = practice.fields.every((field) => String(values[field.id] || "").trim());
      const expectedMatches = Object.entries(practice.expected || {}).every(([key, value]) => values[key] === value);
      passed = allFilled && expectedMatches;
    }

    setStatus("running");
    window.setTimeout(() => {
      setStatus(passed ? "success" : "error");
      if (passed) onComplete();
    }, 450);
  };

  return (
    <section className="practice-panel" aria-labelledby="practice-title">
      <div className="practice-heading">
        <div><span className="section-label">课后检查 · 模拟模式</span><h2 id="practice-title">证明你已经掌握</h2></div>
        <span className="sandbox-status"><span />浏览器沙盒</span>
      </div>
      <p className="practice-prompt">{practice.prompt}</p>
      {practice.type === "builder" ? <BuilderFields fields={practice.fields} values={values} setValues={setValues} /> : (
        <div className={`practice-options ${practice.type === "multi" ? "is-multi" : ""}`}>
          {practice.options.map((item) => {
            const selected = practice.type === "multi" ? selection.includes(item.id) : selection === item.id;
            return (
              <button key={item.id} className={selected ? "is-selected" : ""} onClick={() => toggleSelection(item.id)} aria-pressed={selected}>
                <span className="option-indicator">{selected ? <Check size={14} /> : null}</span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </button>
            );
          })}
        </div>
      )}
      <div className="command-preview"><Terminal size={15} /><code>{commandPreview}</code></div>
      <div className="practice-actions">
        <div className={`feedback-message is-${status}`} aria-live="polite">
          {status === "idle" ? "完成选择后运行检查。" : null}
          {status === "running" ? "正在检查你的方案…" : null}
          {status === "error" ? <><AlertTriangle size={15} />{practice.hint}</> : null}
          {status === "success" ? <><CheckCircle2 size={16} />{practice.success}</> : null}
        </div>
        <button className="primary-button" onClick={evaluate} disabled={status === "running"}><Play size={15} fill="currentColor" />{status === "success" ? "重新检查" : "运行检查"}</button>
      </div>
    </section>
  );
}

function LessonReferences({ lesson }) {
  const supplementary = learningResources.filter((resource) => resource.lessonIds.includes(lesson.id) && resource.authority !== "官方");
  return (
    <section className="lesson-resources">
      <div><strong>本课结论</strong><span>{lesson.takeaways.join(" · ")}</span></div>
      <div><strong>常见问题</strong><span>{lesson.troubleshooting}</span></div>
      <div className="reference-links"><strong>官方资料</strong><span>{lesson.references.map((ref) => <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">{ref.label}<ExternalLink size={12} /></a>)}</span></div>
      {supplementary.length ? <div className="reference-links"><strong>延伸阅读</strong><span>{supplementary.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer">{resource.title}<ExternalLink size={12} /></a>)}</span></div> : null}
    </section>
  );
}

function CourseView({ lesson, lessonIndex, completed, labVerified, diagnostic, onDiagnose, onComplete, onVerify, onNavigate }) {
  const [stepIndex, setStepIndex] = useState(0);
  return (
    <div className="course-view">
      <section className="lesson-intro">
        <div className="lesson-kicker"><span>第 {lesson.number} 课</span><span>{lesson.level}</span></div>
        <h1>{lesson.shortTitle}</h1>
        <p>{lesson.summary}</p>
        <div className="objective-line"><ShieldCheck size={17} /><span>{lesson.objective}</span></div>
        <div className="prerequisite-line"><strong>先修</strong>{lesson.prerequisites.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      {lesson.id === "installation-channels" ? <><InstallGuide /><RealInterfaceGuide /><InteractionPractice /></> : null}
      <PreQuiz lesson={lesson} result={diagnostic} onResult={(passed) => onDiagnose(lesson.id, passed)} />
      <TracePanel lesson={lesson} />

      <section className="guided-section">
        <div className="section-heading-row"><div><span className="section-label">核心操作</span><h2>完成本课关键步骤</h2></div><span>{stepIndex + 1} / {lesson.steps.length}</span></div>
        <div className="step-tabs" role="tablist" aria-label="教程步骤">
          {lesson.steps.map((step, index) => (
            <button key={step.title} role="tab" aria-selected={stepIndex === index} onClick={() => setStepIndex(index)} className={stepIndex === index ? "is-active" : ""}>
              <span>{index + 1}</span>{step.title}
            </button>
          ))}
        </div>
        <div className="step-content" role="tabpanel">
          <span>{String(stepIndex + 1).padStart(2, "0")}</span>
          <div><h2>{lesson.steps[stepIndex].title}</h2><p>{lesson.steps[stepIndex].body}</p></div>
          <button className="icon-button" aria-label="下一教程步骤" onClick={() => setStepIndex((current) => Math.min(current + 1, lesson.steps.length - 1))} disabled={stepIndex === lesson.steps.length - 1}><ArrowRight size={18} /></button>
        </div>
      </section>

      <LabBrief lab={lesson.lab} verified={labVerified} onVerify={() => onVerify(lesson.id)} />
      <PracticePanel key={lesson.id} lesson={lesson} isCompleted={completed.includes(lesson.id)} onComplete={() => onComplete(lesson.id)} />
      <LessonReferences lesson={lesson} />

      <div className="lesson-footer-nav">
        <button className="text-button" onClick={() => onNavigate(lessonIndex - 1)} disabled={lessonIndex === 0}><ArrowLeft size={15} />上一课</button>
        <span>{lesson.number} / {lessons.at(-1).number}</span>
        <button className="primary-button" onClick={() => onNavigate(lessonIndex + 1)} disabled={lessonIndex === lessons.length - 1}>下一课<ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

function ProgressRail({ lesson, completed, verifiedLabs, diagnostics, onReset }) {
  const value = Math.round(((completed.length + verifiedLabs.length) / (lessons.length * 2)) * 100);
  const completedCurrent = completed.includes(lesson.id);
  const labVerified = verifiedLabs.includes(lesson.id);
  const mastered = lessons.filter((item) => completed.includes(item.id) && verifiedLabs.includes(item.id)).length;
  const diagnosticCount = Object.keys(diagnostics).length;
  return (
    <aside className="progress-rail">
      <span className="section-label">总掌握度</span>
      <ProgressRing value={value} />
      <div className="level-copy"><strong>{value === 100 ? "Hermes 工程实践者" : value >= 50 ? "工作流构建者" : "基础探索者"}</strong><span>{mastered} / {lessons.length} 门课程已双证据完成</span></div>
      <div className="rail-metric"><ListChecks size={15} /><span>课前诊断</span><strong>{diagnosticCount}/{lessons.length}</strong></div>
      <div className="rail-metric"><FlaskConical size={15} /><span>实验验收</span><strong>{verifiedLabs.length}/{lessons.length}</strong></div>
      <div className="rail-metric"><ClipboardCheck size={15} /><span>课后检查</span><strong>{completed.length}/{lessons.length}</strong></div>

      <div className="rail-divider" />
      <span className="section-label">本节检查点</span>
      <div className="checkpoint-list">
        {lesson.checkpoints.map((checkpoint, index) => {
          const done = index === 0 ? Boolean(diagnostics[lesson.id]) : index === lesson.checkpoints.length - 1 ? completedCurrent : labVerified;
          return <div key={checkpoint} className={done ? "is-done" : ""}>{done ? <CheckCircle2 size={16} /> : <Circle size={16} />}<span>{checkpoint}</span></div>;
        })}
      </div>

      <div className="rail-divider" />
      <span className="section-label">学习反馈</span>
      <p className="rail-feedback">{completedCurrent && labVerified ? "本课已取得实验与课后检查双证据，可以进入下一课。" : completedCurrent ? "课后检查已通过，还需要在真实隔离环境逐项验收实验结果。" : labVerified ? "实验结果已验收，再通过课后检查即可完成本课。" : diagnostics[lesson.id] === "review" ? "课前诊断发现待补操作。完成核心步骤与实验后，用课后检查验证掌握度。" : "先完成课前诊断，再依次学习操作、实验验收和课后检查。"}</p>
      <button className="reset-button" onClick={onReset}><RefreshCcw size={14} />重置本地进度</button>
    </aside>
  );
}

function ResearchView() {
  const [filter, setFilter] = useState("all");
  const shown = repositories.filter((repo) => filter === "all" || (filter === "official" ? repo.role.includes("官方") : !repo.role.includes("官方")));
  const shownResources = learningResources.filter((resource) => filter === "all" || (filter === "official" ? resource.authority === "官方" : resource.authority !== "官方"));
  return (
    <div className="research-view">
      <section className="research-header">
        <img src={`${import.meta.env.BASE_URL}hermes-banner.png`} alt="Hermes Agent 官方项目横幅" />
        <div><h1>Hermes 技术与教学资料</h1><p>以 Hermes 官方文档和模型卡为事实主线，使用 AI-For-Beginners 的 Setup、诊断、实验和复习结构组织课程。最后核验：Hermes Agent {courseMetadata.hermesVersion}（{courseMetadata.hermesReleaseTag}）· {courseMetadata.verifiedOn}。</p><a className="release-link" href={courseMetadata.releaseUrl} target="_blank" rel="noreferrer">查看核验版本<ExternalLink size={13} /></a></div>
      </section>
      <div className="research-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="资源筛选">
          {[{ id: "all", label: "全部" }, { id: "official", label: "官方" }, { id: "community", label: "参考" }].map((item) => <button key={item.id} className={filter === item.id ? "is-active" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}
        </div>
        <span>{shownResources.length} 份电子资料 · {shown.length} 个研究来源</span>
      </div>
      <section className="material-library" aria-labelledby="material-library-title">
        <div className="material-library-heading"><span className="section-label">Electronic Library</span><h2 id="material-library-title">可在线阅读的电子资料</h2><p>只提供原创摘要与公开入口；命令、配置与权限以官方资料为准。</p></div>
        <div className="material-list">
          {shownResources.map((resource) => (
            <article key={resource.id}>
              <div><span>{resource.kind} · {resource.language}</span><h3>{resource.title}</h3><p>{resource.summary}</p></div>
              <div><span className={`access-state ${["公开", "下载", "直接观看"].some((label) => resource.access.includes(label)) ? "is-open" : ""}`}>{resource.access}</span><a className="icon-button" href={resource.url} target="_blank" rel="noreferrer" aria-label={`在线查看 ${resource.title}`}><ExternalLink size={17} /></a></div>
            </article>
          ))}
        </div>
      </section>
      <div className="research-section-title"><span className="section-label">Source Analysis</span><h2>项目与设计来源</h2></div>
      <div className="repo-list">
        {shown.map((repo) => (
          <article className="repo-card" key={repo.name}>
            <div className="repo-heading"><div><span>{repo.role}</span><h2>{repo.name}</h2></div><a className="icon-button" href={repo.url} target="_blank" rel="noreferrer" aria-label={`打开 ${repo.name}`}><ExternalLink size={17} /></a></div>
            <p className="repo-idea">{repo.idea}</p>
            <dl><div><dt>设计理念</dt><dd>{repo.design}</dd></div><div><dt>主要特性</dt><dd>{repo.features.join(" · ")}</dd></div><div><dt>技术</dt><dd>{repo.language}</dd></div></dl>
          </article>
        ))}
      </div>
      <div className="research-caveat"><ShieldCheck size={18} /><p>社区资料只补充教学与实践视角，不代表官方兼容性。命令、配置键和模型参数最终以当前官方文档与模型卡为准。</p></div>
    </div>
  );
}

function ArchitectureView() {
  return (
    <div className="architecture-view">
      <section className="architecture-header"><span className="section-label">Curriculum Design</span><h1>从资料到可验证学习闭环</h1><p>借鉴 AI-For-Beginners 的渐进课程和低风险反馈：每课都经历诊断、讲解、实验、成功标准、课后检查与延伸资料。</p></section>
      <section className="learning-loop" aria-label="教学闭环">
        {[{ icon: GraduationCap, label: "课前诊断", copy: "激活已有知识" }, { icon: BookOpen, label: "核心讲解", copy: "建立心智模型" }, { icon: FlaskConical, label: "可执行实验", copy: "按成功标准实践" }, { icon: CheckCircle2, label: "课后检查", copy: "反馈并记录掌握" }].map((item, index) => {
          const Icon = item.icon;
          return <div key={item.label}><span>{index + 1}</span><Icon size={20} /><strong>{item.label}</strong><small>{item.copy}</small></div>;
        })}
      </section>
      <section className="architecture-grid">
        {architectureLayers.map((layer, index) => <article key={layer.title}><span>0{index + 1}</span><h2>{layer.title}</h2><p>{layer.detail}</p></article>)}
      </section>
      <section className="architecture-table-section">
        <h2>技术架构与边界</h2>
        <div className="architecture-table">
          <div><strong>内容</strong><span>13 课 / 4 阶段 / 3 条路线；安装命令和时效性配置均链接当前官方资料</span></div>
          <div><strong>交互</strong><span>路线诊断 + 核心操作 + 真实实验 + Prompt 工作台 + 证据评分 + 恢复演练</span></div>
          <div><strong>状态</strong><span>localStorage v4 默认保存；可选 Supabase GitHub/邮箱同步，兼容迁移 v1-v3</span></div>
          <div><strong>安全</strong><span>不执行生成的 Prompt；Companion 只读且每次确认；原始证据和 Hermes 数据不上传</span></div>
          <div><strong>响应式</strong><span>桌面三栏、平板双栏、手机课程抽屉；保持同一学习顺序</span></div>
          <div><strong>扩展</strong><span>后续可接入隔离实验 runner、教师看板、版本化内容与高级评测目录</span></div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [initial] = useState(() => readProgress());
  const [activeLesson, setActiveLesson] = useState(Math.min(initial.activeLesson, lessons.length - 1));
  const [completed, setCompleted] = useState(initial.completed.filter((id) => lessons.some((lesson) => lesson.id === id)));
  const [verifiedLabs, setVerifiedLabs] = useState((initial.verifiedLabs || []).filter((id) => lessons.some((lesson) => lesson.id === id)));
  const [diagnostics, setDiagnostics] = useState(initial.diagnostics || {});
  const [pathId, setPathId] = useState(initial.pathId);
  const [evidenceReports, setEvidenceReports] = useState(initial.evidenceReports || []);
  const [view, setView] = useState("hub");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lesson = lessons[activeLesson];
  const phase = phases.find((item) => item.id === lesson.phaseId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 4, completed, verifiedLabs, activeLesson, diagnostics, pathId, evidenceReports }));
  }, [completed, verifiedLabs, activeLesson, diagnostics, pathId, evidenceReports]);

  const currentProgress = { version: 4, completed, verifiedLabs, activeLesson, diagnostics, pathId, evidenceReports };

  const applyMergedProgress = (progress) => {
    const merged = migrateProgress(progress);
    setCompleted(merged.completed.filter((id) => lessons.some((lesson) => lesson.id === id)));
    setVerifiedLabs(merged.verifiedLabs.filter((id) => lessons.some((lesson) => lesson.id === id)));
    setDiagnostics(merged.diagnostics);
    setPathId(merged.pathId);
    setEvidenceReports(merged.evidenceReports);
    setActiveLesson(Math.min(merged.activeLesson, lessons.length - 1));
  };

  const navigateLesson = (index) => {
    if (index < 0 || index >= lessons.length) return;
    setActiveLesson(index);
    setView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectView = (nextView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const resetProgress = () => {
    if (!window.confirm("确定清除这个浏览器中的课程进度和诊断记录吗？")) return;
    setCompleted([]);
    setVerifiedLabs([]);
    setDiagnostics({});
    setPathId("quick-start");
    setEvidenceReports([]);
    setActiveLesson(0);
    localStorage.removeItem(STORAGE_KEY);
    PREVIOUS_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  };

  return (
    <div className="app-shell">
      <CourseSidebar activeIndex={activeLesson} completed={completed} verifiedLabs={verifiedLabs} onSelect={navigateLesson} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-shell">
        <AppTopbar view={view} setView={selectView} lesson={lesson} phase={phase} onOpenMenu={() => setSidebarOpen(true)} />
        <div className="main-scroll">
          {view === "hub" ? <LearningHub lessons={lessons} pathId={pathId} completed={completed} verifiedLabs={verifiedLabs} onSelectPath={setPathId} onNavigate={navigateLesson} /> : null}
          {view === "course" ? <CourseView key={lesson.id} lesson={lesson} lessonIndex={activeLesson} completed={completed} labVerified={verifiedLabs.includes(lesson.id)} diagnostic={diagnostics[lesson.id]} onDiagnose={(id, passed) => setDiagnostics((current) => ({ ...current, [id]: passed ? "correct" : "review" }))} onComplete={(id) => setCompleted((current) => current.includes(id) ? current : [...current, id])} onVerify={(id) => setVerifiedLabs((current) => current.includes(id) ? current : [...current, id])} onNavigate={navigateLesson} /> : null}
          {view === "workbench" ? <PracticeWorkbench onEvidenceReport={(report) => setEvidenceReports((current) => [report, ...current].slice(0, 20))} /> : null}
          {view === "report" ? <LearningReport progress={currentProgress} onMerge={applyMergedProgress} /> : null}
          {view === "research" ? <ResearchView /> : null}
          {view === "architecture" ? <ArchitectureView /> : null}
        </div>
      </main>
      {view === "course" ? <ProgressRail lesson={lesson} completed={completed} verifiedLabs={verifiedLabs} diagnostics={diagnostics} onReset={resetProgress} /> : null}
    </div>
  );
}
