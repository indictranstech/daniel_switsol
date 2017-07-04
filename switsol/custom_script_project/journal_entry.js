frappe.ui.form.on("Journal Entry", {
	voucher: function(frm){
		$.each(frm.doc.accounts,function(i,d){
			frappe.model.set_value(d.doctype,d.name,"voucher_type", frm.doc.voucher);
		})
	}

})