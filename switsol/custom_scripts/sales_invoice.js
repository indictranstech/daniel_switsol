frappe.ui.form.on("Sales Invoice", {
	refresh : function(frm){
		if (frm.doc.status == "Unpaid" && cur_frm.doc.reminder_count <= 3){
			frm.add_custom_button(__('Reminder '+frm.doc.reminder_count),function(){
				make_reminder_dialog()
			})
		}
	}	
})


make_reminder_dialog = function(){
	var dialog = new frappe.ui.Dialog({
		title: __("Payment Reminder"),
		fields: [
			{
				"label": __("Email Id"), 
				"fieldname": "email_id",
				"fieldtype": "Data",
				"reqd": 1
			},
			{
				"label": __("Predefined Text Container"), 
				"fieldname": "predefined_text_container",
				"fieldtype": "Link", 
				"options": "Predefined Text Container",
				"get_query": function () {
							return {
								filters: [
									["using_doctype", "=", "Payment Entry"],
								]
							}
						},
					change:function(){
						content_of_predefined_text(dialog)
					}
			},
			{
				"label": __("Predefined Text"), 
				"fieldname": "predefined_text",
				"fieldtype": "Text Editor"
			},
			{
				"label": __("Send Reminder"), 
				"fieldname": "send_reminder",
				"fieldtype": "Button"
			}
		]
	});

	dialog.show();
	cur_frm.doc.customer_address ? get_email_id(dialog) : ""
	dialog.fields_dict.send_reminder.$input.click(function(){
		send_payment_reminder(dialog)
		dialog.hide()
	})

}

content_of_predefined_text = function(dialog){
	predefined_content = dialog.fields_dict.predefined_text_container.get_value(); 
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Predefined Text Container",
				fieldname: "predefined_text_container",
				filters: {name:predefined_content}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("predefined_text",r.message.predefined_text_container)
				}
			}
		});

}

get_email_id = function(dialog){
	customer_address = cur_frm.doc.customer_address
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Address",
				fieldname: "email_id",
				filters: {name:customer_address}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("email_id",r.message.email_id)
				}
			}
		});

}

send_payment_reminder = function(dialog){
		frappe.call({
				method: "switsol.custom_scripts.sales_invoice.payment_reminder",
				freeze: true,
				freeze_message: __("Sending Mails"),
				args: {
					"customer_address":cur_frm.doc.customer_address,
					"args" : dialog.get_values()
				},
				callback: function(r) {
					if(r.message){
						cur_frm.set_value("reminder_count",cur_frm.doc.reminder_count+1)
						cur_frm.save_or_update()
						// dialog.hide()
					}
				}
			})
}