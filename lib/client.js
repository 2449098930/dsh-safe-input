// dsh-safe-input —— 浏览器半边。
//
// 用途：DSH 的输入框是自研富文本编辑器，在部分「输入法 × 浏览器」组合下会出现
// 组词被打断、拼音残留的乱码。本插件在输入框上方提供一块普通 <textarea>，
// 打字不经过富文本编辑器（已实测正常），打完一键 setDraft / submit 送进对话。

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
    var tipStyle = { opacity: 0.65, fontSize: '12px' }

    function SafeInputDock(props) {
      var textState = react.useState('')
      var text = textState[0]
      var setText = textState[1]
      var openState = react.useState(true)
      var open = openState[0]
      var setOpen = openState[1]

      var actions = props === undefined || props === null ? undefined : props.inputActions
      var canWrite = actions !== undefined && actions !== null

      var fillDraft = function () {
        if (!canWrite) return
        actions.setDraft(text)
      }
      var sendNow = function () {
        if (!canWrite) return
        actions.setDraft(text)
        actions.submit()
        setText('')
      }

      var head = react.createElement(
        'div',
        { style: headStyle },
        react.createElement(
          'span',
          { style: tipStyle },
          '安全输入板 · 在这里打字不会乱码，打完一键送进对话' +
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
        style: taStyle,
        value: text,
        spellCheck: false,
        placeholder: '用输入法在这里自由打字（普通文本框，不经过富文本编辑器，不会乱码）',
        onChange: function (event) {
          setText(event.target.value)
        },
      })

      var buttons = react.createElement(
        'div',
        { style: rowStyle },
        react.createElement(
          'button',
          { type: 'button', style: btnStyle, onClick: fillDraft },
          '填入输入框',
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
            },
          },
          '清空',
        ),
      )

      return react.createElement('div', { style: wrapStyle }, head, area, buttons)
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
