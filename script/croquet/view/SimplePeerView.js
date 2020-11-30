/* global Croquet */
/* global SimplePeer */
/* global THREE */

class SimplePeerView extends Croquet.View {
    constructor (model) {
        super(model)
        this.model = model

        const [, myUsername, myType] = this.viewId.split('_')
        this.myUsername = myUsername
        this.myType = myType

        this.isMyUser = (this.myUsername === this.username)

        this.userModel = this.wellKnownModel(this.username)
        this.element = document.querySelector(`.croquet-cursor-chat.cursor[data-username="${this.username}"]`)

        this.otherType = (myType === 'options')?
            'extension':
            'options'
        
        if (this.myType === 'extension') {
            this.matrix4 = new THREE.Matrix4()
            this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
    
            this.audioContext = THREE.AudioContext.getContext()
            this.resonanceAudioScene = window.resonanceAudioScene
            this.source = this.resonanceAudioScene.createSource()
            this.source.setDirectivityPattern(0, 1)
            
            this.audioContext = THREE.AudioContext.getContext()
        }
        
        this.subscribe(`${this.username}-${this.myUsername}-${this.otherType}`, 'on-simple-peer-signal', this.onSignal)

        window.addEventListener('replacetrack', event => {
            if (this.peer) {
                const {oldTrack, newTrack, stream} = event.detail
                this.peer.replaceTrack(oldTrack, newTrack, stream)
            }
        })
    }

    get username () {
        return this.model.username
    }

    get stream () {
        return window.stream
    }
    
    connect () {
        this.createPeer()
    }
    createPeer () {
        if (this.peer) {
            this.peer.destroy()
            delete this.peer
        }
        this.peer = new SimplePeer({
            initiator: (this.myType === 'extension'),
            trickle: false,
            stream: (this.myType === 'options')? this.stream : new MediaStream(),
        })
        this.hasSentOffer = this.hasSentAnswer = false
        this.peer.on('signal', data => {
            this.publish(this.username, 'simple-peer-signal', {data, username: this.myUsername, type: this.myType})
        })
        this.peer.on('connect', () => {
            console.log('connected')
        })
        this.peer.on('stream', (remoteStream) => {
            this.element.querySelector('video').srcObject = remoteStream
            if (true || this.isMyUser) {
                this.mediaStreamSource = this.audioContext.createMediaStreamSource(remoteStream)
                this.mediaStreamSource.connect(this.source.input)
            }
            console.log('stream', remoteStream)
        })
        this.peer.on('error', (error) => {
            console.error(error)
            this.disconnect()
        })
        this.peer.on('disconnect', () => {
            console.log('disconnect')
            this.disconnect()
        })
    }
    onSignal (data) {
        if (!this.peer) {
            this.createPeer()
        }
        this.peer.signal(data)
    }
    update () {
        if (this.myType === 'extension') {
            this.matrix4.identity()
    
            const {innerWidth, innerHeight} = window
            let x = (this.userModel.mouse.position.x - window.scrollX) / innerWidth
            x *= 5
            x -= 2.5
    
            let y = (this.userModel.mouse.position.y - window.scrollY) / innerHeight
            y *= 5
            y -= 2.5
    
            this.matrix4.setPosition(x, -y, -2)
    
            if (false) {
                this.euler.copy(this.userModel.orientation)
                this.euler.y += (Math.PI/2)
                this.matrix4.makeRotationFromEuler(this.euler)
            }
    
            this.source.setFromMatrix(this.matrix4)
        }
    }
    disconnect () {
        console.log('peer disconnect')
        if (this.peer) {
            this.peer.destroy()
            if (this.mediaStreamSource) {
                this.mediaStreamSource.disconnect()
                delete this.mediaStreamSource
            }
            delete this.peer
        }
    }
}
export default SimplePeerView