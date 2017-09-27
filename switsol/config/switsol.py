from __future__ import unicode_literals
from frappe import _


def get_data(): 
	return [
	{
			"label": _("Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Call Logs Report",
					"label": _("Call Logs Report"),
					"description": _("Record of Call Logs Report"),
					"doctype": "Call Logs",
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Daily Unapproved Timesheet Summary",
					"label": _("Daily Unapproved Timesheet Summary"),
					"description": _("Record of Daily Unapproved Timesheet Summary"),
					"doctype": "Timesheet",
				}
			]
		}

	]			