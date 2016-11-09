// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.ui.form.on('Call Logs', {
	refresh: function(frm) {
		if(!cur_frm.doc.__islocal && cur_frm.doc.phone_number){			
			html = "<a href='vdsip:" + cur_frm.doc.phone_number + "'><i class='icon-phone' aria-hidden='true'></i> <b>Call</b></a>"
			$(cur_frm.fields_dict.outgoing_call.wrapper).html(html);
		}
	}
});
