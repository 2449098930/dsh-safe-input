# dsh-safe-input · 安全输入板

> 给 DeepSeek Harness（DSH）Web 界面加一块**纯文本打字板**，绕开富文本编辑器在部分「输入法 × 浏览器」组合下的**中文组词乱码**（拼音残留、字被拆碎）。

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A5%200.1.2--rc.1-informational.svg)](#兼容性)

---

## 它解决什么问题

DSH Web 的输入框是一个自研富文本编辑器。在部分环境下，输入法（IME）的**组词合成会被打断**，表现为：

- 想打「测试一下」，输入框里出现 `de筇希伀CEd` 这样的**碎片**；
- 拼音字母和汉字混在一起、顺序错乱；
- 只能在记事本里打完再粘贴进来。

DSH 官方仓库里已有多个同类报告：
[#4233](https://github.com/deepseek-ai/deepseek-harness/discussions/4233)、
[#5630](https://github.com/deepseek-ai/deepseek-harness/discussions/5630)、
[#2709](https://github.com/deepseek-ai/deepseek-harness/discussions/2709)。

**排查结论（本插件作者的实测）**：在同一个浏览器里，普通 `<input>`、普通 `<textarea>`、原生 `contenteditable` 全部**完全正常**——问题只出现在 DSH 那个富文本编辑器里。所以最直接的办法是：**给主人一块不走富文本编辑器的打字区**。

## 它做什么

在输入框上方挂一块普通 `<textarea>`：

| 按钮 | 作用 |
|---|---|
| **填入输入框** | 把板子里的文字写进原来的草稿框（`inputActions.setDraft`），你还能继续编辑 |
| **直接发送** | 写进草稿并提交（`setDraft` + `submit`），一键发出 |
| **清空** | 清空板子 |
| **收起 / 展开** | 折成一行，不占地方 |

- 纯文本、不注入 DOM 到聊天区、不碰主题、不联网；
- 注册在官方插槽 `conversation.input.dock` 上，随会话存在与销毁；
- 卸载即干净还原。

## 安装

需要 DSH Web 宿主 **≥ 0.1.2-rc.1**。

```powershell
# 从 npm 安装
dsh plugin --profile web add dsh-safe-input

# 或从 GitHub Release 安装（无需 npm 账号）
dsh plugin --profile web add https://github.com/<owner>/dsh-safe-input/releases/download/v1.0.0/dsh-safe-input-1.0.0.tgz
```

装完**重启 `dsh web`**（关掉当前界面，重新运行 `dsh web`），然后在输入框上方就能看到「安全输入板」。

## 卸载

```powershell
dsh plugin --profile web remove dsh-safe-input
```

再重启一次 `dsh web` 即完全还原。

## 兼容性

| 项目 | 说明 |
|---|---|
| 宿主版本 | `≥ 0.1.2-rc.1`（依赖 `conversation.input.dock` 插槽与 `inputActions.setDraft()` / `submit()`） |
| 平台 | DSH Web（`dsh.client.platform = "web"`） |
| 依赖 | 无第三方运行时依赖；仅使用 `react`（平台种子模块） |

## 开发 / 本地调试

本包就是一个标准的 DSH bundle：

```
dsh-safe-input/
├─ package.json        # dsh.bundle.patch + dsh.client 声明
├─ cordis.patch.yml    # 向 profile 层栈 insert 一行宿主插件
└─ lib/
   ├─ index.js         # 宿主半边（无逻辑，占位）
   └─ client.js        # 浏览器半边：注册插槽 + 打字板 UI
```

本地以链接方式安装：

```powershell
dsh plugin --profile web add link:C:\path\to\dsh-safe-input
```

改 `lib/client.js` 后 DSH 的 HMR 会自动重建 bundle；必要时刷新页面。

## English

**dsh-safe-input** adds a plain-text typing pad above the DSH Web composer. In some IME × browser combinations the built-in rich-text composer interrupts CJK composition, producing garbled input (leftover pinyin, split characters). This plugin registers a native `<textarea>` in the official `conversation.input.dock` slot: type there, then **fill the draft** or **send directly**. No network, no theme overrides, no third-party runtime dependencies.

```powershell
dsh plugin --profile web add dsh-safe-input
```

## License

[MIT](./LICENSE)
