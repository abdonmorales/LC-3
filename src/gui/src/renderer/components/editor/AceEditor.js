import ace from 'brace'

export default {
  name: 'ace-editor',
  props: {
    value: {
      type: String,
      required: true
    },
    lang: String,
    theme: String,
    height: true,
    width: true
  },
  data: function () {
    return {
      editor: null,
      contentBackup: ''
    }
  },
  mounted: function () {
    const lang = this.lang || 'text'
    const theme = this.theme || 'chrome'

    this.editor = ace.edit(this.$el)
    this.$emit('init', this.editor)

    this.editor.$blockScrolling = Infinity
    this.editor.getSession().setMode('ace/mode/' + lang)
    this.editor.setTheme('ace/theme/' + theme)
    this.editor.setValue(this.value, 1)

    this.editor.on('change', () => {
      const content = this.editor.getValue()
      this.$emit('input', content)
      this.contentBackup = content
    })
  },
  beforeDestroy: function () {
    if (this.editor) {
      this.editor.destroy()
      this.editor.container.remove()
    }
  },
  methods: {
    px: function (n) {
      if (/^\d*$/.test(n)) {
        return n + 'px'
      }
      return n
    }
  },
  watch: {
    value: function (val) {
      if (this.editor && this.contentBackup !== val) {
        this.editor.setValue(val, 1)
      }
    },
    theme: function (newTheme) {
      if (this.editor) {
        this.editor.setTheme('ace/theme/' + newTheme)
      }
    },
    lang: function (newLang) {
      if (this.editor) {
        this.editor.getSession().setMode('ace/mode/' + newLang)
      }
    }
  },
  render: function (h) {
    return h('div', {
      style: {
        position: 'relative',
        height: this.height ? this.px(this.height) : '100%',
        width: this.width ? this.px(this.width) : '100%'
      }
    })
  }
}
