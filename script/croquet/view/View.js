/* global Croquet */

import UserView from './UserView.js'

class View extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model

        this._throttles = {}

        const [, username, type] = this.viewId.split('_')
        this.username = username
        this.type = type

        this.users = []
        if (this.userModel) {
            this.onJoin()
        } else {
            this.subscribe(this.username, 'join', this.onJoin)
        }
    }

    getUserByUsername (username) {
        return this.users.find(user => user.username === username)
    }

    get user () {
        return this.getUserByUsername(this.username)
    }

    get userModel () {
        return this.model.getUserByUsername(this.username)
    }

    onJoin () {
        this.model.users.forEach(userModel => this.onUserJoin(userModel.username))

        this.subscribe(this.sessionId, 'user-join', this.onUserJoin)
        this.subscribe(this.sessionId, 'user-exit', this.onUserExit)
    }

    onUserJoin (username) {
        let user = this.getUserByUsername(username)
        if (!user) {
            const userModel = this.model.getUserByUsername(username)
            if (userModel) {
                user = new UserView(userModel)
                this.users.push(user)
            }
        }
    }

    onUserExit (username) {
        const user = this.getUserByUsername(username)
        if (user) {
            user.detach()
            this.users.splice(this.users.indexOf(user), 1)
        }
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

    update () {
        this.users.forEach(user => user.update())
        super.update()
    }

    detach () {
        super.detach()
        this.users.forEach(user => user.detach())
    }
}

export default View
