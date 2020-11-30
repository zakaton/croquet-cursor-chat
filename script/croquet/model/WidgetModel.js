/* global Croquet */
/* global THREE */

class WidgetModel extends Croquet.Model {
    init ({type, position}) {
        super.init()

        this.type = type

        const {x, y} = position
        this.position = new THREE.Vector2(x, y)
        this.subscribe(this.id, 'set-position', this.setPosition)
    }

    setPosition ({x, y}) {
        this.position.set(x, y)
        this.publish(this.id, 'did-set-position')
    }
}
WidgetModel.register('widget')

export default WidgetModel