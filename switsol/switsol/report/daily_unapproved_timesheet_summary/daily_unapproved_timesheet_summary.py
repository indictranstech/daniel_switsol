# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from datetime import datetime,date
from frappe import _

def execute(filters=None):
	if not filters:
		filters = {}

	columns = [_("Date") + "::120",_("Start Time") + "::120",_("End Time") + "::120",_("Total Hours") + "::120",\
				_("Employee") + ":Link/Employee:120", _("Customer") + ":Link/Customer:120",\
			 	_("Project") + ":Link/Project:120", \
			 	_("Timesheet") + ":Link/Timesheet:120", _("Status") +\
			  	"::70",_("") + "::30" ]
		
	conditions = "ts.docstatus = 0"
	if filters.get("from_date"):
		conditions = " and tsd.from_time >= timestamp(%(from_date)s, %(from_time)s)"
	if filters.get("to_date"):
		conditions += " and tsd.to_time <= timestamp(%(to_date)s, %(to_time)s)"
	
	data = get_data()

	return columns, data

def get_data():
	time_sheet = frappe.db.sql(""" select date(td.from_time),time(td.from_time),time(td.to_time),format(td.hours,3),
								ts.employee,td.customer,
								td.project,ts.name,ts.status from  
								`tabTimesheet` ts,`tabTimesheet Detail` td 
								where td.parent = ts.name and ts.docstatus = 0 and td.idx = 1 order by ts.name""", as_list=1,debug=1)
	#time_sheet_details = frappe.db.sql("""select td.project,td""")
	return time_sheet


@frappe.whitelist()
def update_timesheet(list_of_timesheet,signature,signature_svg):
	signature_svg = json.loads(signature_svg)
	#print signature_svg,"\n\n\n\n"
	#str(signature_svg).split("\n")
	#signature_svg = "image/svg+xml, " + signature_svg
	# frappe.errprint(signature_svg)
	# frappe.errprint("image/svg+xml, " + str(signature_svg))
	list_of_timesheet = json.loads(list_of_timesheet)
	for time_sheet in list_of_timesheet:
		time_sheet_doc = frappe.get_doc("Timesheet",time_sheet)
		time_sheet_doc.signature_json = str(signature)
		time_sheet_doc.docstatus = 1
		time_sheet_doc.signatre_svg = signature_svg
		time_sheet_doc.signature_time = datetime.now()
		time_sheet_doc.save(ignore_permissions=True);
	return "Sucees"