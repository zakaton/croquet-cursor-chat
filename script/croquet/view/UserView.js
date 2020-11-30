/* global Croquet */

import SimplePeerView from './SimplePeerView.js'
import SpeechRecognitionView from './SpeechRecognitionView.js'

class UserView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model
        
        const [, myUsername, myType] = this.viewId.split('_')
        this.myUsername = myUsername
        this.myType = myType

        this.isMyUser = (this.username === this.myUsername)

        if (this.myType === 'extension') {
            this.cursorParent = document.createElement('div')
            this.cursorParent.classList.add('croquet-cursor-chat')
            this.cursorParent.classList.add('cursor')
            // this.cursorParet.style.backgroundColor = this.color
            // this.cursorParet.style.boxShadow = `0 0 3px 3px ${this.color}`
            this.cursorParent.dataset.username = this.username
    
            this.cursorParent.innerHTML = `
                <div class="video">
                    <video muted autoplay playsinline></video>
                </div>
            `
            document.body.appendChild(this.cursorParent)

            this.subscribe(this.username, 'did-mute-video', this.didMuteVideo)
            this.subscribe(this.username, 'did-unmute-video', this.didUnmuteVideo)
        }

        this.simplePeer = new SimplePeerView(this.model.simplePeer)
        this.speechRecognition = new SpeechRecognitionView(this.model.speechRecognition)
    }

    get username () {
        return this.model.username
    }

    get color () {
        return this.model.color
    }

    didMuteVideo () {
        if (this.myType === 'extension') {
            this.cursorParent.classList.add('mute-video')
        }
    }
    didUnmuteVideo () {
        if (this.myType === 'extension') {
            this.cursorParent.classList.remove('mute-video')
        }
    }

    update () {
        if (this.myType === 'extension') {
            if (!this.isMyUser) {
                this.cursorParent.style.left = `${this.model.mouse.position.x}px`
                this.cursorParent.style.top = `${this.model.mouse.position.y}px`
            }
        }
        this.simplePeer.update()
        this.speechRecognition.update()
        super.update()
    }

    detach () {
        if (this.myType === 'extension') {
            this.cursorParent.firstElementChild.remove()
        }

        this.simplePeer.detach()
        this.speechRecognition.detach()
        super.detach()
    }
}

export default UserView
