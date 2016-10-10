from __future__ import unicode_literals
import frappe
from frappe import _, msgprint

@frappe.whitelist()
def get_contacts(reference_contact,reference_contact_name):
	cond = ""
	if reference_contact == "customer":
		cond = "where customer = '{0}' ".format(reference_contact_name)
	elif reference_contact == "supplier":
		cond = "where supplier = '{0}' ".format(reference_contact_name)
	elif reference_contact == "sales_partner":
		cond = "where sales_partner = '{0}' ".format(reference_contact_name)
	elif reference_contact == "user":
		cond = "where user = '{0}' ".format(reference_contact_name)
	#concat('#Form/Contact/',name) as  
	return frappe.db.sql("""select first_name,
		CASE WHEN mobile_no THEN mobile_no  ELSE "-" END AS mobile_no,status,
		CASE WHEN phone THEN phone ELSE "-" END AS phone,name  from `tabContact` {0} """.format(cond),as_dict=1,debug=1)
