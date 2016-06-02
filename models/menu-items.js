var keystone = require('keystone'),
    Types = keystone.Field.Types;

const MENUS = require('../menus').MENUS;

var MenuItem = new keystone.List('Menu item', {
    map: { name: 'title' },
    defaultSort: 'placement,order,title'
});

MenuItem.add({
    title: { type: String, required: true },
    placement: { type: Types.Select, options: MENUS.join(', '), default: MENUS[0] },
    order: { type: Types.Number, format: false },
    page: { type: Types.Relationship, ref: 'Page' },
    link: { type: Types.Url }
});

MenuItem.defaultColumns = 'title, placement, order|20%'
MenuItem.register();
