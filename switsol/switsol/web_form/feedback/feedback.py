from __future__ import unicode_literals

import frappe

def get_context(context):
	# do your magic here
	pass


@frappe.whitelist(allow_guest=True)
def get_list(doctype, fields=None, filters=None, order_by=None,
	limit_start=None, limit_page_length=20):
	return frappe.get_list(doctype, fields=fields, filters=filters, order_by=order_by,
		limit_start=limit_start, limit_page_length=limit_page_length, ignore_permissions=True)
