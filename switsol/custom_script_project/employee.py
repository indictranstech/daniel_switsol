from __future__ import unicode_literals
import frappe
from frappe import _


@frappe.whitelist()
def get_approver_role(user_id):
	roles = frappe.db.sql("select role from `tabUserRole` where parent = '{0}'".format(user_id))
	return roles

@frappe.whitelist()
def get_user(doctype, txt, searchfield, start, page_len, filters):
	user = frappe.db.sql("""select distinct parent from `tabUserRole` where role in ("Approver","Executor")
							and parent != 'Administrator' and parent like '{txt}'""".format(txt= "%%%s%%" % txt),as_list=1)
	return user

