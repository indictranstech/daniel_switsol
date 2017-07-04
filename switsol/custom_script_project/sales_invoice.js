cur_frm.cscript.get_advances = function(){
	frappe.call({
		method: "switsol.custom_script_project.sales_invoice.set_advances",
		args: {
			"doc":cur_frm.doc
		},
		callback: function(r) {
			frappe.model.clear_table(cur_frm.doc, "advances");
			if(r.message){
				$.each(r.message,function(i,d){
					var row = frappe.model.add_child(cur_frm.doc, "Sales Invoice Advance", "advances");
					row.reference_type = d.reference_type
					row.reference_name = d.reference_name
					row.reference_row = d.reference_row
					row.voucher = d.voucher
					row.remarks = d.remarks
					row.advance_amount = flt(d.amount)
					row.allocated_amount = flt(d.amount) ? d.against_order : 0
					refresh_field("advances");
					});
			}
			
		}
	})
}



