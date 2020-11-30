/* global Croquet */

class WidgetView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model

        this._throttles = {}

        this.elementParent = document.createElement('div')
        this.elementParent.classList.add('croquet-cursor-chat')
        this.elementParent.innerHTML = `
            <div class="widget"></div>
        `

        this.isMouseDown = false
        this.elementParent.addEventListener('mousedown', () => {
            this.isMouseDown = true
            this.elementParent.style.cursor = 'grabbing'
        })
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false
            this.elementParent.style.cursor = 'initial'
        })

        this.elementParent.addEventListener('mousemove', event => {
            if (this.isMouseDown) {
                const {x, y} = event
                this.setThrottle(() => {
                    this.publish(this.model.id, 'set-position', {x, y})
                }, 1000 / 12, 'set-position')
            }
        })

        this.isMouseInside = false
        this.elementParent.addEventListener('mouseenter', () => {
            this.isMouseInside = true
        })
        this.elementParent.addEventListener('mouseleave', () => {
            this.isMouseInside = false
        })

        document.body.appendChild(this.elementParent)
        this.subscribe(this.model.id, 'did-set-position', this.didSetPosition)
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
        this.elementParent.style.left = this.model.position.x
        this.elementParent.style.top = this.model.position.y
    }

    detach () {
        this.elementParent.remove()
    }
}

export default WidgetView