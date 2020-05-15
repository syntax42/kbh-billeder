const keystone = require('keystone');
const Types = keystone.Field.Types;

const MapView = new keystone.List('Map view', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: 'order'
});

MapView.add({
    title: { type: String, required: true },
    queryString: { type: Types.Text },
    description: { type: Types.Textarea },
});

MapView.defaultColumns = 'title'

module.exports = MapView;
