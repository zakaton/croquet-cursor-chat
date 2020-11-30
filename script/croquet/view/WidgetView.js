/* global Croquet */

class WidgetView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model

        this._throttles = {}

        const [, myUsername, myType] = this.viewId.split('_')
        this.myUsername = myUsername
        this.myType = myType

        this.element = document.createElement('div')
        this.element.classList.add('croquet-cursor-chat')
        this.element.classList.add('widget')
        this.element.dataset.id = this.model.id

        this.isMouseDown = false
        this.element.addEventListener('mousedown', () => {
            this.isMouseDown = true
            this.element.style.cursor = 'grabbing'
        })
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false
            this.element.style.cursor = 'initial'
        })

        document.addEventListener('mousemove', event => {
            if (this.isMouseDown) {
                const x = event.clientX
                const y = event.clientY
                this.setThrottle(() => {
                    this.publish(this.model.id, 'set-position', {x, y})
                }, 1000 / 12, 'set-position')
            }
        })

        this.isMouseInside = false
        this.element.addEventListener('mouseenter', () => {
            this.isMouseInside = true
        })
        this.element.addEventListener('mouseleave', () => {
            this.isMouseInside = false
        })

        document.body.appendChild(this.element)
        this.subscribe(this.model.id, 'did-set-position', this.didSetPosition)
        this.didSetPosition()

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                this.publish(this.sessionId, 'remove-widget', this.model.id)
            }
        })
    }

    setThrottle (callback, delay, name) {
        const now = Date.now()
        const throttle = this._throttles[name] = this._throttles[name] || {timestamp: now}

        clearTimeout(throttle.timeoutId)
        
        const timeSinceTimestamp = now - throttle.timestamp
        if (timeSinceTimestamp >= delay) {
            throttle.timestamp = now
            callback()
        }
        else {
            throttle.timeoutId = setTimeout(() => {
                throttle.timestamp = Date.now()
                callback()
            }, delay - timeSinceTimestamp)
        }
    }

    didSetPosition () {
        this.element.style.left = `${this.model.position.x}px`
        this.element.style.top = `${this.model.position.y}px`
    }

    detach () {
        this.element.remove()
    }
}

export default WidgetView