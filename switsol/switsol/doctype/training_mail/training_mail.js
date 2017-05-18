// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

cur_frm.add_fetch('email_content','predefined_text_container','predefined_text_container');
cur_frm.add_fetch('project_name','training_id','training_id');
cur_frm.add_fetch('contact_name','email_id','email_id');
cur_frm.add_fetch('contact_name','first_name','first_name');

frappe.ui.form.on('Training Mail', {
	/*refresh: function(frm) {

	},
	project: function(frm){
		training_id = get_email_id_or_training_id()
		var row = frappe.model.add_child(frm.doc, "Training Mail Project Details", "training_mail_project_details");
		row.project_name = frm.doc.project;
		row.training_id = training_id
		frm.refresh_field("training_mail_project_details")
	},
	contact: function(frm){
		email_id = get_email_id_or_training_id()
		var row = frappe.model.add_child(frm.doc, "Training Mail Contact Details", "training_mail_contact_details");
		row.email_id = email_id;
		frm.refresh_field("training_mail_contact_details")
	},*/
	send_mail: function(frm){
		console.log("inside send_mail")
		if (cur_frm.doc.training_mail_project_details.length && cur_frm.doc.training_mail_contact_details.length){
			send_mail();
		}
		else{
			msgprint(__("Please Add Project and Contact Details."))
		}
	}
});


cur_frm.fields_dict.training_mail_project_details.grid.get_field("project_name").get_query = function(doc) {	
	var p_list = []
	for(var i = 0 ; i < cur_frm.doc.training_mail_project_details.length ; i++){
		if(cur_frm.doc.training_mail_project_details[i].project_name){
			p_list.push(cur_frm.doc.training_mail_project_details[i].project_name);
		}
	}
	return {
	filters: [
			['Project', 'name', 'not in', p_list]
		]
	}
}

cur_frm.fields_dict.training_mail_contact_details.grid.get_field("contact_name").get_query = function(doc) {
	var c_list = []
	for(var i = 0 ; i < cur_frm.doc.training_mail_contact_details.length ; i++){
		if(cur_frm.doc.training_mail_contact_details[i].contact_name){
			c_list.push(cur_frm.doc.training_mail_contact_details[i].contact_name);
		}
	}
	if(doc.customer) {
		return {
		filters: [
				['Contact', 'name', 'not in', c_list],
				['Contact', 'customer', '=', cur_frm.doc.customer]
			]
		}
	}
	else{
		return {
		filters: [
				['Contact', 'name', 'not in', c_list]
			]
		}
	}
}


send_mail = function(frm){
	frappe.call({
		method: "switsol.switsol.doctype.training_mail.training_mail.send_mail_to_client",
		freeze: true,
		freeze_message: __("Sending Mails"),
		args: {
			"project_data" : cur_frm.doc.training_mail_project_details,
			"contact_data" : cur_frm.doc.training_mail_contact_details
		},
		callback: function(r) {
			if(r.message){
					
			}
		}
	})
}

/*get_email_id = function(frm){
	var email_id 
	contact = cur_frm.doc.contact
    frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Contact",
				fieldname: "email_id",
				filters: {name:contact}
			},
			async: false,
			callback: function(r) {
				if(r.message) {
					email_id = r.message['email_id']
				}

			}
		});
    return email_id
}*/

/*get_training_id = function(){
	var training_id = ""
	project = cur_frm.doc.project
	frappe.call({
		method: "frappe.client.get_value",
		args: {
			doctype: "Project",
			fieldname: "training_id",
			filters: {name:project}
		},
		async: false,
		callback: function(r) {
			if(r.message) {
				training_id = r.message['training_id']
			}
		}
	});
	return training_id
}*/