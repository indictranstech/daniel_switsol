// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Leave Application", {

	approver: function(frm) {
		if(frm.doc.approver){
			frm.set_value("leave_approver_name", frappe.user.full_name(frm.doc.approver));
		}
		
	}
	
});

cur_frm.fields_dict.approver.get_query = function(doc) {
		return {
			"query": "switsol.custom_script_project.leave_application.get_user",
			"filters": {"role":"Approver","employee":doc.employee}

			}
		}

cur_frm.fields_dict.leave_executor.get_query = function(doc) {
	return {
		"query": "switsol.custom_script_project.leave_application.get_user",
		"filters": {"role":"Executor","employee":doc.employee}

		}
	}