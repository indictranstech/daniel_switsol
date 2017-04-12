from __future__ import unicode_literals

import frappe

def get_context(context):
	pass

# def get_list_context(context):
# 	context.get_list = get_student()


# def get_student():
# 	data = frappe.db.sql("""select * from `tabStudent` where name = "STUD00007" """,as_dict=True)
# 	return data

# def get_id():
# 	return frappe.get_value("Student",{"name":student_id},"name")

	


@frappe.whitelist(allow_guest=True)
def get_list(doctype, fields=None, filters=None, order_by=None,
	limit_start=None, limit_page_length=20):
	return frappe.get_list(doctype, fields=fields, filters=filters, order_by=order_by,
		limit_start=limit_start, limit_page_length=limit_page_length, ignore_permissions=True)
