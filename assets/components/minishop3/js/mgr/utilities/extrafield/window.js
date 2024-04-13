ms3.window.CreateExtraField = function (config) {
    config = config || {};

    Ext.applyIf(config, {
        title: _('ms3_menu_create'),
        width: 600,
        baseParams: {
            action: 'MiniShop3\\Processors\\Utilities\\ExtraField\\Create',
        },
    });
    ms3.window.CreateExtraField.superclass.constructor.call(this, config);
};

Ext.extend(ms3.window.CreateExtraField, ms3.window.Default, {

    getFields: function (config) {
        const existsInDatabase = (config.record !== undefined) ? config.record.exists : false;
        const existsMessage = (config.record !== undefined) ? config.record.exists_message : '';
        return [
            {
                xtype: 'hidden',
                name: 'id',
                id: config.id + '-id'
            }, {
                layout: 'column',
                items: [{
                    columnWidth: 1,
                    layout: 'form',
                    defaults: { msgTarget: 'under' },
                    items: [{
                        xtype: 'ms3-combo-combobox-default',
                        fieldLabel: _('ms3_extrafields_class'),
                        name: 'class',
                        hiddenName: 'class',
                        anchor: '99%',
                        id: config.id + '-class',
                        allowBlank: true,
                        disabled: existsInDatabase,
                        mode: 'local',
                        displayField: 'class',
                        valueField: 'class',
                        store: new Ext.data.ArrayStore({
                            id: 0,
                            fields: ['class'],
                            data: [
                                ['MiniShop3\\Model\\msProductData'],
                                ['MiniShop3\\Model\\msVendor']
                            ]
                        }),
                    }],
                }]
            }, {
                layout: 'column',
                items: [{
                    columnWidth: .33,
                    layout: 'form',
                    defaults: { msgTarget: 'under' },
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('ms3_extrafields_key'),
                        name: 'key',
                        anchor: '99%',
                        id: config.id + '-key',
                        allowBlank: true,
                        disabled: existsInDatabase,
                    }],
                }, {
                    columnWidth: .41,
                    layout: 'form',
                    items: [{
                        xtype: 'ms3-combo-combobox-default',
                        fieldLabel: _('ms3_extrafields_xtype'),
                        name: 'xtype',
                        hiddenName: 'xtype',
                        anchor: '99%',
                        id: config.id + '-xtype',
                        allowBlank: true,
                        editable: true,
                        forceSelection: false,
                        //disabled: existsInDatabase,
                        mode: 'local',
                        displayField: 'value',
                        valueField: 'value',
                        store: new Ext.data.ArrayStore({
                            id: 0,
                            fields: ['value'],
                            data: [
                                ['textfield'],
                                ['textarea']
                            ]
                        }),
                    }],
                }, {
                    columnWidth: .25,
                    layout: 'form',
                    items: [{
                        xtype: 'xcheckbox',
                        fieldLabel: _('ms3_active'),
                        boxLabel: _('ms3_active'),
                        name: 'active',
                        anchor: '99%',
                        id: config.id + '-active',
                        style: { paddingTop: '10px' },
                        disabled: !existsInDatabase,
                    }],
                }]
            }, {
                layout: 'column',
                items: [{
                    columnWidth: .33,
                    layout: 'form',
                    defaults: { msgTarget: 'under' },
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('ms3_extrafields_label'),
                        name: 'label',
                        anchor: '99%',
                        id: config.id + '-label',
                        allowBlank: true,
                        //disabled: existsInDatabase,
                    }],
                }, {
                    columnWidth: .66,
                    layout: 'form',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('ms3_extrafields_description'),
                        name: 'description',
                        anchor: '99%',
                        id: config.id + '-description',
                        allowBlank: true,
                        //disabled: existsInDatabase,
                    }],
                }]
            }, {
                xtype: 'displayfield',
                cls: 'text-success',
                html: existsMessage,
                id: config.id + '-exists-message',
                hidden: !existsInDatabase
            }, {
                id: config.id + '-create',
                name: 'create',
                xtype: 'hidden',
                value: false
            }, {
                xtype: 'fieldset',
                title: existsInDatabase ? _('ms3_extrafields_created') : _('ms3_extrafields_create'),
                layout: 'column',
                defaults: { msgTarget: 'under', border: false },
                checkboxToggle: !existsInDatabase,
                cls: existsInDatabase ? '' : 'x-fieldset-checkbox-toggle',
                collapsed: !existsInDatabase,
                listeners: {
                    expand: {
                        fn: function (p) {
                            Ext.getCmp(config.id + '-create').setValue(true);
                            Ext.getCmp(config.id + '-active').enable();
                        }, scope: this
                    },
                    collapse: {
                        fn: function (p) {
                            Ext.getCmp(config.id + '-create').setValue(false);
                            Ext.getCmp(config.id + '-active').disable();
                            Ext.getCmp(config.id + '-active').setValue(false);
                        }, scope: this
                    }
                },
                items: [{
                    columnWidth: 1,
                    layout: 'form',
                    items: [{
                        layout: 'column',
                        items: [{
                            columnWidth: .33,
                            layout: 'form',
                            defaults: { msgTarget: 'under' },
                            items: [{
                                xtype: 'ms3-combo-combobox-default',
                                fieldLabel: _('ms3_extrafields_dbtype'),
                                name: 'dbtype',
                                hiddenName: 'dbtype',
                                anchor: '99%',
                                id: config.id + '-dbtype',
                                allowBlank: true,
                                disabled: existsInDatabase,
                                mode: 'local',
                                displayField: 'value',
                                valueField: 'value',
                                store: new Ext.data.ArrayStore({
                                    id: 0,
                                    fields: ['value'],
                                    // https://cheatography.com/beeftornado/cheat-sheets/mysql-5-7-data-types/
                                    data: [
                                        ['tinyint'],
                                        ['smallint'],
                                        ['mediumint'],
                                        ['int'],
                                        ['bigint'],
                                        ['float'],
                                        ['double'],
                                        ['decimal'],
                                        ['char'],
                                        ['varchar'],
                                        ['tinytext'],
                                        ['text'],
                                        ['mediumtext'],
                                        ['longtext'],
                                        ['year'],
                                        ['date'],
                                        ['time'],
                                        ['datetime'],
                                        ['timestamp']
                                    ]
                                }),
                            }],
                        }, {
                            columnWidth: .33,
                            layout: 'form',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('ms3_extrafields_precision'),
                                name: 'precision',
                                anchor: '99%',
                                id: config.id + '-precision',
                                allowBlank: true,
                                disabled: existsInDatabase
                            }]
                        }, {
                            columnWidth: .33,
                            layout: 'form',
                            items: [{
                                xtype: 'ms3-combo-combobox-default',
                                fieldLabel: _('ms3_extrafields_phptype'),
                                name: 'phptype',
                                hiddenName: 'phptype',
                                anchor: '99%',
                                id: config.id + '-phptype',
                                allowBlank: true,
                                mode: 'local',
                                displayField: 'value',
                                valueField: 'value',
                                store: new Ext.data.ArrayStore({
                                    id: 0,
                                    fields: ['value'],
                                    data: [
                                        ['string'],
                                        ['boolean'],
                                        ['integer'],
                                        ['float'],
                                        ['json'],
                                        ['datetime']
                                    ]
                                })
                            }],
                        }]
                    }, {
                        layout: 'column',
                        items: [{
                            columnWidth: .33,
                            layout: 'form',
                            defaults: { msgTarget: 'under' },
                            items: [{
                                xtype: 'ms3-combo-combobox-default',
                                fieldLabel: _('ms3_extrafields_attributes'),
                                name: 'attributes',
                                hiddenName: 'attributes',
                                anchor: '99%',
                                id: config.id + '-attributes',
                                allowBlank: true,
                                disabled: existsInDatabase,
                                mode: 'local',
                                displayField: 'title',
                                valueField: 'value',
                                store: new Ext.data.ArrayStore({
                                    id: 0,
                                    fields: ['value', 'title'],
                                    data: [
                                        ['', _('no')],
                                        ['BINARY', 'BINARY'],
                                        ['UNSIGNED', 'UNSIGNED'],
                                        ['UNSIGNED ZEROFILL', 'UNSIGNED ZEROFILL'],
                                        ['on update CURRENT_TIMESTAMP', 'on update CURRENT_TIMESTAMP'],
                                    ]
                                })
                            }],
                        }, {
                            columnWidth: .33,
                            layout: 'form',
                            items: [{
                                xtype: 'ms3-combo-combobox-default',
                                fieldLabel: _('ms3_extrafields_default'),
                                name: 'default',
                                hiddenName: 'default',
                                anchor: '99%',
                                id: config.id + '-default',
                                allowBlank: true,
                                disabled: existsInDatabase,
                                mode: 'local',
                                displayField: 'title',
                                valueField: 'value',
                                store: new Ext.data.ArrayStore({
                                    id: 0,
                                    fields: ['value', 'title'],
                                    data: [
                                        ['', _('no')],
                                        ['NULL', 'NULL'],
                                        ['CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP'],
                                        ['USER_DEFINED', 'Как определено:']
                                    ]
                                }),
                                listeners: {
                                    afterrender: {
                                        fn: function (select, rec) {
                                            this.handleDefaultFields(select);
                                        }, scope: this
                                    },
                                    select: {
                                        fn: function (select, rec) {
                                            this.handleDefaultFields(select);
                                        }, scope: this
                                    }
                                }
                            }]
                        }, {
                            columnWidth: .33,
                            layout: 'form',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('ms3_extrafields_default_value'),
                                name: 'default_value',
                                anchor: '99%',
                                id: config.id + '-default_value',
                                allowBlank: true,
                                disabled: existsInDatabase,
                            }],
                        }]
                    }, {
                        xtype: 'xcheckbox',
                        //fieldLabel: _('ms3_extrafields_null'),
                        boxLabel: _('ms3_extrafields_null'),
                        name: 'null',
                        anchor: '99%',
                        id: config.id + '-null',
                        allowBlank: true,
                        disabled: existsInDatabase,
                    }]
                }]
            }
        ];
    },

    handleDefaultFields: function (select) {
        const value = select.getValue();
        let defaultValueElement = Ext.getCmp(this.config.id + '-default_value');
        if (value === 'USER_DEFINED') {
            defaultValueElement.show();
        } else {
            defaultValueElement.setValue('');
            defaultValueElement.hide();
        }
    },

});
Ext.reg('ms3-window-extra-field-create', ms3.window.CreateExtraField);


ms3.window.UpdateExtraField = function (config) {
    config = config || {};

    Ext.applyIf(config, {
        title: _('ms3_menu_update'),
        baseParams: {
            action: 'MiniShop3\\Processors\\Utilities\\ExtraField\\Update',
        }
    });
    ms3.window.UpdateExtraField.superclass.constructor.call(this, config);
};
Ext.extend(ms3.window.UpdateExtraField, ms3.window.CreateExtraField, {

    getFields: function (config) {
        const fields = ms3.window.CreateExtraField.prototype.getFields.call(this, config);

        for (const i in fields) {
            if (!fields.hasOwnProperty(i)) {
                continue;
            }
            //const field = fields[i];
            //if (field.name === 'type') {
            //    field.disabled = true;
            //}
        }

        return fields;
    }

});
Ext.reg('ms3-window-extra-field-update', ms3.window.UpdateExtraField);
