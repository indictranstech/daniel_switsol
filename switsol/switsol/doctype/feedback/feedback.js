// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

cur_frm.add_fetch('student','first_name','first_name');
cur_frm.add_fetch('student','last_name','last_name');

frappe.ui.form.on('Feedback', {
	refresh: function(frm) {
		if(!cur_frm.doc.__islocal && !frm.doc.student) {
			frappe.call({
				method: "frappe.client.get_value",
				args: {
					doctype: "Student",
					fieldname: "name",
					filters: {student_id:frm.doc.student_id}
				},
				callback: function(r) {
					if(r.message) {
						frm.set_value("student", r.message.name);
						frm.save();
					}
				}
			});
		}
	}
});
