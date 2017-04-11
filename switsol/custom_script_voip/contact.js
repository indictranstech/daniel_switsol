frappe.ui.form.on('Contact',{ 
	refresh: function(frm) {
		if(!cur_frm.doc.__islocal && frappe.route_options){
			if(frappe.route_options["doctype"] && frappe.route_options["doc_name"] && frappe.route_options["new_contact"] == "Yes"){
		        frappe.route_options["contact_person"] = cur_frm.doc.name
				//frappe.route_options["mobile_no"] = cur_frm.doc.mobile_no      
				frappe.set_route('Form', frappe.route_options["doctype"], frappe.route_options["doc_name"]); 
		        //frappe.route_options = null;    
			}
		    if(frappe.route_options["mobile_no"] && frappe.route_options["mobile_or_phone"] == "mobile"){
		   		cur_frm.set_value("mobile_no",frappe.route_options["mobile_no"]) 
		    }
		    else if(frappe.route_options["mobile_no"] && frappe.route_options["mobile_or_phone"] == "phone"){
		   		cur_frm.set_value("phone",frappe.route_options["mobile_no"]) 
		    }
	    }
	    if(!cur_frm.doc.__islocal && !cur_frm.doc.__unsaved){
			// show log button
			cur_frm.add_custom_button(__('Anrufe anzeigen'),
			function() {
				console.log("hihihi")
				show_logs_contact();                      
			});		
		}
	},
	validate: function(frm) {
		if(!cur_frm.doc.__islocal && frappe.route_options){
			frappe.route_options["new_contact"] = "Yes"
		}
	}
})

show_logs_contact = function(){
    if(frappe.route_options){
		console.log("in if cond")
		frappe.route_options["client_info"] = cur_frm.doc.doctype+"//"+cur_frm.doc.name+"//"+cur_frm.doc.mobile_no
	}
	else{
		console.log("in else cond contact 123")
		frappe.route_options = {
			"client_info":cur_frm.doc.doctype+"//"+cur_frm.doc.name+"//"+cur_frm.doc.mobile_no
		}
	} 
	frappe.set_route("query-report", "Call Logs Report");
}