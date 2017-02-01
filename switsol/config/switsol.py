from __future__ import unicode_literals
from frappe import _


def get_data(): 
	return [
		{
			"label": _("Masters"),
			"icon": "icon-star",
			"items": [
				{
					"type": "doctype",
					"name": "Feedback",
					"description": _("Feed Back"),
				},
				{
			       "type": "doctype",
			       "name": "Certificate",
			       "description": _("Certificate"),
                }   
			]
		},
		{
			"label": _("Feedback Charts"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "feed_back_summary",
					"label": _("Feedback Summary"),
					"description": _("Feedback Summary Charts"),
				}
			]
		},
		{
			"label": _("Reports"),
			"icon": "icon-star",
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Feedback",
					"label": _("Feedback"),
					"description": _("Record of Feed Back"),
					"doctype": "Feedback",
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Sales Person",
					"label": _("Sales Person"),
					"description": _("Record of Sales Person"),
					"doctype": "Sales Person",
				}
			]
		},
		{
			"label": _("Task Group"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "task-group",
					"label": _("Task Group"),
					"description": _("Task Group"),
				}
			]
		}
	]			