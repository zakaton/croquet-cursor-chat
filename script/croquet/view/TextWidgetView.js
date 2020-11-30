import WidgetView from './WidgetView.js'

class TextWidgetView extends WidgetView {
    constructor (model) {
        super(model)
        // html
        // eventlistener
    }

    get text () {
        return this.model.text
    }
}

export default TextWidgetView