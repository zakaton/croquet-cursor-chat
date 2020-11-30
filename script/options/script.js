/* global AFRAME */
/* global Croquet */
/* global tf */
/* global facemesh */
/* global THREE */


import Model from '../croquet/model/Model.js'
import OptionsView from '../croquet/view/OptionsView.js'

const streams = {
    video: null,
    audio: null,
}

window.stream = new MediaStream()
const output = document.getElementById('output')
const outputVideo = output.querySelector('video')
outputVideo.srcObject = window.stream

for (const type in streams) {
    const element = document.getElementById(type)
    const mediaElement = element.querySelector(type)
    const select = element.querySelector('select')
    const toggle = element.querySelector('button')

    navigator.mediaDevices.getUserMedia({[type]: true}).then(stream => {
        streams[type] = stream
        mediaElement.srcObject = stream

        const track = stream.getTracks()[0]
        window.stream.addTrack(track)

        select.addEventListener('input', event => {
            let oldTrack, newTrack

            if (streams[type]) {
                mediaElement.srcObject = null

                const track = streams[type].getTracks()[0]
                if (track) {
                    oldTrack = track

                    track.stop()
                    window.stream.removeTrack(track)
                }
                streams[type] = null
            }
        
            const deviceId = event.target.value
            navigator.mediaDevices.getUserMedia({[type]: {deviceId}}).then(stream => {
                streams[type] = stream
                mediaElement.srcObject = stream

                const track = stream.getTracks()[0]
                window.stream.addTrack(track)

                newTrack = track
                if (oldTrack && newTrack) {
                    window.dispatchEvent(new CustomEvent('replacetrack', {
                        detail: {
                            stream: window.stream,
                            oldTrack,
                            newTrack,
                        }
                    }))
                }
            })
        })

        navigator.mediaDevices.addEventListener('devicechange', () => {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                select.innerHTML = ''
                devices.filter(device => device.kind === `${type}input`).forEach(device => {
                    const {label, deviceId} = device
                    const selected = stream.getTracks()[0].label === label
                    const option = new Option(label, deviceId, selected, selected)
                    select.appendChild(option)
                })
            })
        })
        navigator.mediaDevices.dispatchEvent(new Event('devicechange'))

        toggle.addEventListener('click', event => {
            const track = streams[type].getTracks()[0]
            if (track) {
                const enabled = !track.enabled
                element.classList.toggle('muted')

                if (type === 'audio') {
                    track.enabled = enabled
                }

                if (window.session && event.isTrusted) {
                    const {view} = window.session
                    view.publish(view.username, `${enabled? 'unmute':'mute'}-${type}`, true)
                }
    
                if (type === 'video') {
                    output.classList.toggle('muted')
                    let canvasCaptureStream, canvasCaptureStreamTrack
                    if (element.classList.contains('muted')) {
                        canvasCaptureStream = AFRAME.scenes[0].canvas.captureStream(24)
                        canvasCaptureStreamTrack = canvasCaptureStream.getVideoTracks()[0]
                        window.stream.addTrack(canvasCaptureStreamTrack)
                        window.stream.removeTrack(track)

                        window.dispatchEvent(new CustomEvent('replacetrack', {
                            detail: {
                                stream: window.stream,
                                oldTrack: track,
                                newTrack: canvasCaptureStreamTrack,
                            }
                        }))
                    }
                    else {
                        canvasCaptureStreamTrack = window.stream.getVideoTracks()[0]
                        if (canvasCaptureStreamTrack) {
                            canvasCaptureStreamTrack.stop()
                            window.stream.removeTrack(canvasCaptureStreamTrack)
                        }
                        window.stream.addTrack(track)

                        window.dispatchEvent(new CustomEvent('replacetrack', {
                            detail: {
                                stream: window.stream,
                                oldTrack: canvasCaptureStreamTrack,
                                newTrack: track,
                            }
                        }))
                    }
                }
            }
        })
    })
}

const video = document.querySelector('#video video')
video.addEventListener('loadeddata', () => {
    video.didloaddata = true
})

function radiansToDegrees (radians) {
    return radians * (180 / Math.PI)
}
const headModel = document.getElementById('monkey')
const orientation = new THREE.Euler()
orientation.order = 'YXZ'

tf.setBackend('webgl')
if (false)
tf.ready().then(() => {
    facemesh.load({maxFaces: 1}).then(facemeshModel => {
        function facemeshAnimationFrame () {
            if (video.didloaddata) {
                facemeshModel.estimateFaces(video).then(predictions => {
                    if (predictions.length > 0) {
                        predictions.forEach((prediction) => {
                                       
                            const pTop = new THREE.Vector3(prediction.scaledMesh[10][0], prediction.scaledMesh[10][1], prediction.scaledMesh[10][2])
                            const pBottom = new THREE.Vector3(prediction.scaledMesh[152][0], prediction.scaledMesh[152][1], prediction.scaledMesh[152][2])
                            const pLeft = new THREE.Vector3(prediction.scaledMesh[234][0], prediction.scaledMesh[234][1], prediction.scaledMesh[234][2])
                            const pRight = new THREE.Vector3(prediction.scaledMesh[454][0], prediction.scaledMesh[454][1], prediction.scaledMesh[454][2])
                    
                            const pTB = pTop.clone().addScaledVector(pBottom, -1).normalize()
                            const pLR = pLeft.clone().addScaledVector(pRight, -1).normalize()

                            const yaw = radiansToDegrees(Math.PI / 2 - pLR.angleTo(new THREE.Vector3(0, 0, 1)))
                            const pitch = radiansToDegrees(Math.PI / 2 - pTB.angleTo(new THREE.Vector3(0, 0, 1)))
                            const roll = radiansToDegrees(Math.PI / 2 - pTB.angleTo(new THREE.Vector3(1, 0, 0)))
                            
                            headModel.object3D.rotation.x = -THREE.Math.degToRad(pitch)
                            headModel.object3D.rotation.y = THREE.Math.degToRad(yaw)
                            headModel.object3D.rotation.z = THREE.Math.degToRad(roll)

                            if (window.session) {
                                orientation.set(pitch, yaw, roll)
                                const {view} = window.session
                                view.setThrottle(() => {
                                    view.publish(view.username, 'set-orientation', orientation)
                                }, 1000 / 12, 'set-orientation')
                            }

                            // console.log(yaw.toFixed(2), pitch.toFixed(2), roll.toFixed(2))
                        })
                    }
                })
            }
            requestAnimationFrame(facemeshAnimationFrame)
        }

        facemeshAnimationFrame()
    })
})


const channelElement = document.getElementById('channel')

const roomNameInput = channelElement.querySelector('.roomName input')
const usernameInput = channelElement.querySelector('.username input')

const joinButton = channelElement.querySelector('button')
joinButton.addEventListener('click', () => {

    const roomName = roomNameInput.value
    const username = usernameInput.value

    console.log(roomName, username)

    if(roomName.length && username.length) {

        new Promise(resolve => {
            if (window.session) {
                const {session} = window
                delete window.session
                session.leave().then(() => {
                    resolve()
                })
            }
            else {
                resolve()
            }
        }).then(() => {
            Croquet.Session.join(`croquet.cursor.chat-${roomName}`, Model, OptionsView, {
                autoSleep: false,
                tps: 0,
                viewIdDebugSuffix: `${username}_options`,
                options: {
                    room: roomName,
                },
            }).then(session => {
                window.session = session
                console.log(session)
                try {
                    const url = new URL(session.model.url)
                    url.searchParams.set('croquet-cursor-chat-room', roomName)
                    url.searchParams.set('croquet-cursor-chat-user', username)
                    window.myWindow = window.open(url.href, 'croquet.cursor.chat')
                }
                catch (error) {
                    window.session.leave()
                }
            })
        })
    }
})