# Similar-project research: practical AI and Agent learning systems

Research date: **2026-08-24**. Sources were checked through GitHub repository metadata, repository READMEs, source trees, and official project documentation. Star counts are a point-in-time discovery signal, not a quality score.

## Compared projects

| Project | Snapshot | Strong pattern | Adoption in Hermes Learning Lab |
|---|---|---|---|
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | 235,410 stars; Python; MIT; pushed 2026-08-24 | Installation, Doctor, tools, Memory, Skills, Gateway, cron, subagents, messaging and security form one operational runtime | Keep the 13 lessons mapped to observable Hermes capabilities and current official commands |
| [NousResearch/hermes-agent-self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution) | 5,138 stars; Python; pushed 2026-06-17 | Candidate changes pass evaluation, size, semantic and test gates before human PR review | Prompt contracts include scope and stopping rules; evidence scoring never edits a real Skill automatically |
| [fathah/hermes-desktop](https://github.com/fathah/hermes-desktop) | 14,028 stars; TypeScript/Electron; pushed 2026-08-24 | Guided first run, visible connection/tool progress, Profiles, sessions and real screenshots | Preserve guided Desktop landmarks and explicit state feedback |
| [outsourc-e/hermes-workspace](https://github.com/outsourc-e/hermes-workspace) | 6,502 stars; JavaScript; pushed 2026-08-22 | Portable and Enhanced modes, capability gates, loopback defaults, health checks and troubleshooting | Show browser simulation, local Companion, evidence import and cloud sync as separate capabilities with visible fallback |
| [microsoft/AI-For-Beginners](https://github.com/microsoft/AI-For-Beginners) | 66,666 stars; Jupyter; MIT; pushed 2026-07-21 | Stable lesson contract: preparation, executable notebook, lab, quiz and continued learning | Retain pre-check, operation, lab, result verification, post-check and references in every lesson |
| [microsoft/ai-agents-for-beginners](https://github.com/microsoft/ai-agents-for-beginners) | 73,103 stars; Jupyter; MIT; pushed 2026-08-18 | Goal-based Study Guide, progressive demos and JSON smoke-test assertions | Add three routes, a diagnostic recommendation, searchable lessons and rule-based result checks |
| [huggingface/agents-course](https://github.com/huggingface/agents-course) | 31,310 stars; MDX; Apache-2.0; pushed 2026-06-30 | Units culminate in a structured submission, automatic evaluation and benchmark | Score a redacted artifact and generate a learner-owned mastery report; avoid a compulsory leaderboard |
| [langchain-ai/langchain-academy](https://github.com/langchain-ai/langchain-academy) | 2,826 stars; Jupyter; MIT; pushed 2026-06-15 | Memory, human breakpoints, replay, parallelization and local Studio are introduced incrementally | Use recovery scenarios and explicit approval boundaries in advanced practice |
| [microsoft/generative-ai-for-beginners](https://github.com/microsoft/generative-ai-for-beginners) | 118,450 stars; Jupyter; MIT; pushed 2026-08-20 | Learn/Build labels, multi-language samples, video and continued-learning links | Keep theory short and place reusable Prompt templates beside hands-on checks |

## Best practices adopted

1. Preserve one canonical 13-lesson curriculum while exposing quick-start, daily-use and engineering paths.
2. Keep the learner contract stable: objective, precondition, action, observable result, evidence, failure recovery and next action.
3. Make runtime capability visible. Static simulation remains usable when Companion or cloud sync is absent.
4. Accept learner-controlled, redacted artifacts and apply explainable rubric checks instead of exact-matching open-ended answers.
5. Store mastery as two independent signals: post-check understanding and real-lab verification.
6. Keep cloud accounts optional and the local browser record authoritative when external services fail.
7. Require explicit confirmation for real local reads; never execute a generated Prompt or silently modify Hermes.

## Patterns rejected

- Estimated study time, definition-heavy chapters, or theory without an operation and result check.
- A required paid API, cloud account, leaderboard, or hosted runtime for the beginner path.
- Exact-match scoring for open-ended Agent output.
- Silent shell execution, automatic Skill installation, remote binding by default, or self-evolution without tests and human review.
- Copying another product's complete operations dashboard into a learning application.
- Treating stars, marketing claims, or community commands as a substitute for current official documentation.

## Primary sources

- [Hermes Agent README](https://github.com/NousResearch/hermes-agent/blob/main/README.md) and [official documentation](https://hermes-agent.nousresearch.com/docs/)
- [Hermes Agent Self-Evolution README](https://github.com/NousResearch/hermes-agent-self-evolution/blob/main/README.md)
- [Hermes Desktop README](https://github.com/fathah/hermes-desktop/blob/main/README.md)
- [Hermes Workspace README](https://github.com/outsourc-e/hermes-workspace/blob/main/README.md)
- [AI for Beginners README](https://github.com/microsoft/AI-For-Beginners/blob/main/README.md)
- [AI Agents for Beginners Study Guide](https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md) and [smoke tests](https://github.com/microsoft/ai-agents-for-beginners/tree/main/tests)
- [Hugging Face Agents Course](https://github.com/huggingface/agents-course/blob/main/README.md) and [final assignment](https://github.com/huggingface/agents-course/blob/main/units/en/unit4/hands-on.mdx)
- [LangChain Academy README](https://github.com/langchain-ai/langchain-academy/blob/main/README.md)
- [Generative AI for Beginners README](https://github.com/microsoft/generative-ai-for-beginners/blob/main/README.md)
