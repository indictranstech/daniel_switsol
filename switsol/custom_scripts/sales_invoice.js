frappe.ui.form.on("Sales Invoice", {
	refresh : function(frm){
		if (frm.doc.status == "Unpaid" && cur_frm.doc.reminder_count <= 3){
			frm.add_custom_button(__('Reminder')+' '+frm.doc.reminder_count,function(){
				make_confirm_dialog()
			})
		}
	}	
})

reminder_logs = function(reminder_status){
	frappe.call({
				method: "switsol.custom_scripts.sales_invoice.reminder_logs",
				args: {
					"si_name": cur_frm.doc.name
				},
				callback: function(r) {
					if(r.message){
						
					}
				}
			})
	
}

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
		var flag = 'Reminder'
		make_reminder_dialog(flag)
		dialog.hide()
	})
	dialog.fields_dict.send_by_post.$input.click(function(){
		var flag = 'Post'
		make_reminder_dialog(flag)
		dialog.hide()
	})
	

}
make_reminder_dialog = function(flag){
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

	if(flag == "Reminder"){
		button = 'Send Reminder'
		cur_frm.doc.customer_address ? get_email_id(dialog) : ""
	}
	else {
		button = 'Send Letter'
		dialog.fields_dict.email_id.$wrapper.hide()
		dialog.get_field('email_id').df.reqd = 0
	}

	dialog.set_primary_action(__(button), function() {
			send_payment_reminder(dialog,flag)
			// "http://mag-test.switsol.ch/api/method/frappe.utils.print_format.download_pdf?doctype=Letter&name=LT-00002&format=Letter%20SI%20Switsol%20AG&no_letterhead=0&_lang=de"
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
				freeze_message: __("Sending")+' '+__(flag),
				args: {
					"customer_name" : cur_frm.doc.customer,
					"args" : dialog.get_values(),
					"flag" : flag,
					"reminder_count" : cur_frm.doc.reminder_count,
					"si_name": cur_frm.doc.name
				},
				callback: function(r) {
					if(r.message){
						cur_frm.reload_doc()
						if(flag=='Post'){
							window.open(frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Letter&name="+r.message+"&format=Letter%20SI%20Switsol%20AG&no_letterhead=0&_lang=de");
						}
					}
				}
			})
}