// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.query_reports[("Call Logs Report")] = {
	"filters": [
		{
			"fieldname":"client_info",
			"label": __("Client Info"),
			"fieldtype": "Data"
		},
	],
	onload: function(report) {
		var me = this;
		$(cur_page.page).find('.layout-main-section').find(".page-form").hide();
		$(cur_page.page).find('.page-head').find(".page-actions").find('button.show-all').remove();
		html = "<button type='button' class='btn btn-secondary btn-default btn-sm show-all' onClick='show_all()'>Zeige alles</button>" // Show All button
		$($(cur_page.page).find('.page-head').find(".page-actions")[0]).append(html);
	},
	"formatter":function (row, cell, value, columnDef, dataContext, default_formatter) {
        value = default_formatter(row, cell, value, columnDef, dataContext);
    	if(dataContext['Subject']){
        	value = "<a href="+JSON.stringify('#Form/Call Logs/'+dataContext['Telefon Protokoll'])+">" + value + "</a>";
    	}
	    return value;
	}
}

show_all = function(){
		//frappe.query_report.filters_by_name.client_info.set_value("");
		frappe.query_report_filters_by_name.client_info.set_value("");
		frappe.query_report.trigger_refresh();
	}
