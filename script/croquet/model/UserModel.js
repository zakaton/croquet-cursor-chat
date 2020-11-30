/* global Croquet */
/* global THREE */

import SimplePeerModel from './SimplePeerModel.js'
import SpeechRecognitionModel from './SpeechRecognitionModel.js'

class UserModel extends Croquet.Model {
    init ({username, type}) {
        super.init()

        this.beWellKnownAs(username)

        this.username = username
        this.type = type

        this.isVideoMuted = false
        this.subscribe(this.username, 'mute-video', this.muteVideo)
        this.subscribe(this.username, 'unmute-video', this.unmuteVideo)

        this.isAudioMuted = false
        this.subscribe(this.username, 'mute-audio', this.muteAudio)
        this.subscribe(this.username, 'unmute-audio', this.unmuteAudio)

        this.color = `hsl(${this.random() * 255}, 100%, 90%)`

        this.simplePeer = SimplePeerModel.create({username})
        this.speechRecognition = SpeechRecognitionModel.create({username})

        this.orientation = new THREE.Euler()
        this.subscribe(this.username, 'set-orientation', this.setOrientation)

        this.mouse = {
            position: new THREE.Vector2(),
        }
        this.subscribe(this.username, 'set-mouse-position', this.setMousePosition)
    }

    setOrientation (orientation) {
        this.orientation.copy(orientation)
    }

    setMousePosition ({x, y}) {
        this.mouse.position.set(x, y)
    }

    muteVideo (already) {
        this.isVideoMuted = true
        this.publish(this.username, 'did-mute-video', already)
    }
    unmuteVideo (already) {
        this.isVideoMuted = false
        this.publish(this.username, 'did-unmute-video', already)
    }

    muteAudio (already) {
        this.isAudioMuted = true
        this.publish(this.username, 'did-mute-audio', already)
    }
    unmuteAudio (already) {
        this.isAudioMuted = false
        this.publish(this.username, 'did-unmute-audio', already)
    }

    destroy () {
        this.simplePeer.destroy()
        this.speechRecognition.destroy()
        super.destroy()
    }
}
UserModel.register('user')

export default UserModel
