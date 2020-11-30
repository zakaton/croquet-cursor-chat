import View from './View.js'
import ChatView from './ChatView.js'

import TextWidgetView from './TextWidgetView.js'
import ImageWidgetView from './ImageWidgetView.js'
import EmbedWidgetView from './EmbedWidgetView.js'
import AudioWidgetView from './AudioWidgetView.js'

/* global THREE */
/* global ResonanceAudio */
class ExtensionView extends View {
    constructor (model) {
        super(model)

        this.widgets = []

        this.matrix4 = new THREE.Matrix4()

        window.addEventListener('mousemove', event => {
            const x = event.pageX
            const y = event.pageY

            if (this.user) {
                this.user.cursorParent.style.left = `${x}px`
                this.user.cursorParent.style.top = `${y}px`
            }

            if (this.user) {
                const {clientX, clientY} = event
                const {innerWidth, innerHeight} = window

                if ((innerWidth - clientX) < 140) {
                    this.user.cursorParent.classList.add('right')
                }
                else {
                    this.user.cursorParent.classList.remove('right')
                }

                if ((innerHeight - clientY) < 180) {
                    this.user.cursorParent.classList.add('bottom')
                }
                else {
                    this.user.cursorParent.classList.remove('bottom')
                }
            }

            this.setThrottle(() => {
                this.publish(this.username, 'set-mouse-position', {
                    x,
                    y,
                })
            }, 1000 / 12, 'set-mouse-position')
        })

        window.addEventListener('wheel', event => {
            const {x, y} = event
            this.setThrottle(() => {
                this.publish(this.sessionId, 'set-scroll', {x, y, username: this.username})
            }, 1000 / 12, 'set-scroll')
        })
        this.subscribe(this.sessionId, 'did-set-scroll', this.didSetScroll)

        // WINDOW RESIZING/MOVING FOR MODAL POPUPS
        // window.addEventListener('resize', () => {
        //     const {outerWidth, outerHeight} = window
        //     this.setThrottle(() => {
        //         this.publish(this.sessionId, 'set-size', {
        //             width: outerWidth,
        //             height: outerHeight,
        //             username: this.username,
        //         })
        //     }, 1000 / 12, 'set-size')
        // })
        // this.subscribe(this.sessionId, 'did-set-size', this.didSetSize)

        // this.isMouseInside = true
        // window.addEventListener('mouseleave', () => {
        //     this.isMouseInside = false
        // })
        // window.addEventListener('mouseenter', () => {
        //     this.isMouseInside = true
        // })
        // this.subscribe(this.sessionId, 'did-set-position', this.didSetPosition)

        window.addEventListener('message', event => {
            const {data} = event
            if (data.croquet === 'croquet.cursor.chat') {
                const {type} = data
                let string, widget, url

                switch(type) {

                case 'toggle video':
                    this.toggleVideo()
                    break
                case 'toggle audio':
                    this.toggleAudio()
                    break

                case 'url':
                    try {
                        url = new URL(data.url)
                        this.publish(this.sessionId, 'set-url', url.href)
                    } catch (error) {
                        console.error(error)
                    }
                    break
                
                // WIDGETS
                case 'text':
                    this.publish(this.sessionId, 'add-widget', {
                        type,
                    })
                    break
                case 'audio':
                    // FILL
                    // RECORD AUDIO
                    this.publish(this.sessionId, 'add-widget', {
                        type,
                    })
                    break
                case 'image':
                    // FILL
                    // UPLOAD IMAGE
                    this.publish(this.sessionId, 'add-widget', {
                        type,
                    })
                    break
                case 'embed':
                    string = window.prompt('select url to embed')
                    try {
                        url = new URL(string)
                        this.publish(this.sessionId, 'add-widget', {
                            type,
                            url: url.href,
                        })
                    } catch (error) {
                        console.error(error)
                    }
                    break

                case 'remove widget':
                    widget = this.widgets.find(widget => widget.isMouseInside)
                    if (widget) {
                        this.publish(this.sessionId, 'remove-widget', widget.model.id)
                    }
                    break
                
                default:
                    break
                }
            }
        })

        this.subscribe(this.sessionId, 'did-add-widget', this.didAddWidget)
        this.subscribe(this.sessionId, 'did-remove-widget', this.didRemoveWidget)

        this.subscribe(this.sessionId, 'did-set-url', this.didSetUrl)
    }
    
    didSetScroll (username) {
        if (username !== this.username) {
            window.scrollTo(...this.model.scroll.toArray())
        }
    }

    didSetSize (username) {
        if (username !== this.username) {
            window.resizeTo(...this.model.size.toArray())
        }
    }

    didSetPosition (username) {
        if (username !== this.username) {
            window.moveTo(...this.model.position.toArray())
        }
    }

    update () {
        // WINDOW RESIZING/MOVING FOR MODAL POPUPS
        // if (!this.isMouseInside) {
        //     const {screenLeft, screenTop} = window
        //     const leftDelta = Math.abs(screenLeft - this.model.position.x)
        //     const topDelta = Math.abs(screenTop - this.model.position.y)
        //     if (leftDelta > 2 || topDelta > 2) {
        //         this.setThrottle(() => {
        //             this.publish(this.sessionId, 'set-position', {
        //                 x: screenLeft,
        //                 y: screenTop,
        //             })
        //         }, 1000 / 12, 'set-position')
        //     }
        // }

        this.matrix4.makeRotationFromEuler(this.user.model.orientation)
        this.resonanceAudioScene.setListenerFromMatrix(this.matrix4)
        this.widgets.forEach(widget => widget.update())

        super.update()
    }

    onJoin () {
        this.audioContext = THREE.AudioContext.getContext()
        if (!this.audioContext.state !== 'running') {
            document.addEventListener('click', () => {
                this.audioContext.resume()
            }, {once: true})
        }

        this.resonanceAudioScene = window.resonanceAudioScene = new ResonanceAudio(this.audioContext)
        if (false) {
            const material = 'brick-bare'
            this.resonanceAudioScene.setRoomProperties({
                width: 10,
                height: 10,
                depth: 10,
            }, {
                left: material,
                right: material,
                front: material,
                back: material,
                down: material,
                up: material,
            })
        }
        this.resonanceAudioScene.output.connect(this.audioContext.destination)

        this.chatView = new ChatView(this.model.chat)

        super.onJoin()
        this.users.forEach(user => {
            user.simplePeer.connect()
        })

        this.model.widgets.forEach(widget => this.didAddWidget(widget.id))
    }

    onUserJoin (username) {
        super.onUserJoin(username)
        const user = this.getUserByUsername(username)
        user.simplePeer.connect()
    }

    getWidgetById (id) {
        return this.widgets.find(widget => widget.model.id === id)
    }
    didAddWidget (id) {
        let widget = this.getWidgetById(id)
        if (!widget) {
            const widgetModel = this.model.getWidgetById(id)
            if (widgetModel) {
                switch(widgetModel.type) {
                case 'text':
                    widget = new TextWidgetView(widgetModel)
                    break
                case 'image':
                    widget = new ImageWidgetView(widgetModel)
                    break
                case 'audio':
                    widget = new AudioWidgetView(widgetModel)
                    break
                case 'embed':
                    widget = new EmbedWidgetView(widgetModel)
                    break
                default:
                    break
                }

                if (widget) {
                    this.widgets.push(widget)
                }
            }
        }
    }
    didRemoveWidget (id) {
        const widget = this.getWidgetById(id)
        if (widget) {
            widget.detach()
            this.widgets.splice(this.widgets.indexOf(widget), 1)
        }
    }

    toggleVideo () {
        if (this.user.model.isVideoMuted) {
            this.publish(this.username, 'unmute-video', false)
        }
        else {
            this.publish(this.username, 'mute-video', false)
        }
    }
    toggleAudio () {
        if (this.user.model.isAudioMuted) {
            this.publish(this.username, 'unmute-audio', false)
        }
        else {
            this.publish(this.username, 'mute-audio', false)
        }
    }

    didSetUrl () {
        try {
            const url = new URL(this.model.url)
            url.searchParams.set('croquet-cursor-chat-room', this.model.room)
            url.searchParams.set('croquet-cursor-chat-user', this.username)
            location.href = url.href
        } catch (error) {
            console.error(error)
        }
    }

    detach () {
        super.detach()
        this.chat.detach()
        this.audioContext.close()
    }
}

export default ExtensionView