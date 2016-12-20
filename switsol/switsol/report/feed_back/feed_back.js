// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.query_reports["Feed Back"] = {
	"filters": [
		{
		"fieldname":"project",
		"label": __("Project"),
		"fieldtype": "Link",
		"options":"Project",
		"width": "80"
		}
	]
}
