const keystone = require('keystone');
const Types = keystone.Field.Types;

const SiteMessage = new keystone.List('Site message', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: 'title'
});

SiteMessage.add({
    title: { type: String, required: true },
    description: { type: Types.Textarea },
});

SiteMessage.schema.post('save', function(doc) {
    require('../menus').reloadMessages();
  });
SiteMessage.schema.post('remove', function(doc) {
    require('../menus').reloadMessages();
  });

SiteMessage.defaultColumns = 'title';

module.exports = SiteMessage;
