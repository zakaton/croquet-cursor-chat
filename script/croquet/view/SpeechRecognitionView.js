/* global Croquet */

class SpeechRecognitionView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model

        const [, myUsername, myType] = this.viewId.split('_')
        this.myUsername = myUsername
        this.myType = myType

        this.subscribe(this.username, 'on-speech-recognition-result', this.onSpeechRecognitionResult)
    }

    get username () {
        return this.model.username
    }

    onSpeechRecognitionResult () {
        
    }
}

export default SpeechRecognitionView