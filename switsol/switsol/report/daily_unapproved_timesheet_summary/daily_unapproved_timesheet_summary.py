# Copyright (c) 2013, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from datetime import datetime,date
from frappe.utils import flt, cstr, cint
from random import randrange,uniform
from frappe import _
import frappe.utils.file_manager
from frappe.desk.form.load import get_attachments

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
								where td.parent = ts.name and ts.docstatus = 0 and td.idx = 1 order by ts.name""", as_list=1)
	return time_sheet

@frappe.whitelist()
def update_timesheet(list_of_timesheet,signature_svg):
	signature_svg = json.loads(signature_svg)
	from frappe.handler import uploadfile
	list_of_timesheet = json.loads(list_of_timesheet)
	for time_sheet in list_of_timesheet:
		frappe.form_dict['from_form'] = 1
		frappe.form_dict['doctype'] = "Timesheet"
		frappe.form_dict['docname'] = time_sheet
		frappe.form_dict['filename'] = cstr(randrange(0, 10000))+cstr(time_sheet)
		frappe.form_dict['filedata'] = signature_svg.split(",")[1]
		attachment = uploadfile()
		if attachment.get('file_url'):
			time_sheet_doc = frappe.get_doc("Timesheet", time_sheet)
			time_sheet_doc.signature_base64 = attachment.get('file_url')
			time_sheet_doc.docstatus = 1
			time_sheet_doc.signature_time = datetime.now()
			time_sheet_doc.save(ignore_permissions=True)
	return True

def remove_attachment(self,method=None):
	self.signature_base64 = ""
	attachment = get_attachments("Timesheet",self.name)
	file_id = [data.get('name') for data in attachment]
	for fid in file_id:
		frappe.utils.file_manager.remove_file(fid)