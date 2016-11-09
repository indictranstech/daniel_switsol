// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt



frappe.ui.form.on('Call Logs', {
	refresh: function(frm) {
		if(!cur_frm.doc.__islocal && cur_frm.doc.phone_number){			
			html = "<a href='vdsip:" + cur_frm.doc.phone_number + "' onclick='make_new_call_log()' ><i class='icon-phone' aria-hidden='true'></i> <b>Call</b></a>"
			$(cur_frm.fields_dict.outgoing_call.wrapper).html(html);
		}
	}
});

make_new_call_log = function(){
	console.log("make_new_call_log")
	tn = frappe.model.make_new_doc_and_get_name('Call Logs');
	locals['Call Logs'][tn].phone_number = cur_frm.doc.phone_number
	locals['Call Logs'][tn].contact_person = cur_frm.doc.contact_person
    locals['Call Logs'][tn].client = cur_frm.doc.client
	locals['Call Logs'][tn].start_time = frappe.datetime.now_datetime().split(" ")[1]
	locals['Call Logs'][tn].call_attendant = user
    locals['Call Logs'][tn].contact_type = cur_frm.doc.contact_type
	frappe.set_route('Form', 'Call Logs', tn);
}

