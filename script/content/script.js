/* global chrome */

chrome.runtime.onMessage.addListener(message => {
    if (message.croquet === 'croquet.cursor.chat') {
        window.postMessage(message)
    }
})

const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement

function importScript ({src, type, defer, onload}) {
    const script = document.createElement('script')
    script.src = chrome.extension.getURL(`script/${src}.js`)
    
    if(type) script.type = type
    if(defer) script.defer = defer
    if(onload) script.onload = onload
        
    head.insertBefore(script, head.lastChild)
}

function importStyle ({href, onload}) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = chrome.extension.getURL(`style/${href}.css`)

    if(onload) link.onload = onload
    head.insertBefore(link, head.lastChild)
}

window.addEventListener('load', () => {
    const extensionUrlMeta = document.createElement('meta')
    extensionUrlMeta.name = 'croquet-cursor-chat-extension-url'
    extensionUrlMeta.content = chrome.extension.getURL('')
    document.head.appendChild(extensionUrlMeta)

    if(!document.querySelector('meta[charset="utf-8"]')) {
        const charsetMeta = document.createElement('meta')
        charsetMeta.setAttribute('charset', 'utf-8')
        document.head.appendChild(charsetMeta)
    }

    importStyle({
        href: 'style',
        onload: () => {
            importScript({
                src: 'croquet/croquet.min',
                onload: () => {
                    importScript({
                        src: 'simple-peer/simple-peer.min',
                        onload: () => {
                            importScript({
                                src: 'resonance-audio/resonance-audio.min',
                                onload: () => {
                                    importScript({
                                        src: 'aframe/aframe.min',
                                        onload: () => {
                                            importScript({
                                                src: 'script',
                                                type: 'module',
                                            })
                                        }
                                    })
                                }
                            })
                        },
                    })
                }
            })
        },
    })
})
