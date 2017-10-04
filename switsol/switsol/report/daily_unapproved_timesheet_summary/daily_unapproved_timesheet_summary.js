// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

frappe.query_reports["Daily Unapproved Timesheet Summary"] = {
	"filters": [
	],

	onload: function(report) {
		//Create a button for setting the default supplier
		var me = this;
		var reporter = frappe.query_reports["Daily Unapproved Timesheet Summary"];
		report.page.add_inner_button(__("Bewilligen"), function() { // Make Approved Button				
			reporter.make_signature_dialog(report);
		});
	},
	make_signature_dialog:function(report){
		var me = this;
		this.dialog = new frappe.ui.Dialog({
            		title: __("Signature"),
                	fields: [
                   		{"fieldtype": "HTML" , "fieldname": "signature" , "label": "Signature"}
                   	]
	       		});
       	this.fd = this.dialog.fields_dict;
       	this.dialog.$wrapper.find('.modal-dialog').css("width", "600px");
       	this.dialog.$wrapper.find('.modal-dialog').css("height", "450px");
		this.add_signature();
	},
	add_signature:function(){
		var me = this;
		html = "signature"
		$(frappe.render_template(html)).appendTo(me.fd.signature.wrapper);
		me.assign_signature();
		me.dialog.clear();
		me.dialog.show();
		me.click_buttons();
	},
	assign_signature:function(){
		var me = this;
		$(me.dialog.fields_dict.signature.wrapper).find("#sig").jSignature({height:300, width: "530px", "lineWidth": 0.8});
	},
	click_buttons:function(){
		var me = this;
		me.list_of_timesheet = []
		$.each($(".slick-row"),function(i,d){
			if($(d).find("._select").is(':checked')) {
				me.list_of_timesheet.push($(d).find("._select").attr("value"))
			}
		});
		$(me.dialog.fields_dict.signature.wrapper).find("#clear").click(function() {
			$(me.dialog.fields_dict.signature.wrapper).find("#sig").jSignature("reset");
		});
		$(me.dialog.fields_dict.signature.wrapper).find("#json").click(function() {
			me.svg = $(me.dialog.fields_dict.signature.wrapper).find("#sig").jSignature("getData")
			me.update_timesheet();
		});
		
	},
	update_timesheet:function(){
		var me  = this;
		frappe.call({
			method:'switsol.switsol.report.daily_unapproved_timesheet_summary.daily_unapproved_timesheet_summary.update_timesheet',
			args: {
				"list_of_timesheet":me.list_of_timesheet,
				"signature_svg":JSON.stringify(me.svg)
			},
			callback: function(r) {
				if(r.message) {
					me.dialog.hide();
					frappe.query_report.refresh()
				}
			}
		});
	},
	"formatter":function (row, cell, value, columnDef, dataContext, default_formatter) {
        value = default_formatter(row, cell, value, columnDef, dataContext);
	    if(columnDef.id == "") {
	    	if(dataContext['Zeiterfassung']){
            	value = "<input type='checkbox' class='_select' value="+dataContext['Zeiterfassung']+" >" + value + "</input>";
	    	}
	    	if(dataContext['Timesheet']){
				value = "<input type='checkbox' class='_select' value="+dataContext['Timesheet']+" >" + value + "</input>";	    		
	    	}
	    }
	    return value;
	}
}