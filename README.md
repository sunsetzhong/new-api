# new-api (Demo)

一个基于 Cloudflare Workers 的开源 Demo，包含：

- `aicn/`：主站（聊天 UI、`/v1` API、管理员后台）
- `uptime-monitor/`：站点状态监控页

## 声明

- 本项目仅用于技术分享与学习演示（Demo）。
- 不构成商业建议，不鼓励或诱导消费。
- 请根据你的合规要求自行评估后再上线使用。

## 主要功能

- 登录后使用，角色分为管理员/普通用户。
- 用户可创建本站 API Key（`/v1` 节点）并限制可用模型与积分额度。
- 管理员可配置多上游 API Key 和模型计费（按次/按量）。
- 额度申请与审批流程（支持上传图片到 R2，审批后自动删除图片）。
- LinuxDo 登录接入（OAuth）。
- LinuxDo 支付接入（epay 协议，积分充值）。
- 亮暗主题、中英切换（默认中文）。
- `status` 子站用于健康检查与历史状态展示。

## 技术栈

- Cloudflare Workers
- D1（业务数据）
- R2（图片对象）
- KV（状态监控历史）
- 原生 HTML/CSS/JS

## 快速开始

要求：

- Node.js 20+
- npm
- 已登录 Cloudflare：`npx wrangler login`

主站开发：

```bash
cd aicn
npm install
npm run dev
```

状态站开发：

```bash
cd uptime-monitor
npm install
npm run dev
```

## 部署

主站：

```bash
cd aicn
npm run deploy
```

状态站：

```bash
cd uptime-monitor
npm run deploy
```

## 关键配置

- 主站绑定：
  - D1：`DB`
  - R2：`R2`
- 状态站绑定：
  - KV：`UPTIME_KV`

常用设置在 `settings` 表中管理（例如：站点名、积分汇率、注册开关、LinuxDo 登录/支付开关等）。

## 安全建议

- 不要把真实上游 API Key 提交到仓库。
- 生产环境建议启用 Turnstile。
- 定期轮换管理员密码与密钥。

## License

MIT
