from __future__ import unicode_literals
import frappe
from frappe import _

def before_submit(self,Method=None):
	if self.voucher_type == "Journal Entry":
		jv_doc = frappe.get_doc("Journal Entry",self.voucher_no)
		self.voucher = jv_doc.voucher
	elif self.voucher_type == "Sales Invoice":
		si_doc = frappe.get_doc("Sales Invoice",self.voucher_no)
		for i in si_doc.advances:
			self.voucher = i.voucher
