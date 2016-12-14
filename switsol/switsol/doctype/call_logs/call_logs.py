# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from datetime import datetime

class CallLogs(Document):
	pass


@frappe.whitelist()
def get_call_log_data(customer):
	todo_details = frappe.db.sql("""select date(creation) from `tabToDo` where 
		CASE WHEN reference_type = "Contact" THEN reference_name in (select name from `tabContact` where customer = '{0}') 
		WHEN reference_type = "Customer" THEN reference_name = '{0}' ELSE 1=1 END 
		and status = "Open" and date(creation) >= '{1}' order by creation asc""".format(customer,datetime.now().date()),as_list=1)
	
	call_log_datails = frappe.db.sql("""select concat(name," ",date(creation))  
		from `tabCall Logs` where client = '{0}' and contact_type = "Customer"  
		order by creation desc""".format(customer),as_list=1)

	return {"call_log_datails":call_log_datails[0][0] if call_log_datails else "",
			"todo_details":todo_details[0][0] if todo_details else ""}