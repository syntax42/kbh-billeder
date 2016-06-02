var keystone = require('keystone'),
    Types = keystone.Field.Types;

var GalleryItem = new keystone.List('Gallery item', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: 'title'
});

GalleryItem.add({
    title: { type: String, required: true },
    description: { type: Types.Textarea },
    image: { type: Types.Url },
    link: { type: Types.Url }
});

GalleryItem.defaultColumns = 'title'
GalleryItem.register();
