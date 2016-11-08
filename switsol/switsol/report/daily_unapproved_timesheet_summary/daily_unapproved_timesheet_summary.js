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
       	this.dialog.$wrapper.find('.modal-dialog').css("width", "450px");
       	this.dialog.$wrapper.find('.modal-dialog').css("height", "450px");
       	//this.dialog.$wrapper.find('.hidden-xs').css("margin-left","-2px");
		this.add_signature(report);
	},
	add_signature:function(report){
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
		$(me.dialog.fields_dict.signature.wrapper).find("#sig").signature();
		//$(me.dialog.fields_dict.signature.wrapper).find("#resig").signature();
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
			$(me.dialog.fields_dict.signature.wrapper).find("#sig").signature("clear");
		});
		$(me.dialog.fields_dict.signature.wrapper).find("#json").click(function() {
			me.sign = $(me.dialog.fields_dict.signature.wrapper).find("#sig").signature("toJSON")
			me.svg = $(me.dialog.fields_dict.signature.wrapper).find("#sig").signature("toSVG")
			console.log(me.svg,JSON.stringify(me.svg))
			//$(me.dialog.fields_dict.signature.wrapper).find("#resig").signature("draw", me.sign)
			me.update_timesheet();
		});
		/*$(me.dialog.fields_dict.signature.wrapper).find("#svg").click(function() {
			console.log($("#sig").signature("toSVG"))
			alert($("#sig").signature("toSVG"));
		});*/
	},
	update_timesheet:function(){
		var me  = this;
		frappe.call({
			method:'switsol.switsol.report.daily_unapproved_timesheet_summary.daily_unapproved_timesheet_summary.update_timesheet',
			args: {
				"list_of_timesheet":me.list_of_timesheet,
				"signature":JSON.stringify(me.sign),
				"signature_svg":JSON.stringify(me.svg).replace("\n")
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
        console.log(columnDef.id,"columnDef.id")
        console.log(dataContext['Zeiterfassung'],"dataContext['Zeiterfassung']")
        console.log(dataContext['Timesheet'],"dataContext['Timesheet']")
        console.log(columnDef,"columnDef")
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

