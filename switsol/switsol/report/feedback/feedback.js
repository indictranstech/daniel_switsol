// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt
frappe.provide("frappe.feedback")

frappe.query_reports["Feedback"] = {
	"filters": [
		{
		"fieldname":"project",
		"label": __("Project"),
		"fieldtype": "Link",
		"options":"Project",
		"width": "80"
		}
	],
	onload: function(report) {
		base_url = frappe.urllib.get_base_url();
		print_css = frappe.boot.print_css;

		report.page.add_inner_button(__("Print"), function() {
			var content = frappe.render(report.html_format,
				{data: frappe.slickgrid_tools.get_filtered_items(report.dataView), filters:{}, report:report});

			var html = frappe.render_template("print_template",
				{content:content, title:__(report.report_name), base_url: base_url, print_css: print_css});
			new frappe.feedback.PageReport(html)
		});
	}

}

frappe.feedback.PageReport = frappe.views.QueryReport.extend({
	init: function(html) {
		this.open_pdf_report(html, 'Landscape')
	}
})