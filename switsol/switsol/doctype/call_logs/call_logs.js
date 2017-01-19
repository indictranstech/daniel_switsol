// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt



frappe.ui.form.on('Call Logs', {
	refresh: function(frm) {
		if(!cur_frm.doc.__islocal && cur_frm.doc.phone_number){			
			html = "<a href='vdsip:" + cur_frm.doc.phone_number + "' onclick='make_new_call_log()' ><i class='icon-phone' aria-hidden='true'></i> <b>Call</b></a>"
			$(cur_frm.fields_dict.outgoing_call.wrapper).html(html);
		
		}
		if(sessionStorage.length && cur_frm.doc.__islocal){
			console.log(sessionStorage['call_attendant'])
			cur_frm.set_value('phone_number',sessionStorage['phone_number'])
			cur_frm.set_value('contact_type',sessionStorage['contact_type'])
			cur_frm.set_value('contact_person',sessionStorage['contact_person'])
			cur_frm.set_value('client',sessionStorage['client'])
			cur_frm.set_value('call_attendant',sessionStorage['call_attendant'])
			cur_frm.set_value('start_time',sessionStorage['start_time'])
			cur_frm.set_value('call_type',sessionStorage['call_type'])
		}
	}
});

make_new_call_log = function(){
	console.log("make_new_call_log")
	sessionStorage.clear();
	tn = frappe.model.make_new_doc_and_get_name('Call Logs');
	locals['Call Logs'][tn].phone_number = cur_frm.doc.phone_number
	locals['Call Logs'][tn].contact_person = cur_frm.doc.contact_person
    locals['Call Logs'][tn].client = cur_frm.doc.client
	locals['Call Logs'][tn].start_time = frappe.datetime.now_time()
	locals['Call Logs'][tn].call_attendant = user
    locals['Call Logs'][tn].contact_type = cur_frm.doc.contact_type
	locals['Call Logs'][tn].call_type = "Outgoing"
	frappe.set_route('Form', 'Call Logs', tn);
}

frappe.ui.form.on("Call Logs",{ 
	validate:function(frm) {
		if(cur_frm.doc.__islocal && cur_frm.doc.start_time){
			cur_frm.set_value("end_time","")
			cur_frm.set_value("end_time",frappe.datetime.now_time())
			frappe.call({
				method: "switsol.switsol.make_user.update_reference_person_after_making_call_logs",
				args: {
					"reference_person": cur_frm.doc.client,
					"reference_type":cur_frm.doc.contact_type
				},
				callback: function(r) {
				
				}
			})
		}
	},	
	refresh:function(frm) {
		if(cur_frm.doc.client && !cur_frm.doc.__islocal){
			// Show Logs	
			cur_frm.add_custom_button(__('Show Log'), 
			function() {
				console.log("hihihi")
				show_logs()                      
			});		
		}
	},  	
})


show_logs = function(){
	if(frappe.route_options){
		console.log("in if cond")
		frappe.route_options["client_info"] = cur_frm.doc.doctype+"//"+cur_frm.doc.name+"//"+cur_frm.doc.client+"//"+cur_frm.doc.phone_number
	}
	else{
		console.log("in else cond")
        console.log(cur_frm.doc.doctype+"//"+cur_frm.doc.name+"//"+cur_frm.doc.client+"//"+cur_frm.doc.phone_number,"aaaaaaaaaa") 	
		frappe.route_options = {
			"client_info":cur_frm.doc.doctype+"//"+cur_frm.doc.name+"//"+cur_frm.doc.client+"//"+cur_frm.doc.phone_number
		}
	} 
	frappe.set_route("query-report", "Call Logs Report");
}