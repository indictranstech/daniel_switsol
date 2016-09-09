from __future__ import unicode_literals
import frappe
import datetime
from frappe.utils import flt, cstr, get_datetime, getdate, today, date_diff, cint, nowdate, now
from frappe import _, msgprint

@frappe.whitelist()
def make_timesheet(customer, activity,project,from_date_time,to_date_time,hours):
	emp = frappe.db.get_values("Employee", {"user_id":frappe.session.user}, ["name","employee_name"], as_dict= True)
	date = from_date_time.split(" ")[0]
	if emp:
		sheet = frappe.db.sql(""" select ts.name, ts.total_hours from `tabTimesheet`ts , `tabTimesheet Detail` tsd 
				where ts.employee = '%s' and ts.docstatus != 2 and tsd.from_time like '%s' and ts.name = tsd.parent
				"""%(emp[0]['name'],date+ "%"), as_list=1,debug=1)
		if sheet:
			ts = frappe.get_doc("Timesheet", sheet[0][0])
			ts.total_hours = flt(sheet[0][1]) + flt(hours)
			tsd = ts.append('time_logs', {})
			tsd.customer = customer
			tsd.activity_type = activity
			tsd.from_time = from_date_time
			tsd.to_time = to_date_time
			tsd.hours = flt(hours)
			tsd.project = project
			ts.save(ignore_permissions=True)
		else:
			ts = frappe.new_doc("Timesheet")
			ts.status = "Draft"
			ts.company = frappe.db.get_single_value('Global Defaults', 'default_company')
			ts.employee = emp[0]['name']
			ts.employee_name = emp[0]['employee_name']
			ts.total_hours = flt(hours)
			tsd = ts.append('time_logs', {})
			tsd.customer = customer
			tsd.activity_type = activity
			tsd.from_time = from_date_time
			tsd.to_time = to_date_time
			tsd.hours = flt(hours)
			tsd.project = project
			ts.save(ignore_permissions=True)
	else:
		frappe.throw(_("Logged In user have not an Employee to create Timesheet. Please create Employee first.."))

@frappe.whitelist()
def calculate_total_hours(week_start, week_end, month_start, month_end):
	from datetime import datetime, timedelta
	import datetime

	emp = frappe.db.get_values("Employee", {"user_id":frappe.session.user}, ["name"], as_dict= True)
	if emp:
		month_start = month_start + " " + "00:00:00"
		month_end = month_end + " " + "00:00:00"
		week_end = week_end.replace("00:00:00", "23:59:59")

		today = datetime.date.today()
		week_start_day = today - datetime.timedelta(days=7)
		week_start_day = week_start_day - datetime.timedelta(days=today.weekday())
		week_end_day = week_start_day + datetime.timedelta(days=6)
		week_start_day = cstr(week_start_day) + " " + "00:00:00"
		week_end_day = cstr(week_end_day) + " " + "23:59:59"
		
		last_week_hours = frappe.db.sql(""" select ifnull(sum(tsd.hours),0) from `tabTimesheet`ts, 
				`tabTimesheet Detail` tsd where ts.name = tsd.parent and ts.employee = '%s' and ts.docstatus != 2 
				and tsd.from_time between '%s' and '%s' """%(emp[0]['name'], week_start_day, week_end_day), as_list=1)
		last_week_hours = "%.3f" % last_week_hours[0][0]

		monthly_hours = frappe.db.sql(""" select ifnull(sum(tsd.hours),0) from `tabTimesheet`ts, 
				`tabTimesheet Detail` tsd where ts.name = tsd.parent and ts.employee = '%s' and ts.docstatus != 2 
				and tsd.from_time between '%s' and '%s' """%(emp[0]['name'], month_start, month_end), as_list=1)
		monthly_hours = "%.3f" % monthly_hours[0][0]

		return last_week_hours, monthly_hours
	else:
		frappe.throw(_("Logged In user have not an Employee to create Timesheet. Please create Employee first.."))


@frappe.whitelist()
def get_loged_timesheets(date):
	emp = frappe.db.get_values("Employee", {"user_id":frappe.session.user}, ["name"], as_dict= True)
	if emp:
		timesheets = frappe.db.sql(""" select tsd.customer, tsd.project, tsd.activity_type, tsd.from_time, tsd.to_time, 
				tsd.hours, ts.status from `tabTimesheet`ts , `tabTimesheet Detail` tsd where ts.employee = '%s' 
				and ts.docstatus != 2 and tsd.from_time like '%s' and ts.name = tsd.parent """%(emp[0]['name'],date+ " %"), as_dict=1)
		return timesheets
	else:
		frappe.throw(_("Logged In user have not an Employee to create Timesheet. Please create Employee first.."))