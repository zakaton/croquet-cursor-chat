/* global chrome */

// CREATE WIDGETS
chrome.contextMenus.create({
    title: 'Open link in Croquet Session',
    contexts: ['link'],
    onclick: (event) => {
        const {pageUrl, linkUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'url',
                url: linkUrl,
            })
        })
    }
})

chrome.contextMenus.create({
    title: 'Add Note 📝',
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'text',
            })
        })
    }
})

chrome.contextMenus.create({
    title: 'Post Image 🖼',
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'image',
            })
        })
    }
})

chrome.contextMenus.create({
    title: 'Create Voice Message 👄',
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'audio',
            })
        })
    }
})

chrome.contextMenus.create({
    title: 'Embed 🔗',
    onclick: (event) => {
        console.log(event)
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'embed',
            })
        })
    }
})

// MUTE/UNMUTE
chrome.contextMenus.create({
    title: 'Toggle Camera 🎦',
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'toggle video',
            })
        })
    }
})
chrome.contextMenus.create({
    title: 'Toggle Microphone 🎤',
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'toggle audio',
            })
        })
    }
})


// MODIFY WIDGETS
/*
chrome.contextMenus.create({
    title: 'Remove Widget',
    contexts: ['all'],
    onclick: (event) => {
        const {pageUrl} = event
        chrome.tabs.query({active: true, url: pageUrl}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {
                croquet: 'croquet.cursor.chat',
                type: 'remove widget',
            })
        })
    }
})
*/


// SEARCHBOX
chrome.omnibox.onInputEntered.addListener(url => {
    chrome.tabs.query({active: true}, tabs => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                croquet: 'croquet.cursor.chat',
                type: 'url',
                url,
            })
        })
    })
})