/* global Croquet */
/* global THREE */

import UserModel from './UserModel.js'
import ChatModel from './ChatModel.js'

import TextWidgetModel from './TextWidgetModel.js'
import ImageWidgetModel from './ImageWidgetModel.js'
import AudioWidgetModel from './AudioWidgetModel.js'
import EmbedWidgetModel from './EmbedWidgetModel.js'

class Model extends Croquet.Model {
    init ({room}) {
        super.init()

        this.room = room

        this.chat = ChatModel.create()

        this.url = 'https://www.makespace.fun/'
        this.subscribe(this.sessionId, 'set-url', this.setUrl)

        this.scroll = new THREE.Vector2()
        this.subscribe(this.sessionId, 'set-scroll', this.setScroll)

        this.size = new THREE.Vector2()
        this.subscribe(this.sessionId, 'set-size', this.setSize)

        this.position = new THREE.Vector2()
        this.subscribe(this.sessionId, 'set-position', this.setPosition)

        this.users = []
        this.subscribe(this.sessionId, 'view-join', this.onViewJoin)
        this.subscribe(this.sessionId, 'view-exit', this.onViewExit)

        this.widgets = []
        this.subscribe(this.sessionId, 'add-widget', this.addWidget)
        this.subscribe(this.sessionId, 'remove-widget', this.removeWidget)
    }

    static types () {
        return {
            'THREE.Euler': THREE.Euler,
            'THREE.Vector2': THREE.Vector2,
            'THREE.Matrix4': THREE.Matrix4,
        }
    }

    setUrl (url) {
        if (this.url !== url) {
            this.url = url

            this.scroll.set(0, 0)
            this.position.set(0, 0)
            this.size.set(0, 0)

            this.publish(this.sessionId, 'did-set-url')
        }
    }

    // SCREEN
    setScroll ({x, y, username}) {
        this.scroll.set(x, y)
        this.publish(this.sessionId, 'did-set-scroll', username)
    }

    setSize ({width, height, username}) {
        this.size.set(width, height)
        this.publish(this.sessionId, 'did-set-size', username)
    }

    setPosition ({x, y, username}) {
        this.position.set(x, y)
        this.publish(this.sessionId, 'did-set-position', username)
    }

    // USERS
    getUsernameFromViewId (viewId) {
        return viewId.split('_')[1]
    }
    getUserTypeFromViewId (viewId) {
        return viewId.split('_')[2]
    }
    getUserByUsername (username) {
        return this.users.find(user => user.username === username)
    }
    getUserByViewId (viewId) {
        const username = this.getUsernameFromViewId(viewId)
        return this.getUserByUsername(username)
    }

    onViewJoin (viewId) {
        const username = this.getUsernameFromViewId(viewId)
        let user = this.getUserByViewId(username)
        if (!user) {
            const type = this.getUserTypeFromViewId(viewId)
            if (type === 'options') {
                user = UserModel.create({username, type})
                this.users.push(user)
    
                this.publish(this.sessionId, 'user-join', user.username)
                this.publish(user.username, 'join')
            }
        }
    }
    onViewExit (viewId) {
        const user = this.getUserByViewId(viewId)
        if (user) {
            const type = this.getUserTypeFromViewId(viewId)
            if (type === 'options') {
                user.destroy()
                this.users.splice(this.users.indexOf(user), 1)

                if (this.users.length === 0) {
                    // remove all chat messages if no one is there
                    // this.chat.messages.length = 0
                }
    
                this.publish(this.sessionId, 'user-exit', user.username)
            }
        }
    }

    getWidgetById (id) {
        return this.widgets.find(widget => widget.id === id)
    }
    addWidget (options) {
        let widget

        switch(options.type) {
        case 'text':
            widget = TextWidgetModel.create(options)
            break
        case 'image':
            widget = ImageWidgetModel.create(options)
            break
        case 'audio':
            widget = AudioWidgetModel.create(options)
            break
        case 'embed':
            widget = EmbedWidgetModel.create(options)
            break
        default:
            break
        }

        if (widget) {
            this.widgets.push(widget)
            this.publish(this.sessionId, 'did-add-widget', widget.id)
        }
    }
    removeWidget (id) {
        const widget = this.getWidgetById(id)
        if (widget) {
            widget.destroy()
            this.widgets.splice(this.widgets.indexOf(widget), 1)

            this.publish(this.sessionId, 'did-remove-widget', widget.id)
        }
    }
}
Model.register('model')

export default Model
