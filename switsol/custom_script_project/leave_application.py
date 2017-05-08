from __future__ import unicode_literals
import frappe
from frappe import _
from collections import defaultdict


def on_cancel(self,method=None):
	if self.workflow_state == "Cancelled":
		self.status=self.workflow_state
		frappe.db.set_value("Leave Application", self.name, "status",self.workflow_state)

@frappe.whitelist()
def get_user(doctype, txt, searchfield, start, page_len, filters):
	user = frappe.db.sql("""select approver from `tabEmployee Leave Approver` 
							where user_type = '{0}' 
								and parent = '{1}' 
								and approver like '{txt}'""".format(filters.get('role'),filters.get('employee'),txt= "%%%s%%" % txt),as_list=1)
	return user

@frappe.whitelist()
def get_approver_executor(employee=None):
	if employee:
		employee_doc = frappe.get_doc("Employee",employee)
		approver_counter,executor_counter = 0, 0
		users_dict = defaultdict(list)
		
		for row in employee_doc.leave_approvers:
			if row.user_type == "Approver":
				approver_counter+=1
				if approver_counter == 1:
				 	users_dict[row.user_type].append(row.approver)
				else : users_dict[row.user_type] = ""

			elif row.user_type == "Executor":
				executor_counter+=1
				if executor_counter <= 2:
					users_dict[row.user_type].append(row.approver)
				else : users_dict[row.user_type] = ""
		return users_dict
	


def get_permission_query_conditions(user):
	if not user: user = frappe.session.user
	"""
	get get_permission_query_conditions for approver and leave_executor	
	"""
	if not user == 'Administrator':
		leave_applications = frappe.db.sql("""select name from `tabLeave Application` 
											where approver = '{0}' or leave_executor  = '{0}' or owner = '{0}' """.format(user),as_list=1)
		leave_applications = tuple([application[0].encode('utf-8') for application in leave_applications])
		if leave_applications:
			if len(leave_applications) == 1:
				return "(`tabLeave Application`.name {0} )".format(" = '{0}'".format(leave_applications[0]))
			elif len(leave_applications) > 1:
				return "(`tabLeave Application`.name {0} )".format(" in {0} ".format(leave_applications))
		else:
			return "1=2"