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
				},
				{
					"type": "page",
					"name": "training_satisfaction",
					"label": _("Feed Back Training Satisfaction"),
					"description": _("Feed Back Training Satisfaction"),
				},
			]
		}
	]			