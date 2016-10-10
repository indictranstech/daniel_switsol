// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.query_reports["Call Logs Report"] = {
	"filters": [
		{
			"fieldname":"client_info",
			"label": __("Client Info"),
			"fieldtype": "Data"
		},
	],
	/*onload: function(report) {
		var me = this;
		var reporter = frappe.query_reports["Call Logs Report"];
		reporter.add_filters(report);
	},
	add_filters:function(report){
		var me = this;
		if (cur_frm){
			if(cur_frm.doc.doctype == "Call Logs"){
				console.log(cur_frm.doc.doctype)
			}
			else if(cur_frm.doc.doctype == "Contact"){
				console.log(cur_frm.doc.doctype)	
			}
			else if(cur_frm.doc.doctype == "Customer"){
				console.log(cur_frm.doc.doctype)
			}
			else if(cur_frm.doc.doctype == "Supplier"){
				console.log(cur_frm.doc.doctype)
			}
			else if(cur_frm.doc.doctype == "Sales Partner"){
				console.log(cur_frm.doc.doctype)
			}
		}
	}*/
		//frappe.query_report.filters_by_name.client_info.set_value("asfdfdssdfsdfdsf")

}
