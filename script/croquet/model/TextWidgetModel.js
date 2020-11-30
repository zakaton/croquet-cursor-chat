import WidgetModel from './WidgetModel.js'

class TextWidgetModel extends WidgetModel {
    init (options) {
        super.init(options)

        const {text} = options
        this.text = text
        this.subscribe(this.id, 'set-text', this.setText)
    }

    setText (text) {
        this.text = text
        this.publish(this.id, 'did-set-text')
    }
}
TextWidgetModel.register('text-widget')

export default TextWidgetModel