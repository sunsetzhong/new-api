# [开源分享] 一个基于 Cloudflare Workers 的 AI 站 Demo（含 LinuxDo 登录/支付接入）

大家好，分享一个我最近整理的开源 Demo：`new-api`。

项目地址：
- https://github.com/sunsetzhong/new-api

先声明：
- 这个项目是技术 Demo，用于学习和交流。
- 不是商业项目，也不是消费引导。
- 里面的支付接入只是演示“如何对接协议”，不构成任何购买建议。

## 这个 Demo 包含什么

- 主站（`aicn/`）
  - 登录后聊天（支持管理员/普通用户）
  - 本站 `/v1` API Key 管理（可限制可用模型与积分额度）
  - 管理后台（用户、模型、上游 API、通知、导入导出）
  - 额度申请审批流（支持图片上传到 R2，审批后自动删图）
  - LinuxDo OAuth 登录接入
  - LinuxDo 支付协议（epay）接入示例

- 状态监控站（`uptime-monitor/`）
  - 定时检测站点可用性
  - 展示历史状态

## 技术栈

- Cloudflare Workers
- D1
- R2
- KV
- 原生 HTML/CSS/JS

## 适合谁看

- 想做一个轻量 AI 站原型的人
- 想看 LinuxDo 登录/支付如何落地的人
- 想参考 Workers + D1 + R2 一体化实践的人

## 说明

如果你拿去二次开发，建议先做：
- 安全审计（鉴权、限流、输入校验）
- 成本控制策略
- 合规与风控策略

欢迎提 issue / PR，一起把这个 Demo 打磨得更清晰。
