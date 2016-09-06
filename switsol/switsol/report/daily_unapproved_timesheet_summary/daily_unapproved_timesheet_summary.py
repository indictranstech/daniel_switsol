# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _

def execute(filters=None):
	if not filters:
		filters = {}

	columns = [_("Timesheet") + ":Link/Timesheet:120", _("Employee") + "::120", _("Total Hours") + "::120", _("Status") + "::70",_(" ") + "::30" ]
		
	conditions = "ts.docstatus = 0"
	if filters.get("from_date"):
		conditions = " and tsd.from_time >= timestamp(%(from_date)s, %(from_time)s)"
	if filters.get("to_date"):
		conditions += " and tsd.to_time <= timestamp(%(to_date)s, %(to_time)s)"
	
	data = get_data()

	return columns, data

def get_data():
	time_sheet = frappe.db.sql(""" select ts.name, ts.employee, ts.total_hours,
		ts.status,"" from  
		`tabTimesheet` ts where docstatus = 0 order by ts.name""", as_list=1,debug=1)

	return time_sheet


@frappe.whitelist()
def update_timesheet(list_of_timesheet,signature):
	print signature
	list_of_timesheet = json.loads(list_of_timesheet)
	for time_sheet in list_of_timesheet:
		time_sheet_doc = frappe.get_doc("Timesheet",time_sheet)
		time_sheet_doc.signature_json = str(signature)
		time_sheet_doc.docstatus = 1
		time_sheet_doc.save(ignore_permissions=True);
	return "Sucees"