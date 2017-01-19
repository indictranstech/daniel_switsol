cur_frm.add_fetch('infrastructure', 'description', 'description');
frappe.ui.form.on("Customer", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal && (cur_frm.doc.call_comming_from && cur_frm.doc.call_comming_from != "" || frappe.route_options)) {
		// Make Log button
		cur_frm.add_custom_button(__('Make Log'), 
		function() {
			console.log("hihihi")
			click_on_make_log_customer("Yes")                     
		});
        
    }

    if(!cur_frm.doc.__islocal && (cur_frm.doc.call_comming_from && cur_frm.doc.call_comming_from != "" || frappe.route_options)) {
    	click_on_make_log_customer("No");
    	if(frappe.boot.user['language'] == "en"){
    		window.open(frappe.urllib.get_base_url()+"/desk#Form/Call%20Logs/New%20Call%20Logs");
    	}
    	if(frappe.boot.user['language'] == "de"){
    		window.open(frappe.urllib.get_base_url()+"/desk#Form/Call%20Logs/Neu%20Telefon%20Protokoll");
    	}
    }


	if(!cur_frm.doc.__islocal && !frappe.route_options && cur_frm.doc.call_comming_from == "") {
		// Show Log Button
		frm.add_custom_button(__('Show Log'), 
			function() {
				console.log("hihihi")
				show_logs_customer()                      
			});	
	}
})


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


click_on_make_log_customer = function(flag){
    if (frappe.route_options){
        var contact_person = frappe.route_options["contact_person"]
        var phone_number = frappe.route_options["mobile_no"]
        var call_receive_time = frappe.route_options["call_receive_time"]
		var contact_type = frappe.route_options["contact_type"]
		var call_type = frappe.route_options["call_type"]
    	if(flag == "Yes"){
			console.log("in frappe.route_options",frappe.route_options)
	        frappe.route_options = null;
			tn = frappe.model.make_new_doc_and_get_name('Call Logs');
			locals['Call Logs'][tn].call_type = call_type
			locals['Call Logs'][tn].contact_person = contact_person
			locals['Call Logs'][tn].phone_number = phone_number
	        locals['Call Logs'][tn].client = cur_frm.doc.name 
			locals['Call Logs'][tn].start_time = call_receive_time.split(" ")[1]
			locals['Call Logs'][tn].call_attendant = user
	        locals['Call Logs'][tn].contact_type = contact_type
			frappe.set_route('Form', 'Call Logs', tn);
    	}
    	sessionStorage.setItem('call_type',call_type) 
    	sessionStorage.setItem('contact_person',contact_person)
    	sessionStorage.setItem('phone_number',phone_number)
    	sessionStorage.setItem('client',cur_frm.doc.name)
    	sessionStorage.setItem('start_time',call_receive_time.split(" ")[1])
    	sessionStorage.setItem('call_attendant',user)
    	sessionStorage.setItem('contact_type',contact_type)
    }
    else{ 
			if(flag == "Yes"){
				tn = frappe.model.make_new_doc_and_get_name('Call Logs');
				locals['Call Logs'][tn].call_type = "Incoming"
				locals['Call Logs'][tn].contact_person = cur_frm.doc.call_comming_from.split("/")[1]
				locals['Call Logs'][tn].phone_number = cur_frm.doc.call_comming_from.split("/")[0]
		        locals['Call Logs'][tn].client = cur_frm.doc.name
				locals['Call Logs'][tn].start_time = frappe.datetime.now_time()
				locals['Call Logs'][tn].call_attendant = user
		        locals['Call Logs'][tn].contact_type = cur_frm.doc.doctype
				frappe.set_route('Form', 'Call Logs', tn);
			}
		sessionStorage.setItem('call_type',"Incoming") 
    	sessionStorage.setItem('contact_person',cur_frm.doc.call_comming_from.split("/")[1])
    	sessionStorage.setItem('phone_number',cur_frm.doc.call_comming_from.split("/")[0])
    	sessionStorage.setItem('client',cur_frm.doc.name)
    	sessionStorage.setItem('start_time',frappe.datetime.now_time())
    	sessionStorage.setItem('call_attendant',user)
    	sessionStorage.setItem('contact_type',cur_frm.doc.doctype)
	}     
}