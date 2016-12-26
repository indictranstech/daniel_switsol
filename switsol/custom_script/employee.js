cur_frm.add_fetch('item_code', 'item_name', 'item_name');
cur_frm.add_fetch('item_code','description','description');

cur_frm.fields_dict.employee_trainings.grid.get_field("item_code").get_query = function(doc) {
	return {
		filters: [
			['Item','item_group','=',"Training"]
		]
	}	
}