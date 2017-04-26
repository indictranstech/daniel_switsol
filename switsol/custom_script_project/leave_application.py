from __future__ import unicode_literals
import frappe
from frappe import _


@frappe.whitelist()
def get_user(doctype, txt, searchfield, start, page_len, filters):
	role = filters.get('role')
	employee = filters.get('employee')
	user = frappe.db.sql("""select approver from `tabEmployee Leave Approver` where approver_type = '{0}' 
			and parent = '{1}' """.format(role,employee)
			,as_list=1)
	return user
