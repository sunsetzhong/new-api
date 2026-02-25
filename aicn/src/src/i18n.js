export const LANGS = {
    en: { 
        newChat: "New Chat", settings: "Settings", login: "Login", register: "Register", logout: "Logout", email: "Email", password: "Password", submit: "Submit", admin: "Admin", help: "Help", privacy: "Privacy", pricing: "Pricing", profile: "Settings", currentPass: "Current Password", newPass: "New Password", changePass: "Change Password", upgrade: "Upgrade", users: "Users", groups: "Groups", apiConfigs: "API Configs", models: "Models", siteSettings: "Site Settings", save: "Save", cancel: "Cancel", delete: "Delete", add: "Add", edit: "Edit", name: "Name", price: "Price", tokenLimit: "Token Limit", actions: "Actions", enabled: "Enabled", priority: "Priority", baseUrl: "Base URL", apiKey: "API Key", icon: "Icon", multiplier: "Multiplier", error: "Error", success: "Success", loading: "Loading...", confirm: "Confirm", welcomeTitle: "AI Assistant", welcomeSubtitle: "Start a conversation", inputPlaceholder: "Type a message...", disclaimer: "AI may produce inaccurate information.", group: "Group", tokens: "Tokens", tokensUsed: "Tokens Used", perPeriod: "per period", unlimited: "Unlimited", ratePeriod: "Rate Period", canPurchase: "Can Purchase", displayName: "Display Name", turnstileEnabled: "Turnstile", turnstileSiteKey: "Site Key", turnstileSecretKey: "Secret Key", maxAccountsPerIP: "Max Accounts/IP", defaultPrompt: "System Prompt", syncModels: "Sync", apiSource: "API", modelCount: "Models", buy: "Buy",
        dataManage: "Data", exportData: "Export Data", importData: "Import Data", exportDesc: "Export your data as JSON file for backup or migration.", importDesc: "Import data from a previously exported JSON file.", selectData: "Select data to export", importMode: "Import mode", mergeData: "Merge (keep existing, add new)", replaceData: "Replace (overwrite existing)", selectFile: "Select file", exportBtn: "Export JSON", importBtn: "Import", quickActions: "Quick Actions", exportUsers: "Export Users", exportModels: "Export Models", exportAPIs: "Export APIs", exportSettings: "Export Settings",
        batchChangeGroup: "Batch Group", batchResetTokens: "Reset Tokens", batchEnable: "Enable", batchDisable: "Disable", batchMultiplier: "Multiplier", selectAll: "Select All", selected: "selected", batchAction: "Batch Action",
        // New
        checkModels: "Batch Check", checking: "Checking...", checkResults: "Check Results", defaultModel: "Default Model", systemDefault: "System Default", userDefault: "My Default Model", globalDefault: "Global Default Model"
    },
    "zh-CN": {
        newChat: "新对话", settings: "设置", login: "登录", register: "注册", logout: "退出", email: "邮箱", password: "密码", submit: "提交", admin: "管理", help: "帮助", privacy: "隐私", pricing: "价格", profile: "设置", currentPass: "当前密码", newPass: "新密码", changePass: "修改密码", upgrade: "升级", users: "用户", groups: "用户组", apiConfigs: "API配置", models: "模型", siteSettings: "站点设置", save: "保存", cancel: "取消", delete: "删除", add: "添加", edit: "编辑", name: "名称", price: "价格", tokenLimit: "Token限额", actions: "操作", enabled: "启用", priority: "优先级", baseUrl: "基础URL", apiKey: "密钥", icon: "图标", multiplier: "倍率", error: "错误", success: "成功", loading: "加载中...", confirm: "确认", welcomeTitle: "AI助手", welcomeSubtitle: "开始对话", inputPlaceholder: "输入消息...", disclaimer: "AI可能产生不准确信息", group: "用户组", tokens: "Token", tokensUsed: "已用", perPeriod: "每周期", unlimited: "无限", ratePeriod: "周期", canPurchase: "可购买", displayName: "显示名", turnstileEnabled: "验证码", turnstileSiteKey: "站点Key", turnstileSecretKey: "密钥", maxAccountsPerIP: "每IP账号数", defaultPrompt: "系统提示词", syncModels: "同步", apiSource: "API", modelCount: "模型数", buy: "购买",
        dataManage: "数据", exportData: "导出数据", importData: "导入数据", exportDesc: "将数据导出为JSON文件，用于备份或迁移。", importDesc: "从之前导出的JSON文件导入数据。", selectData: "选择要导出的数据", importMode: "导入模式", mergeData: "合并（保留现有，添加新的）", replaceData: "替换（覆盖现有）", selectFile: "选择文件", exportBtn: "导出 JSON", importBtn: "导入", quickActions: "快捷操作", exportUsers: "导出用户", exportModels: "导出模型", exportAPIs: "导出API", exportSettings: "导出设置",
        batchChangeGroup: "批量改组", batchResetTokens: "重置额度", batchEnable: "启用", batchDisable: "禁用", batchMultiplier: "倍率", selectAll: "全选", selected: "已选", batchAction: "批量操作",
        // New
        checkModels: "批量检测", checking: "检测中...", checkResults: "检测结果", defaultModel: "默认模型", systemDefault: "系统默认", userDefault: "我的默认模型", globalDefault: "全站默认模型"
    }
};

export const getLang = (req) => {
    const cookie = req.headers.get('Cookie') || '';
    const m = cookie.match(/lang=([^;]+)/);
    if (m) {
        const raw = decodeURIComponent(m[1] || '').trim().toLowerCase();
        if (raw === 'en' || raw.startsWith('en-')) return 'en';
        if (raw === 'zh' || raw.startsWith('zh-')) return 'zh-CN';
    }
    return 'zh-CN';
};
