# Hermes 课程资料研究

核验日期：2026-08-24。课程当前以 [Hermes Agent v0.20.5（Release tag `v2026.8.19`）](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.19) 为版本基线。事实优先级为 Hermes 官方文档与仓库、NousResearch 模型卡、官方工具链；AI-For-Beginners 只用于教学结构；社区资料只提供界面与实践视角。

近期同类 GitHub 项目的元数据、设计优点、采用项和拒绝项见 [`docs/research/2026-08-24-similar-projects.md`](./docs/research/2026-08-24-similar-projects.md)。该报告使用 GitHub API、仓库 README 与官方文档作为一手资料，并直接驱动三路线、能力门控、Prompt 工作台、证据评分、恢复演练和掌握报告。

## AI-For-Beginners 教学启发

[microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) 使用独立环境准备、课前测验、理论阅读、可执行 Notebook、代码挑战、实验任务、课后测验和自学资料形成渐进课程。典型实验明确 Task、Dataset/Input、Execution 和 Expected Result。

本项目采用以下映射：

| AI-For-Beginners | Hermes Learning Lab |
|---|---|
| Course setup | Lesson 00 Download + Channels，Lesson 01 Setup + Doctor |
| Pre-lecture quiz | 每课课前诊断 |
| Theory / readings | 四步核心讲解 + 官方资料 |
| Notebook / code challenge | Agent 轨迹 + 浏览器模拟题 |
| Assignment | 真实实验任务、输入、步骤、成功标准 |
| Post-lecture quiz | 课后检查与掌握度 |

## Hermes Agent 核心结论

Hermes 是可长期运行的 Agent harness：Provider/Model 可替换；工具运行时负责执行；Session 保存事实；Memory 保存压缩经验；Context Files 保存项目规则；Skills 提供渐进披露知识；Plugins/MCP 扩展能力；Gateway、Cron、Hooks 与 Batch 负责入口和触发；Delegation 与 Provider Routing 分配工作；Sandbox、Egress、审批和 Checkpoint 管理副作用。

当前官方学习路径为 Beginner（Installation、Quickstart、CLI、Configuration）、Intermediate（Sessions、Messaging、Tools、Skills、Memory、Cron）和 Advanced（Architecture、扩展、贡献与 RL）。本课程在此基础上补入 Prompt 契约、结构化输出、恢复路径和生产评测。

## 社区教程复核与采用边界

本轮按 `agent-reach` 的当前可用后端检索了小红书、知乎与 YouTube。社区资料只用于发现高频真实工作流，具体命令仍由 Hermes 官方仓库和文档复核。

| 来源 | 可确认的实操主题 | 证据状态 | 课程采用 |
|---|---|---|---|
| [小红书：Hermes Agent + K2.6 手把手教程 + 接入微信](http://xhslink.cn/o/9x9kb5G27rm) | 模型接入、微信入口 | 已解析到带 `xsec_token` 的完整分享地址；OpenCLI 浏览器扩展未连接，未取得正文 | 只把“模型切换必须回退验收”和“消息入口先私聊后群聊”作为跨来源主题，不采用未核验参数 |
| [小红书：Hermes agent 17 分钟完整教程](http://xhslink.cn/o/AybhPvcl1fJ) | 快速安装与核心操作 | 同上，仅确认标题与分享元数据 | 强化最小安装基线，不引用正文细节 |
| [小红书：Hermes Agent 新手使用十大技巧](http://xhslink.cn/o/5eOGAaAftnT) | 主/辅助模型、SOUL、Memory、聊天通道、Doctor、UI、迁移、Skills | 标题可确认；主题与同名 YouTube 章节元数据交叉吻合 | 把术语课改为模型回退、Doctor、Skill 冒烟与迁移恢复演练 |
| [PAPAYA：Hermes Agent 保姆級教學](https://www.youtube.com/watch?v=-EivK7vpOXY) | 本机/云端安装、Telegram、Memory、OpenRouter、Web Search、Subagent、Google Workspace、Cron、Voice、Skills、Notion、备份与防火墙 | 公开视频入口与章节元数据 | 采用“普通聊天后再接通道”“Skill 实测”“备份与权限”路径 |
| [AI 随风：Hermes Agent 新手使用十大技巧](https://www.youtube.com/watch?v=hLiN_X7dzdw) | 主/辅助模型、SOUL、Memory、通道、Doctor、UI、迁移、Skills | 公开视频入口与章节元数据 | 采用模型切换/回切、Doctor、迁移和 Skill 操作 |
| [Wanderloots：Full Hermes Agent Tutorial (Desktop)](https://www.youtube.com/watch?v=GL67DEf2nyI) | Desktop 安装与日常工作流 | 公开视频入口与公开元数据 | 用作 Desktop 课程选题佐证，不引用视频内命令 |

第二轮使用 `yt-dlp` 对中文和英文实操关键词做了三组定向检索，共返回 27 条结果。以下是新增的高相关样本：

| 视频 | 可确认主题 | 课程对应 |
|---|---|---|
| [Hermes Agent 完整安装教程（Win + Mac）+ 9 个核心技巧](https://www.youtube.com/watch?v=17zaR2M8vgk) | Win/Mac 安装与核心技巧 | Lesson 00 多端安装和首轮验收 |
| [Hermes Agent 桌面版完整教学：模型串接/排程任务/实际应用](https://www.youtube.com/watch?v=iE974yYzmrU) | Desktop、模型、排程、应用 | Lesson 03 模型切换，Lesson 08 自动化 |
| [Hermes Agent FULLY LOCAL AI Setup Guide](https://www.youtube.com/watch?v=8jBX3RatIus) | 全本地模型接入 | Lesson 03 的本地端点候选与回退测试 |
| [Hermes Agent Hostinger Tutorial](https://www.youtube.com/watch?v=Z0YO9KyVhVg) | VPS 安装与 Setup | Lesson 01 最小启动基线 |
| [Hermes Agent 小白别花冤枉钱：模型配置](https://www.youtube.com/watch?v=VUXLUmjfH68) | 模型配置与成本选择 | Lesson 03 固定测试集 A/B，而非只看模型名称 |
| [Hermes Agent 官方桌面版：全平台免配置与迁移](https://www.youtube.com/watch?v=MyjHdKiAeJU) | Desktop 与迁移 | Lesson 00 Desktop、Lesson 11 迁移恢复 |
| [Hermes Agent: Zero to Personal AI Assistant](https://www.youtube.com/watch?v=gb5TlGw6Uks) | 完整入门工作流 | 13 课由基础聊天递进到生产边界 |

这些条目用于确认公开视频的标题、频道、主题与 URL。视频中的命令和配置参数仍需回到 Hermes 官方文档逐项复核；需要登录、已失效或无法公开验证的来源不进入学习资料索引。

检索还发现多份教程把“记忆系统、多 Agent、备份、防火墙、消息通道”列为独立章节。这说明初学者真正需要的是一条可观察、可恢复的操作链，而不是先背完 Provider/Model/Profile/SOUL、Skill/Plugin/MCP 或 LoRA/RL 分类。因此本轮做了四项替换：

```text
模型分类 -> 固定测试集下的模型切换与回退
扩展分类 -> Skill search/inspect/install/test/check/uninstall
委派理论 -> /agents 状态观察与主会话集成验收
推理/微调理论 -> backup/import 的升级与换机恢复演练
```

## Desktop 与飞书界面事实

官方 Desktop 是聊天优先窗口：左侧提供 New session、Skills & Tools、Messaging 与会话列表，中间为聊天和消息输入，底部状态栏显示连接、模型与上下文状态。课程使用官方仓库中的 [`session-source-folders.png`](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/pr-assets/session-source-folders.png) 作为版本化实景参考，并明确提示界面可能随更新变化。

飞书接入包含两条 UI 路径：开发者控制台负责权限、WebSocket 事件、交互式卡片和版本发布；飞书客户端负责私聊/群聊、`@Hermes`、Typing 表情与审批卡。危险命令审批通过原生卡片回传；卡片必须订阅 `card.action.trigger` 并启用交互式卡片能力，否则点击会出现错误 `200340`。

为避免静态课程暗中读取真实工作环境，真实操作反馈分成两种显式证据：学习者主动粘贴 `DESKTOP_OK` / `FEISHU_OK` 回执，以及点击后才运行的本机只读状态探针。探针不读取配置、会话、密钥、日志或消息。

## 当前配置与恢复路径

安装入口按设备分层：macOS/Linux/WSL2 使用官方 shell 安装器，Windows 原生使用 PowerShell 安装器；初学者可从 Hermes Desktop 安装器开始，已有 CLI 可运行 `hermes desktop`。飞书推荐通过 Gateway 的 WebSocket 长连接接入，无需公网 URL。

```bash
# macOS / Linux / WSL2
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows PowerShell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)

# Desktop 与 Feishu
hermes desktop
hermes gateway setup
hermes gateway
```

最小启动：

```bash
hermes setup
hermes setup --portal
hermes model
hermes doctor
```

先完成一次普通聊天，再添加 Gateway、Cron、Skills、MCP 或路由。推荐恢复顺序：

```text
hermes doctor -> hermes model -> hermes setup -> hermes sessions list -> hermes --continue -> hermes gateway status
```

`~/.hermes/config.yaml` 保存普通设置，`~/.hermes/.env` 保存秘密。配置命令包括 `hermes config get/set/unset/check/migrate`。

## Hermes 4.3 模型要点

[Hermes-4.3-36B](https://huggingface.co/NousResearch/Hermes-4.3-36B) 是 36B 混合推理模型，支持 reasoning/non-reasoning、函数调用、JSON Schema、长上下文和角色扮演。使用 `tokenizer.apply_chat_template(...)`，reasoning 模式使用 `thinking=True`。vLLM 的 Hermes 工具解析器为 `hermes`；SGLang 需按当前模型卡配置解析器。

模型卡建议采样起点：

```python
temperature = 0.6
top_p = 0.95
top_k = 20
```

这些参数不是所有任务的最优值，课程要求用目标任务评测选择。Serving 覆盖 Transformers、vLLM、SGLang、GGUF、llama.cpp、Ollama 和 LM Studio。

## Prompt 与微调决策

推荐升级阶梯：

```text
Prompt contract -> Skill -> SFT / LoRA -> RL with Atropos
```

只有错误模式稳定、数据足够、指标明确且低成本层无法解决时才进入微调。NousResearch 的 [Atropos](https://github.com/NousResearch/atropos) 提供 RL 环境方向；[hermes-agent-self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution) 展示评测驱动的 Skill/Prompt 优化闭环。

上述内容继续作为进阶资料，但不再占用一整节初学实操课。课程正文优先覆盖 `hermes model`、`hermes skills`、`/agents`、`hermes backup` 与 `hermes import` 的可验证工作流。

## 采用的官方入口

- [Installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation)
- [Desktop](https://hermes-agent.nousresearch.com/docs/user-guide/desktop)
- [Windows Native](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native)
- [Windows WSL2](https://hermes-agent.nousresearch.com/docs/user-guide/windows-wsl-quickstart)
- [Feishu](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/feishu)
- [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart)
- [Learning Path](https://hermes-agent.nousresearch.com/docs/getting-started/learning-path)
- [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)
- [Tools](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools)
- [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)
- [Cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
- [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)
- [Checkpoints](https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback)

## 版本注意

Hermes 迭代较快，社区教程和命令可能滞后。当前核验基线是 Hermes Agent v0.20.5（`v2026.8.19`，官方 Release 发布于 2026-08-21）。课程把稳定心智模型放在正文，把具体命令链接到当前官方资料；发布前需要运行链接检查，并定期复核配置键、工具解析器和模型参数。
