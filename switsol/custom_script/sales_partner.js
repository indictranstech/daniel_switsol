frappe.ui.form.on("Sales Partner", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal && (cur_frm.doc.call_comming_from && cur_frm.doc.call_comming_from != "" || frappe.route_options)) {
		// Make Log button
		cur_frm.add_custom_button(__('Anrufe eintragen'), 
		function() {
			console.log("hihihi")
			click_on_make_log_sales_partner()                      
		});	
	}
	if(!cur_frm.doc.__islocal && !frappe.route_options && cur_frm.doc.call_comming_from == "") {
	// show log button
	cur_frm.add_custom_button(__('Anrufe anzeigen'), 
		function() {
			console.log("hihihi")
			show_logs_sales_partner()                      
		});	
	}
})


show_logs_sales_partner = function(){
	if(frappe.route_options){
		console.log("in if cond")
		frappe.route_options["client_info"] = cur_frm.doc.doctype+"//"+cur_frm.doc.name
	}
	else{
		console.log("in else cond")
		frappe.route_options = {
			"client_info":cur_frm.doc.doctype+"//"+cur_frm.doc.name
		}
	} 
	frappe.set_route("query-report", "Call Logs Report");
}

click_on_make_log_sales_partner = function(name){
	if (frappe.route_options){
		console.log("in frappe.route_options",frappe.route_options)
		var contact_person = frappe.route_options["contact_person"]
		var phone_number = frappe.route_options["mobile_no"]
		var call_receive_time = frappe.route_options["call_receive_time"] 
		var contact_type = frappe.route_options["contact_type"]
		frappe.route_options = null;
		tn = frappe.model.make_new_doc_and_get_name('Call Logs');
		locals['Call Logs'][tn].contact_person = contact_person
		locals['Call Logs'][tn].phone_number = phone_number
		locals['Call Logs'][tn].client = cur_frm.doc.name
		locals['Call Logs'][tn].start_time = call_receive_time.split(" ")[1]
		locals['Call Logs'][tn].call_attendant = user
		locals['Call Logs'][tn].contact_type = contact_type
		frappe.set_route('Form', 'Call Logs', tn);
    }

    else{
		tn = frappe.model.make_new_doc_and_get_name('Call Logs');
		locals['Call Logs'][tn].contact_person = cur_frm.doc.call_comming_from.split("/")[1]
		locals['Call Logs'][tn].phone_number = cur_frm.doc.call_comming_from.split("/")[0]
       	locals['Call Logs'][tn].client = cur_frm.doc.name 
		locals['Call Logs'][tn].start_time = frappe.datetime.now_datetime().split(" ")[1]
		locals['Call Logs'][tn].call_attendant = user
        locals['Call Logs'][tn].contact_type = cur_frm.doc.doctype
		frappe.set_route('Form', 'Call Logs', tn);
    }
}