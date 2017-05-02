cur_frm.add_fetch('item_code', 'item_name', 'item_name');
cur_frm.add_fetch('item_code','description','description');

cur_frm.fields_dict.employee_trainings.grid.get_field("item_code").get_query = function(doc) {
	return {
		filters: [
			['Item','item_group','=',"Training"]
		]
	}	
}

cur_frm.fields_dict.leave_approvers.grid.get_field("approver").get_query = function(doc) {
	return {
			query: "switsol.custom_script_project.employee.get_user_by_role",
			filters: {'user_id': cur_frm.doc.user_id}
		}	
}

cur_frm.cscript.user_type = function(doc, cdt, cdn){
	var d  = locals[cdt][cdn];
	frappe.call({
		method: "switsol.custom_script_project.employee.get_approver_role",
		args: {
			"user_id":d.approver,
			"user_type":d.user_type
		},
		callback: function(r) {
			if(r.message){
				frappe.msgprint(r.message)
				d.user_type = ""
				refresh_field("leave_approvers")
			}		
	 	}
  	})
}