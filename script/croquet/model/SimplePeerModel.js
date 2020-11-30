/* global Croquet */

class SimplePeerModel extends Croquet.Model {
    init ({username}) {
        super.init()

        this.username = username
        
        this.subscribe(this.username, 'simple-peer-signal', this.onSignal)
    }

    onSignal ({username, data, type}) {
        this.publish(`${username}-${this.username}-${type}`, 'on-simple-peer-signal', data)
    }
}
SimplePeerModel.register('simple-peer')

export default SimplePeerModel