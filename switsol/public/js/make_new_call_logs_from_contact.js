frappe.provide('frappe.contacts')

$.extend(frappe.contacts, {
	clear_address_and_contact: function(frm) {
		$(frm.fields_dict['address_html'].wrapper).html("");
		frm.fields_dict['contact_html'] && $(frm.fields_dict['contact_html'].wrapper).html("");
	},
	render_address_and_contact: function(frm) {
		// render address
		if(frm.fields_dict['address_html'] && "addr_list" in frm.doc.__onload) {
			$(frm.fields_dict['address_html'].wrapper)
				.html(frappe.render_template("address_list",
					cur_frm.doc.__onload))
				.find(".btn-address").on("click", function() {
					frappe.new_doc("Address");
				});
		}

		// render contact
		if(frm.fields_dict['contact_html'] && "contact_list" in frm.doc.__onload) {
			$(frm.fields_dict['contact_html'].wrapper)
				.html(frappe.render_template("contact_list",
					cur_frm.doc.__onload))
				.find(".btn-contact").on("click", function() {
					frappe.new_doc("Contact");
				}
			);
		}
		
		if(frm.fields_dict['contact_html']) {
			$(frm.fields_dict['contact_html'].wrapper).find(".outgoing-call").on("click", function() {
					make_new_call_log_from_contact($(this).attr("contact-name"),$(this).attr("phone-number"));
				}
			);
		}	
	}
})	


make_new_call_log_from_contact = function(contact_person,phone_number){
	sessionStorage.clear();
	tn = frappe.model.make_new_doc_and_get_name('Call Logs');
	locals['Call Logs'][tn].phone_number = phone_number
	locals['Call Logs'][tn].contact_person = contact_person
    locals['Call Logs'][tn].client = cur_frm.doc.name
	locals['Call Logs'][tn].start_time = frappe.datetime.now_time()
	locals['Call Logs'][tn].call_attendant = user
    locals['Call Logs'][tn].contact_type = cur_frm.doc.doctype
    locals['Call Logs'][tn].call_type = "Outgoing"
	frappe.set_route('Form', 'Call Logs', tn);
}