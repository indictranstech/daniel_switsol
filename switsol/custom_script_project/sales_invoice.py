from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import today, flt, cint, fmt_money, formatdate, getdate
import json
from erpnext.controllers.accounts_controller import get_advance_payment_entries,get_advance_journal_entries

@frappe.whitelist()
def set_advances(doc):
	doc = json.loads(doc)
	res = get_advance_entries(doc)
	for data in res:
		jv_voucher = frappe.db.get_value("Journal Entry",{"name":data.get('reference_name')},"voucher")
		data['voucher'] = jv_voucher
	return res


def get_advance_entries(doc, include_unallocated=True):
	if doc.get('doctype') == "Sales Invoice":
		party_account = doc.get('debit_to')
		party_type = "Customer"
		party = doc.get('customer')
		amount_field = "credit_in_account_currency"
		order_field = "sales_order"
		order_doctype = "Sales Order"

	order_list = list(set([d.get(order_field)
		for d in doc.get("items") if d.get(order_field)]))

	journal_entries = get_advance_journal_entries(party_type, party, party_account,
		amount_field, order_doctype, order_list, include_unallocated)

	payment_entries = get_advance_payment_entries(party_type, party, party_account,
		order_doctype, order_list, include_unallocated)

	res = journal_entries + payment_entries

	return res
