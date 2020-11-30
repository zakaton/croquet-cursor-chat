import WidgetModel from './WidgetModel.js'

class EmbedWidgetModel extends WidgetModel {
    init (options) {
        super.init(options)

        this.url = options.url
    }
}
EmbedWidgetModel.register('embed-widget')

export default EmbedWidgetModel