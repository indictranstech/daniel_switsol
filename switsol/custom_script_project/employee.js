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
			query: "switsol.custom_script_project.employee.get_user"

			}	
}

frappe.ui.form.on("Employee Leave Approver", {

approver:function(doc,cdt,cdn){
	var d  = locals[cdt][cdn];
	get_leave_approver_role(d.approver,cdt,cdn)
}

})

get_leave_approver_role = function(user_id,cdt,cdn){
	var role_list = []
	frappe.call({
		method: "switsol.custom_script_project.employee.get_approver_role",
		args: {
			"user_id":user_id
		},
		callback: function(r) {
			if(r.message){
			 	$.each(r.message,function(i,d){
				role_list.push(d[0])		
			})
		 	if(inList(role_list,"Approver")) {
				frappe.model.set_value(cdt,cdn,"approver_type", __("Approver"));
			}
			else if(inList(role_list,"Executor")) {
				frappe.model.set_value(cdt,cdn,"approver_type", __("Executor"));
			}
			
		}		
	 }
  })
}