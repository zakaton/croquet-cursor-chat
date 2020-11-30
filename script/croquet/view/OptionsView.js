import View from './View.js'

class OptionsView extends View {
    constructor (model) {
        super(model)

        this.videoButton = document.querySelector('#video button')
        this.subscribe(this.username, 'did-mute-video', this.didMuteVideo)
        this.subscribe(this.username, 'did-unmute-video', this.didUnmuteVideo)

        this.audioButton = document.querySelector('#audio button')
        this.subscribe(this.username, 'did-mute-audio', this.didMuteAudio)
        this.subscribe(this.username, 'did-unmute-audio', this.didUnmuteAudio)        
    }

    didMuteVideo (already) {
        if (!already) {
            this.videoButton.click()
        }
    }
    didUnmuteVideo (already) {
        if (!already) {
            this.videoButton.click()
        }
    }

    didMuteAudio (already) {
        if (!already) {
            this.audioButton.click()
        }
    }
    didUnmuteAudio (already) {
        if (!already) {
            this.audioButton.click()
        }
    }
}

export default OptionsView