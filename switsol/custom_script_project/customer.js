frappe.provide("erpnext.company");
frappe.ui.form.on("Customer",{
	refresh: function(frm){
		frm.add_custom_button(__('Make Advance Payment'),function(){
		make_payment_dialog(frm)
		})
		frm.add_custom_button(__('Accounting Transactions'),function(){
			frappe.set_route("query-report","Accounting Transactions")
			})
		}
});

get_party_account = function(dialog){
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Company",
				fieldname: ["default_receivable_account","default_cash_account"],
				filters: {name:frappe.defaults.get_default('company')}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("credit_account",r.message.default_receivable_account)
					dialog.set_value("debit_account",r.message.default_cash_account)
				}
			}
		});
}

make_payment_dialog = function(frm){
	var dialog = new frappe.ui.Dialog({ 
	title: __("Advance Payment"),
	fields: [
			{fieldtype: "Date", fieldname: "date", label: __("Date"),reqd:1},
			{fieldtype: "Currency", fieldname: "amount", label: __("Amount"),reqd:1},
			{fieldtype: "Link", fieldname: "voucher", label: __("Voucher"),options:"Voucher",reqd:1},
			{fieldtype: "Column Break"},
			{fieldtype: "Link", fieldname: "credit_account", label: __("Credit Account"),options:"Account",
				get_query: function () {
							return {
								filters: [
									["account_type", "=", "Receivable"],
								]
							}
						}
			},
			{fieldtype: "Link", fieldname: "debit_account", label: __("Debit Account"),options: "Account",
				get_query: function () {
							return {
								filters: [
									["account_type", "=", "Cash"],
								]
							}
						}
			},
			{fieldtype: "Small Text", fieldname: "remark", label: __("Remark")}
		]
	})
	dialog.show()
	get_party_account(dialog)
	dialog.set_primary_action(__("Make JV"), function(frm) {
		make_journal_entry(dialog)
		dialog.hide()
	})

}
make_journal_entry = function(dialog){
	frappe.call ({
		method: "switsol.custom_script_project.customer.make_journal_entry",
		args:{
			"party": cur_frm.doc.name,
			"payment_details":dialog.get_values()
		},
		callback: function(r) {
				cur_frm.reload_doc();
		}
	})
}