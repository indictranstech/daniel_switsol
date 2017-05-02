from __future__ import unicode_literals
import frappe
from frappe import _


@frappe.whitelist()
def get_approver_role(user_id,user_type):
	roles = frappe.db.sql("select role from `tabUserRole` where parent = '{0}'".format(user_id),as_list=1)
	if user_type not in [role[0] for role in roles]:
		href = "http://"+frappe.request.host+"/desk#Form/User/{0}".format(user_id)
		if user_type == 'Executor':
			return "User <b><a href="+href+" target='blank'>{0}</a></b> has not {1} Role<br>Please Add <b>{1}</b> and <b>Leave Approver</b> In User Roles".format(user_id,user_type) 
		else:
			return "User <b><a href="+href+" target='blank'>{0}</a></b> has not {1} Role<br>Please Add <b>{1}</b> In User Roles".format(user_id,user_type) 

@frappe.whitelist()
def get_user_by_role(doctype, txt, searchfield, start, page_len, filters):
	user = frappe.db.sql("""select distinct parent from `tabUserRole`
							where role in ("Approver","Executor")
								and parent != 'Administrator'
								and parent like '{txt}'
								and parent <> '{user_id}' """.format(user_id=filters.get("user_id"),txt= "%%%s%%" % txt),as_list=1)
	return user

