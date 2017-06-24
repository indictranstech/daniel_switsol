frappe.ui.form.on("Sales Invoice", {
	refresh : function(frm){
		if (frm.doc.status == "Unpaid" && cur_frm.doc.reminder_count <= 3){
			frm.add_custom_button(__('Reminder ')+' '+frm.doc.reminder_count,function(){
				make_confirm_dialog()
			})
		}
		if (frm.doc.reminder_count == 2) {
			frm.set_value("reminder_status","1. Zahlungserinnerung")
			cur_frm.save_or_update()
		}
		else if (frm.doc.reminder_count == 3) {
			frm.set_value("reminder_status","2. Zahlungserinnerung")
			cur_frm.save_or_update()
		}
		else if (frm.doc.reminder_count == 4) {
			frm.set_value("reminder_status","Betreibungsandrohung")
			cur_frm.save_or_update()
		}
	}	
})

make_confirm_dialog = function(){
	var dialog = new frappe.ui.Dialog({
		title: __("Confirm"),
		fields: [
			{
				"fieldname": "text",
				"fieldtype": "Data",
				"default":__("Would you like to send reminder by email or post?"),
				"read_only": 1
			},
			{
				"fieldname": "sec_brk",
				"fieldtype": "Section Break"
			},
			{
				"label": __("Send by Email"), 
				"fieldname": "send_by_email",
				"fieldtype": "Button"
			},
			{
				"fieldname": "col_brk",
				"fieldtype": "Column Break"
			},
			{
				"label": __("Send by Post"), 
				"fieldname": "send_by_post",
				"fieldtype": "Button"
			}
		]
	});

	dialog.show();
	dialog.fields_dict.send_by_email.$input.click(function(){
		make_reminder_dialog()
		dialog.hide()
	})
	dialog.fields_dict.send_by_post.$input.click(function(){
		var flag = 'Post'
		send_payment_reminder(dialog,flag)
		window.open(frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Sales%20Invoice&name="+cur_frm.doc.name+"&format=Sales%20Invoice%20Switsol%20AG&no_letterhead=0&_lang=de");
		dialog.hide()
	})
	

}
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
			}
		]
	});

	dialog.show();
	cur_frm.doc.customer_address ? get_email_id(dialog) : ""
	dialog.set_primary_action(__("Send Reminder"), function() {
			var flag = 'Reminder'
			send_payment_reminder(dialog,flag)
			dialog.hide()
		});
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

send_payment_reminder = function(dialog,flag){
		frappe.call({
				method: "switsol.custom_scripts.sales_invoice.payment_reminder",
				freeze: true,
				freeze_message: __("Sending")+' '+flag,
				args: {
					"customer_address":cur_frm.doc.customer_address,
					"customer_name" : cur_frm.doc.customer,
					"args" : dialog.get_values(),
					"flag" : flag,
					"reminder_count" : cur_frm.doc.reminder_count,
					"si_name": cur_frm.doc.name
				},
				callback: function(r) {
					if(r.message){
						cur_frm.set_value("reminder_count",cur_frm.doc.reminder_count+1)
						cur_frm.save_or_update()
					}
				}
			})
}