/* global Croquet */

class SpeechRecognitionModel extends Croquet.Model {
    init ({username}) {
        super.init()

        this.username = username

        this.transcript = ''
        this.isFinal = false

        this.subscribe(this.username, 'speech-recognition-result', this.onSpeechRecognitionResult)
    }

    onSpeechRecognitionResult ({transcript, isFinal}) {
        this.transcript = transcript
        this.isFinal = isFinal
        this.publish(this.username, 'on-speech-recognition-result', {transcript, isFinal})
    }
}
SpeechRecognitionModel.register('speech-recognition')

export default SpeechRecognitionModel