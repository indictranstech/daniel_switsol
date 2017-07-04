
frappe.ui.form.on("Customer", "refresh", function(frm) {

	frm.add_custom_button(__('Accounting Transactions'),function(){
		frappe.set_route("query-report","Accounting Transactions")
		})
	frm.add_custom_button(__('Make JV'),function(){
		make_jv(frm)
		})

});

make_jv = function(frm){
	var jv_doc = frappe.model.make_new_doc_and_get_name('Journal Entry');
	jv_doc = locals['Journal Entry'][jv_doc];
	// jv_doc.voucher_type = 'Credit Note';
	jv_doc.posting_date = frappe.datetime.nowdate();
	jv_doc.company = frappe.defaults.get_default('company')

	var row = frappe.model.add_child(jv_doc, "Journal Entry Account", "accounts");
	row.party_type = 'Customer'
	row.party = frm.doc.name
	row.is_advance = 'Yes'
	refresh_field("accounts");
	frappe.set_route('Form', 'Journal Entry', jv_doc.name);
}