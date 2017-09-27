from __future__ import unicode_literals
import frappe
from frappe import _, msgprint

@frappe.whitelist()
def get_contacts(reference_contact,reference_contact_name):
	cond = ""
	if reference_contact == "customer":
		cond = "and d.link_name = '{0}' ".format(reference_contact_name)
	elif reference_contact == "supplier":
		cond = "and d.link_name = '{0}' ".format(reference_contact_name)
	elif reference_contact == "sales_partner":
		cond = "and d.link_name = '{0}' ".format(reference_contact_name)
	elif reference_contact == "user":
		cond = "where user = '{0}' ".format(reference_contact_name)
	#concat('#Form/Contact/',name) as  
	return frappe.db.sql("""select c.first_name,
		CASE WHEN c.mobile_no THEN c.mobile_no  ELSE "-" END AS mobile_no,c.status,
		CASE WHEN c.phone THEN c.phone ELSE "-" END AS phone,c.name  from `tabContact` c,`tabDynamic Link` d 
		where d.parent = c.name {0} """.format(cond),as_dict=1)
