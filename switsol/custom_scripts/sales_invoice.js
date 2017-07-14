frappe.ui.form.on("Sales Invoice", {
	refresh : function(frm){
		if (frm.doc.status == "Unpaid" && cur_frm.doc.reminder_count <= 3){
			frm.add_custom_button(__('Reminder')+' '+frm.doc.reminder_count,function(){
				make_confirm_dialog()
			})
		}
	},
	onload: function(frm){
		if(frm.doc.__islocal) {
			frm.set_value("reminder_count",1)
			frm.doc.reminder_logs = []		
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
				"label": __("Greeting"),
				"fieldname":"greeting",
				"fieldtype":"Data",
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
				"label": __("Subject"),
				"fieldname":"subject",
				"fieldtype":"Data",
			},
			{
				"label": __("Predefined Text"), 
				"fieldname": "predefined_text",
				"fieldtype": "Text Editor"
			},
			{
				"label":__("Signed By"),
				"fieldname": "signed_by",
				"fieldtype":"Link",
				"options":"User"
			}
		]
	});
	dialog.show();
	get_greeting(dialog)
	if(flag == "Reminder"){
		button = __('Send Reminder')
		dialog.fields_dict.signed_by.$wrapper.hide()
		cur_frm.doc.customer_address ? get_email_id(dialog) : ""
	}
	else {
		button = __('Send Letter')
		dialog.fields_dict.email_id.$wrapper.hide()
		dialog.get_field('email_id').df.reqd = 0
	}

	dialog.set_primary_action(button, function() {
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
				fieldname: ["predefined_text_container","subject"],
				filters: {name:predefined_content}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("predefined_text",r.message.predefined_text_container)
					dialog.set_value("subject",r.message.subject)
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
get_greeting = function(dialog){
	customer = cur_frm.doc.customer
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Customer",
				fieldname: "greeting",
				filters: {name:customer}
			},
			callback: function(r) {
				if(r.message) {
					var surname = ""
					var customer_surname = cur_frm.doc.customer_name.split(" ")
					if (customer_surname.length != 0 && customer_surname.length > 1 ){
						surname = customer_surname.slice(1).join(" ");
					}
					else {
						surname = cur_frm.doc.customer_name
					}
					if (frappe.boot.user.language =='de') {
						if (r.message.greeting =='Mrs'){
							var greeting = 'Sehr geehrte Frau ' + surname
							dialog.set_value("greeting",greeting)
						}
						else {
							var greeting = 'Sehr geehrter Herr ' + surname
							dialog.set_value("greeting",greeting)
						}
					}
					else{
						var greeting = 'Dear '+ r.message.greeting +' ' + surname
						dialog.set_value("greeting",greeting)
					}
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