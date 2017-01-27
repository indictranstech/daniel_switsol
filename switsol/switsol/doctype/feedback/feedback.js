// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.ui.form.on('Feedback', {
	refresh: function(frm) {
		//this.get_url(frm)
		cur_frm.add_fetch('student_id','first_name','first_name');
		cur_frm.add_fetch('student_id','last_name','last_name');
	}
});
