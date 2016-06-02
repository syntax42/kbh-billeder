var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Page = new keystone.List('Page', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: 'title'
});

Page.add({
    title: { type: String, required: true },
    state: { type: Types.Select, options: 'draft, published', default: 'draft' },
    content: { type: Types.Html, wysiwyg: true, height: 400 }
});

Page.defaultColumns = 'title, state'
Page.register();
