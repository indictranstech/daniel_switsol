cur_frm.add_fetch('infrastructure', 'description', 'description');
frappe.ui.form.on("Customer", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal && (cur_frm.doc.call_comming_from && cur_frm.doc.call_comming_from != "" || frappe.route_options)) {
		// Make Log button
		cur_frm.add_custom_button(__('Anrufe eintragen'), 
		function() {
			console.log("hihihi")
			click_on_make_log_customer()                      
		}, "icon-exclamation", "btn-default make_log");
        
    }
	if(!cur_frm.doc.__islocal && !frappe.route_options && cur_frm.doc.call_comming_from == "") {
		// Show Log Button
		cur_frm.add_custom_button(__('Anrufe anzeigen'), 
			function() {
				console.log("hihihi")
				show_logs_customer()                      
			}, "icon-exclamation", "show_log");	
	}
    
    if(!cur_frm.doc.__islocal){
		frappe.call({
			method: "switsol.switsol.doctype.call_logs.call_logs.get_call_log_data",
			args: {
				"customer":cur_frm.doc.name,
			},
			callback: function(r) {
				if (r.message){
			   		console.log(r.message,r.message['call_log_communication_datails'].split("/")[2])
					if(r.message['call_log_communication_datails'].split("/")[2] == "Call Logs"){
						$($('[data-doctype="Call Logs"]')[0]).html("<a href='desk#Form/Call Logs/"+r.message['call_log_communication_datails'].split("/")[3]+"'"+">"+r.message['call_log_communication_datails'].split("//")[0]+"</a>")
					}
					if(r.message['call_log_communication_datails'].split("/")[2] == "Communication"){
						$($('[data-doctype="Call Logs"]')[0]).html("<a href='desk#Form/Communication/"+r.message['call_log_communication_datails'].split("/")[3]+"'"+">"+r.message['call_log_communication_datails'].split("//")[0]+"</a>")
					}
					if(r.message['todo_details'].split("//")[0]){
						$($('[data-doctype="Call Logs"]')[1]).html("<div class='row'>\
							<div class='col-xs-6'>\
								<a href='desk#Form/ToDo/"+r.message['todo_details'].split("//")[1]+"'"+">"+r.message['todo_details'].split("//")[0]+"</a>\
							</div>\
							<div client='col-xs-6'>\
								<button class='btn btn-default btn-xs' data-fieldname='add_todo' onclick='add_new_todo()'>"+__('Add another next contact')+"</button>\
							</div>\
							</div>")
					}
					if(r.message['call_log_communication_datails'] == ""){
						$($('[data-doctype="Call Logs"]')[0]).html("<p></p>")	
					}
					if(r.message['todo_details'] == ""){
						$($('[data-doctype="Call Logs"]')[1]).html("<div class='row'>\
							<div class='col-xs-6'>\
								<a href='desk#Form/ToDo/"+r.message['todo_details'].split("//")[1]+"'"+">"+r.message['todo_details'].split("//")[0]+"</a>\
							</div>\
							<div client='col-xs-6'>\
								<button class='btn btn-default btn-xs' data-fieldname='add_todo' onclick='add_new_todo()'>"+__('Add another next contact')+"</button>\
							</div>\
							</div>")
					}
				}
			}
		})
	}  
})

add_new_todo = function(){
	console.log("add new todo")
	tn = frappe.model.make_new_doc_and_get_name('ToDo');
	locals['ToDo'][tn].reference_type = "Customer"
	locals['ToDo'][tn].reference_name = cur_frm.doc.customer_name
	frappe.set_route('Form', 'ToDo', tn);
}

show_logs_customer = function(){
	if(frappe.route_options){
		console.log("in if cond")
		//frappe.route_options["client_info"] = cur_frm.doc.doctype+"//"+cur_frm.doc.name
	}
	else{
		console.log("in else cond")
		frappe.route_options = {
			"client_info":cur_frm.doc.doctype+"//"+cur_frm.doc.name
		}
	}
	frappe.set_route("query-report", "Call Logs Report");
}


click_on_make_log_customer = function(name){
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