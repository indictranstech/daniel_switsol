# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import date_diff
from frappe.model.document import Document
from datetime import datetime

class CallLogs(Document):
	pass


@frappe.whitelist()
def get_call_log_data(customer):

	todo_details = frappe.db.sql("""select concat(date," - ",owner),name from `tabToDo`
					where (reference_type in ("Contact","Customer") and reference_name = "{0}"  and date >= "{1}")
					or (reference_type in ("Contact","Customer") and reference_name in
					(select name from `tabContact` where customer = "{0}") and date >= "{1}")
					order by date asc """.format(customer,datetime.now().date()),as_list=1)

	call_log_datails = frappe.db.sql("""select concat(date(creation)," - ",client),creation,name
										from `tabCall Logs` where client = '{0}' and contact_type = "Customer"
										order by creation desc""".format(customer,datetime.now().date()),as_list=1)


	communication_details = frappe.db.sql("""select concat(date(creation)," - ",reference_name),creation,name
							from `tabCommunication` where
							(reference_doctype in ("Contact","Customer") and reference_name = "{0}")
							or (reference_doctype in ("Contact","Customer") and reference_name in
							(select name from `tabContact` where customer = "{0}"))
							order by creation desc """.format(customer),as_list=1)

	call_log_communication_datails = ""
	if call_log_datails and communication_details:
		details_dict = {
						call_log_datails[0][1]:call_log_datails[0][0]+"//"+"Call Logs"+"/"+call_log_datails[0][2],
						communication_details[0][1]:communication_details[0][0]+"//"+"Communication"+"/"+communication_details[0][2]
						}
		date_list = max(details_dict.keys())
		call_log_communication_datails = details_dict[date_list] #communication_details[0][0] if date_difference < 0 else call_log_datails[0][0]
	elif call_log_datails and not communication_details:
		call_log_communication_datails = call_log_datails[0][0]+"//"+"Call Logs"+"/"+call_log_datails[0][2]
	elif communication_details and not call_log_datails:
		call_log_communication_datails = communication_details[0][0]+"//"+"Communication"+"/"+communication_details[0][2]

	return {"call_log_communication_datails":call_log_communication_datails,
			"todo_details":todo_details[0][0]+"//"+todo_details[0][1] if todo_details else ""}