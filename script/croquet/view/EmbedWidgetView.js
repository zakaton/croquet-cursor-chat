import WidgetView from './WidgetView.js'

class EmbedWidgetView extends WidgetView {
    constructor (model) {
        super(model)

        this.element.dataset.type = 'embed'
        
        this.iframe = document.createElement('iframe')
        this.iframe.src = this.url
        this.element.appendChild(this.iframe)
    }

    get url () {
        return this.model.url
    }
}

export default EmbedWidgetView