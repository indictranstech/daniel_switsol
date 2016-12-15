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
					"name": "Feed Back",
					"description": _("Feed Back"),
				},
			]
		},
		{
			"label": _("Feed Back Charts"),
			"icon": "icon-star",
			"items": [
				{
					"type": "page",
					"name": "feed_back_summary",
					"label": _("Feed Back Summary"),
					"description": _("Feed Back Summary Charts"),
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
					"name": "Feed Back",
					"label": _("Feed Back"),
					"description": _("Record of Feed Back"),
					"doctype": "Feed Back",
				}
			]
		}
	]			