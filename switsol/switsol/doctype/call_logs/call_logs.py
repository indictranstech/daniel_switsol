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

	# todo_details = frappe.db.sql("""select date(creation) from `tabToDo` where 
	# 	CASE WHEN reference_type = "Contact" THEN reference_name in (select name from `tabContact` where customer = '{0}') 
	# 	WHEN reference_type = "Customer" THEN reference_name = '{0}' ELSE 1=1 END 
	# 	and status = "Open" and date(creation) >= '{1}' order by creation asc""".format(customer,datetime.now().date()),as_list=1)
	
	todo_details = frappe.db.sql("""select concat(date," - ",owner) from `tabToDo`
					where (reference_type in ("Contact","Customer") and reference_name = "{0}"  and date >= "{1}")
					or (reference_type in ("Contact","Customer") and reference_name in
					(select name from `tabContact` where customer = "{0}") and date >= "{1}")
					order by date asc """.format(customer,datetime.now().date()),as_list=1)

	call_log_datails = frappe.db.sql("""select concat(date(creation)," - ",client),creation
										from `tabCall Logs` where client = '{0}' and contact_type = "Customer"
										order by creation desc""".format(customer,datetime.now().date()),as_list=1)

	communication_details = frappe.db.sql("""select concat(date(creation)," - ",reference_name),creation
							from `tabCommunication` where
							(reference_doctype in ("Contact","Customer") and reference_name = "{0}")
							or (reference_doctype in ("Contact","Customer") and reference_name in
							(select name from `tabContact` where customer = "{0}"))
							order by creation desc """.format(customer),as_list=1)

	call_log_communication_datails = ""
	if call_log_datails and communication_details:
		date_difference = date_diff(call_log_datails[0][1],communication_details[0][1])
		call_log_communication_datails = communication_details[0][0] if date_diff < 0 else call_log_datails[0][0]
	elif call_log_datails and not communication_details:
		call_log_communication_datails = call_log_datails[0][0]		
	elif communication_details and not call_log_datails:
		call_log_communication_datails = communication_details[0][0]		

	return {"call_log_communication_datails":call_log_communication_datails,
			"todo_details":todo_details[0][0] if todo_details else ""}