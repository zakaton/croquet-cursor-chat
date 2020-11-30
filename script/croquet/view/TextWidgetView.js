import WidgetView from './WidgetView.js'

class TextWidgetView extends WidgetView {
    constructor (model) {
        super(model)

        this.element.dataset.type = 'text'

        this.textarea = document.createElement('textarea')
        this.element.appendChild(this.textarea)
        this.textarea.addEventListener('input', event => {
            const text = this.textarea.value
            this.publish(this.model.id, 'set-text', {
                text,
                username: this.myUsername,
            })
        })
        this.textarea.value = this.text
        this.subscribe(this.model.id, 'did-set-text', this.didSetText)
    }

    get text () {
        return this.model.text
    }

    didSetText (username) {
        if (username !== this.myUsername) {
            this.textarea.value = this.text
        }
    }
}

export default TextWidgetView