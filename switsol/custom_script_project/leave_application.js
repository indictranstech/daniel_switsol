// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Leave Application", {

	refresh:function(frm){
		set_data(frm)
	},
	approver: function(frm) {
		if(frm.doc.approver){
			frm.set_value("leave_approver_name", frappe.user.full_name(frm.doc.approver));
		}
	},
	validate:function(frm){
		if(user != frm.doc.approver && inList(['Approved by Approver','Rejected by Approver'],frm.doc.workflow_state)) {
			frm.reload_doc();
			frappe.throw(__("Your are not Approver"));
		}
		if((user != frm.doc.leave_executor && user != frm.doc.leave_executor_2) && inList(['Approved','Rejected by Executor','Cancelled'],frm.doc.workflow_state)) {
			frm.reload_doc();
			frappe.throw(__("Your are not Executor"));
		}

		set_data(frm);
	},
	employee:function(frm){
		frappe.call({
			method: "switsol.custom_script_project.leave_application.get_approver_executor",
			args: {
					"employee": frm.doc.employee,
			},
			
			callback: function(r) {
				if(r.message){
					if(r.message['Approver']){
						frm.set_value("approver",r.message['Approver'][0])
						cur_frm.set_df_property("approver", "read_only",1);
					}

					if(r.message['Executor']){
						frm.set_value("leave_executor",r.message['Executor'][0])
						cur_frm.set_df_property("leave_executor", "read_only",1);
					}

					if(r.message['Executor']){
						frm.set_value("leave_executor_2",r.message['Executor'][1])
						cur_frm.set_df_property("leave_executor_2", "read_only",1);
					}
				}
			}
		})
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

cur_frm.fields_dict.leave_executor_2.get_query = function(doc) {
	return {
		"query": "switsol.custom_script_project.leave_application.get_user",
		"filters": {"role":"Executor","employee":doc.employee}
	}
}

set_data = function(frm){
	if(frm.doc.approver){
		cur_frm.set_df_property("approver", "read_only",1);
	}
	if(frm.doc.leave_executor){
		cur_frm.set_df_property("leave_executor", "read_only",1);
	}
	if(frm.doc.leave_executor_2){
		cur_frm.set_df_property("leave_executor_2", "read_only",1);
	}
}