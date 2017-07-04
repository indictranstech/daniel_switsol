from __future__ import unicode_literals
import frappe
import frappe.defaults
from frappe import _
from erpnext.controllers.accounts_controller import get_advance_payment_entries,get_advance_journal_entries

def onload(self,method=None):
	self.advance_amount = 0.00
	advance_amount = get_advance_amount(self)
	paid_amount = get_paid_amount(self)
	self.balance_amount = advance_amount if paid_amount else 0.00
	self.advance_amount = advance_amount + paid_amount if advance_amount or paid_amount else 0.00
	
def get_advance_amount(self):
	total = []
	advance = 0.00
	company = frappe.get_doc("Company",frappe.defaults.get_defaults().company) 
	default_account = company.default_receivable_account
	journal_entries = get_jv_entries(self,default_account)
	payment_entries = get_payment_entries(self,default_account)
	total.extend(journal_entries)
	total.extend(payment_entries)
	for amount in total:
		advance += amount
	return advance

def get_jv_entries(self,account):
	journal_entries = get_advance_journal_entries("Customer", self.name, account, 
					"credit_in_account_currency", order_doctype=None, order_list=[], include_unallocated=True)

	amount = [data['amount'] for data in journal_entries]
	return amount

def get_payment_entries(self,account):
	payment_entries = get_advance_payment_entries("Customer", self.name, account,order_doctype=None,against_all_orders=True)
	amount = [data['amount'] for data in payment_entries]
	return amount

def get_paid_amount(self):
	paid_amount = frappe.db.sql("""select sum(sa.allocated_amount) as amount
			from `tabSales Invoice` s, `tabSales Invoice Advance` sa
			where s.name = sa.parent and s.customer=%s and s.docstatus = 1""", self.name,as_dict=1)
	self.paid_amount = paid_amount[0].amount
	return paid_amount[0].amount if paid_amount[0].amount else 0.00
