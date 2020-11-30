/* global Croquet */

import Model from './croquet/model/Model.js'
import ExtensionView from './croquet/view/ExtensionView.js'

const url = new URL(location)
const room = url.searchParams.get('croquet-cursor-chat-room')
const user = url.searchParams.get('croquet-cursor-chat-user')

Croquet.Session.join(`croquet.cursor.chat-${room}`, Model, ExtensionView, {
    autoSleep: false,
    tps: 0,

    viewIdDebugSuffix: `${user}_extension`,

    options: {
        room,
    },
}).then(session => {
    window.session = session
})