/* global Croquet */

class ChatView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model
        this.modelRoot = this.wellKnownModel('modelRoot')

        this.username = this.viewId.split('_')[1]

        this.elementParent = document.createElement('div')
        this.elementParent.classList.add('croquet-cursor-chat')
        this.elementParent.classList.add('chat')
        this.elementParent.innerHTML = `
            <div class="messages">
                <template>
                    <div class="message">
                        <span class="username"></span>: <span class="text"></span>
                    </div>
                </template>
                <input type="text"> <button>send</button>
            </div>
        `
        this.messages = this.elementParent.querySelector('.messages')
        this.template = this.elementParent.querySelector('template')
        this.input = this.elementParent.querySelector('input')
        this.button = this.elementParent.querySelector('button')
        this.button.addEventListener('click', () => {
            const text = this.input.value
            if (text.length) {
                this.input.value = ''
                this.publish(this.sessionId, 'add-message', {
                    username: this.username,
                    text,
                })
            }
        })
        this.input.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                this.button.click()
            }
        })
        document.body.appendChild(this.elementParent)

        this.subscribe(this.sessionId, 'did-add-message', this.didAddMessage)
        this.model.messages.forEach((_, index) => this.didAddMessage(index))
    }
    
    didAddMessage (index) {
        const {username, text} = this.model.messages[index]
        const messageElement = this.template.content.cloneNode(true).querySelector('.message')
        messageElement.querySelector('.username').innerText = username || 'anon'
        const user = this.modelRoot.getUserByUsername(username)
        if (user) {
            messageElement.style.backgroundColor = user.color
        }
        messageElement.querySelector('.text').innerText = text
        this.messages.insertBefore(messageElement, this.input)
    }

    detach () {
        this.elementParent.firstElementChild.remove()
        super.detach()
    }
}

export default ChatView