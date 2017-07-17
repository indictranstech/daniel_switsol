frappe.provide('frappe.views');

frappe.views.CommunicationComposer = frappe.views.CommunicationComposer.extend({
	init: function(opts){
		this._super(opts);
		this.set_default_value()
	},
	set_default_value : function(){
		var me = this
		if(this.doc.doctype == 'Quotation'){
			frappe.call({
				method: "frappe.client.get_value",
				args: {
					doctype: "Standard Reply",
					fieldname: ["name","response"],
					filters: {"name":"Angebot"}
				},
				callback: function(r) {
					if(r.message) {
						me.dialog.set_value("standard_reply",r.message.name)
						me.dialog.set_value("content",r.message.response)
						me.dialog.fields_dict.standard_reply.$input.change(function(){
							me.dialog.set_value("content","")
			 			})
					}
				}
			});

		
		}
	}

})