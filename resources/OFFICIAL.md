# Hermes 官方资料与命令核验

最后核验：2026-08-24 · [Hermes Agent v0.20.5（`v2026.8.19`）](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.19)

## 入门与界面

| 目标 | 官方入口 |
|---|---|
| 按设备安装 | [Installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation) |
| 完成首次设置 | [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) |
| 使用桌面端 | [Desktop](https://hermes-agent.nousresearch.com/docs/user-guide/desktop) |
| Windows 原生安装 | [Windows Native](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native) |
| Windows WSL2 | [Windows WSL2](https://hermes-agent.nousresearch.com/docs/user-guide/windows-wsl-quickstart) |
| 连接飞书 | [Feishu](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/feishu) |

## 日常操作与自动化

| 目标 | 官方入口 |
|---|---|
| CLI、会话与快捷命令 | [CLI Usage](https://hermes-agent.nousresearch.com/docs/user-guide/cli) |
| Provider、模型与配置 | [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) |
| 工具与 Toolset | [Tools](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools) |
| 项目规则 | [Context Files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files) |
| Skills | [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |
| 记忆 | [Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) |
| 定时任务 | [Cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron) |
| 消息入口 | [Messaging Gateway](https://hermes-agent.nousresearch.com/docs/user-guide/messaging) |
| 子任务委派 | [Delegation](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation) |

## 安全与恢复

| 目标 | 官方入口 |
|---|---|
| 审批、配对与隔离 | [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security) |
| Checkpoint 与回滚 | [Checkpoints and rollback](https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback) |
| 当前实现与 Release | [v0.20.5 / `v2026.8.19`](https://github.com/NousResearch/hermes-agent/releases/tag/v2026.8.19) · [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |

## 最小操作基线

```bash
hermes setup
hermes
hermes doctor
```

基础聊天通过后，再逐项增加 Desktop、Gateway、Skills、Cron 或 MCP。真实命令执行前应打开对应官方页面确认当前版本；不要以社区视频中的旧界面或旧参数替代版本核验。
