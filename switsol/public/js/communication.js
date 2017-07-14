frappe.provide('frappe.views');

frappe.views.CommunicationComposer = frappe.views.CommunicationComposer.extend({
	init: function(opts){
		this._super(opts);
		this.set_default_value()
	},
	set_default_value : function(){
		if(this.doc.doctype == 'Standard Reply'){
			this.dialog.set_value("standard_reply",this.doc.name)
		}
	}

	})