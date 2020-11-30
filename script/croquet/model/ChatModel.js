/* global Croquet */

class ChatModel extends Croquet.Model {
    init () {
        super.init()

        this.messages = []
        this.subscribe(this.sessionId, 'add-message', this.addMessage)
    }

    addMessage ({username, text}) {
        this.messages.push({username, text})
        this.publish(this.sessionId, 'did-add-message', this.messages.length-1)
    }
}
ChatModel.register('chat')

export default ChatModel