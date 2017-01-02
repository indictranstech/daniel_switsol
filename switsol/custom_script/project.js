frappe.ui.form.on("Project", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal){
		frm.add_custom_button(__("Feedback Kursteilnehmer"), function() {
			frappe.route_options = null;
			frappe.route_options = {"project": cur_frm.doc.name};
			frappe.set_route("feed_back_summary");
		});
		frm.add_custom_button(__("Freitexte Kursteilnehmer"), function() {
			frappe.route_options = {"project": cur_frm.doc.name};
			frappe.set_route("query-report","Feedback");
		});
		cur_frm.set_indicator_formatter("task_group_with_indicator",function(doc) { 
			if(doc.start_date > frappe.datetime.nowdate()){
				return "orange"
			}
			if(doc.end_date < frappe.datetime.nowdate()){
				return "red"
			}
		});
	}
});
