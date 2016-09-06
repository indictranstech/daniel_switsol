# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Switsol",
			"color": "grey",
			"icon": "octicon octicon-file-directory",
			"type": "module",
			"label": _("Switsol")
		},
		{
			"module_name": "Time Log Sheet",
			"color": "#f39c12",
			"icon": "octicon octicon-package",
			"type": "page",
			"link": "time-log-sheet",
			"label": _("Time Log Sheet")
		}
	]
