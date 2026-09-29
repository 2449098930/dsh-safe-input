// dsh-safe-input —— 浏览器半边。
//
// 用途：DSH 的输入框是自研富文本编辑器，在部分「输入法 × 浏览器」组合下会出现
// 组词被打断、拼音残留的乱码。本插件在输入框上方提供一块普通 <textarea>，
// 打字不经过富文本编辑器（已实测正常）。
//
// v1.1.0 新增「转入输入框」：
//   打完字点一下 → 文本进入正式输入框并自动聚焦（光标停在末尾），
//   于是可以直接在输入框里 Ctrl+V 贴图 / 拖入图片，而**打字仍然在安全板里打**。
//   这样「需要识图」的场景就不用再回到会乱码的富文本编辑器里敲字了。

window.__ModuleLoader__.load({
  id: 'dsh-safe-input',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var react = require('react')

    var wrapStyle = {
      margin: '0 0 8px 0',
      padding: '8px 10px',
      border: '1px solid rgba(127,127,127,0.35)',
      borderRadius: '10px',
      background: 'rgba(127,127,127,0.07)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '13px',
      boxSizing: 'border-box',
    }
    var headStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'space-between',
    }
    var taStyle = {
      width: '100%',
      minHeight: '64px',
      marginTop: '6px',
      boxSizing: 'border-box',
      resize: 'vertical',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid rgba(127,127,127,0.35)',
      background: 'rgba(127,127,127,0.10)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '14px',
      lineHeight: '1.5',
      outline: 'none',
    }
    var rowStyle = { display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }
    var btnStyle = {
      padding: '4px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(127,127,127,0.45)',
      background: 'rgba(127,127,127,0.14)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '12px',
      cursor: 'pointer',
    }
    var primaryBtnStyle = {
      padding: '4px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(88,132,255,0.55)',
      background: 'rgba(88,132,255,0.18)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 600,
    }
    var tipStyle = { opacity: 0.65, fontSize: '12px' }
    var hintStyle = { marginTop: '6px', fontSize: '12px', opacity: 0.8 }

    // 找到正式输入框那个可编辑元素：取「可见且面积最大」的那个（正式输入框是全宽的）
    function findComposer() {
      var list = document.querySelectorAll('[contenteditable="true"]')
      var best = null
      var bestArea = 0
      for (var i = 0; i < list.length; i++) {
        var el = list[i]
        if (el.closest !== undefined && el.closest('.dsh-safe-input-pad') !== null) continue
        var rect = el.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) continue
        var area = rect.width * rect.height
        if (area > bestArea) {
          bestArea = area
          best = el
        }
      }
      return best
    }

    // 聚焦输入框，并把光标放到末尾（这样接着贴图/回车都顺手）
    function focusComposerEnd() {
      var el = findComposer()
      if (el === null) return false
      try {
        el.focus()
      } catch (err) {}
      try {
        var sel = window.getSelection()
        var range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      } catch (err) {}
      return true
    }

    function SafeInputDock(props) {
      var textState = react.useState('')
      var text = textState[0]
      var setText = textState[1]
      var openState = react.useState(true)
      var open = openState[0]
      var setOpen = openState[1]
      var hintState = react.useState('')
      var hint = hintState[0]
      var setHint = hintState[1]

      var actions = props === undefined || props === null ? undefined : props.inputActions
      var canWrite = actions !== undefined && actions !== null

      // 转入输入框：文本进正式输入框 + 自动聚焦到末尾，图片随后在输入框里贴
      var transfer = function () {
        if (!canWrite) return
        actions.setDraft(text)
        setText('')
        // 等一帧再聚焦：setDraft 会触发编辑器重渲染，立刻聚焦可能被覆盖
        var focused = focusComposerEnd()
        window.setTimeout(function () {
          focusComposerEnd()
        }, 80)
        setHint(
          focused
            ? '已转入输入框（光标在末尾）→ 现在直接 Ctrl+V 贴图，或把图片拖进去，然后回车发送'
            : '已转入输入框 → 点一下输入框，再 Ctrl+V 贴图',
        )
      }

      var sendNow = function () {
        if (!canWrite) return
        actions.setDraft(text)
        actions.submit()
        setText('')
        setHint('')
      }

      var head = react.createElement(
        'div',
        { style: headStyle },
        react.createElement(
          'span',
          { style: tipStyle },
          '安全输入板 · 打字不乱码；要贴图就点「转入输入框」再在输入框里 Ctrl+V' +
            (canWrite ? '' : '（当前无会话，暂不可用）'),
        ),
        react.createElement(
          'button',
          {
            type: 'button',
            style: btnStyle,
            onClick: function () {
              setOpen(!open)
            },
          },
          open ? '收起' : '展开',
        ),
      )

      if (!open) {
        return react.createElement('div', { style: wrapStyle }, head)
      }

      var area = react.createElement('textarea', {
        className: 'dsh-safe-input-pad',
        style: taStyle,
        value: text,
        spellCheck: false,
        placeholder: '用输入法在这里自由打字（普通文本框，不经过富文本编辑器，不会乱码）',
        onChange: function (event) {
          setText(event.target.value)
          if (hint !== '') setHint('')
        },
        onKeyDown: function (event) {
          // Ctrl+Enter = 转入输入框（不是直接发送，避免误发）
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault()
            transfer()
          }
        },
      })

      var buttons = react.createElement(
        'div',
        { style: rowStyle },
        react.createElement(
          'button',
          { type: 'button', style: primaryBtnStyle, onClick: transfer, title: '文本进输入框并聚焦，之后可在输入框里贴图' },
          '转入输入框',
        ),
        react.createElement(
          'button',
          { type: 'button', style: btnStyle, onClick: sendNow },
          '直接发送',
        ),
        react.createElement(
          'button',
          {
            type: 'button',
            style: btnStyle,
            onClick: function () {
              setText('')
              setHint('')
            },
          },
          '清空',
        ),
      )

      var hintLine =
        hint === ''
          ? null
          : react.createElement('div', { style: hintStyle }, hint)

      return react.createElement('div', { style: wrapStyle }, head, area, buttons, hintLine)
    }

    function apply(ctx) {
      var slots = ctx.get('slots')
      if (slots === undefined) return
      slots.inject('conversation.input.dock', function () {
        return slots.register(
          {
            name: 'conversation.input.dock',
            id: 'safe-input',
            order: 5,
            label: '安全输入板',
          },
          SafeInputDock,
        )
      })
    }

    // 硬依赖声明：Cordis 会等到 slots 服务挂载后再激活本插件。
    // 缺少这一行时，开机早期 ctx.get('slots') 为 undefined，插件会静默返回，
    // 表现为「不报错也不显示」。
    exports.inject = ['slots']
    exports.name = 'dsh-safe-input'
    exports.apply = apply
    return module.exports
  },
})
