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
| **转入输入框** | 把板子里的文字写进正式输入框（`inputActions.setDraft`），**自动聚焦并把光标停在末尾**，随后可以在正式输入框里贴图 / 拖图 |
| **直接发送** | 写进草稿并提交（`setDraft` + `submit`），一键发出 |
| **清空** | 清空板子 |
| **收起 / 展开** | 折成一行，不占地方 |

板子里按 **Ctrl+Enter** 等价于「转入输入框」（故意不设成直接发送，防手滑误发）。

- 纯文本、不注入 DOM 到聊天区、不碰主题、不联网；
- 注册在官方插槽 `conversation.input.dock` 上，随会话存在与销毁；
- 卸载即干净还原。

## 需要识图 / 发图片的时候

这是 v1.1.0 的主要改进。**打字永远在安全板，图片永远在正式输入框**：

1. 在安全板里把话打完（这里不会乱码）；
2. 点 **「转入输入框」** —— 文字进正式输入框，光标自动落在末尾，板子清空，并提示下一步；
3. 这时按 **Ctrl+V 贴图**，或把图片直接拖进输入框（用 DSH 原生的附件通道，识图、多图、图片说明都照常）；
4. 回车发送。

为什么不在板子里直接贴图：DSH 的 `InputActions` 只公开了 `setDraft()` 与 `submit()`，图片相关的 `addImages()` 吃的是**浏览器内部自己创建的图片 id**（`DraftAttachmentId`），插件侧拿不到创建入口。等官方开放注册接口后，这里会跟进。

## 安装

需要 DSH Web 宿主 **≥ 0.1.2-rc.1**。

```powershell
# 从 npm 安装
dsh plugin --profile web add dsh-safe-input

# 或从 GitHub Release 安装（无需 npm 账号）
dsh plugin --profile web add https://github.com/<owner>/dsh-safe-input/releases/download/v1.1.0/dsh-safe-input-1.1.0.tgz
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

**dsh-safe-input** adds a plain-text typing pad above the DSH Web composer. In some IME × browser combinations the built-in rich-text composer interrupts CJK composition, producing garbled input (leftover pinyin, split characters). This plugin registers a native `<textarea>` in the official `conversation.input.dock` slot: type there, then **move it into the composer** (draft is set, composer focused, caret at the end — paste or drop images there afterwards) or **send directly**. Ctrl+Enter inside the pad moves the text into the composer. No network, no theme overrides, no third-party runtime dependencies.

```powershell
dsh plugin --profile web add dsh-safe-input
```

## 更新记录

**v1.1.0**
- 「填入输入框」升级为 **「转入输入框」**：转入后**自动聚焦正式输入框、光标停在末尾**，并给出下一步提示——于是可以直接在正式输入框里 **Ctrl+V 贴图 / 拖入图片**，解决"需要识图时还得回到会乱码的编辑器里敲字"的问题；
- 板子里支持 **Ctrl+Enter** 快捷转入；
- 板子内容在转入后清空，避免重复发送。

**v1.0.0**
- 首个版本：输入框上方的纯文本打字板 + 填入草稿 / 直接发送。

## License

[MIT](./LICENSE)
