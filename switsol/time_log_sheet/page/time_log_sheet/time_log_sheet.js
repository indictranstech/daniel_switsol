frappe.pages['time-log-sheet'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Time Log Sheet'),
		single_column: true
	});
	wrapper.timelog = new timelog(wrapper)
}

timelog = Class.extend({
	init: function(wrapper) {
		var me = this;
		this.wrapper_page = wrapper.page;
		this.page = $(wrapper).find('.layout-main-section-wrapper');
		this.wrapper = $(wrapper).find('.page-content');
		this.set_fields();
	},
	set_fields: function() {
		var me = this;
		html = "<div class='row'  style='border:1px solid #d1d8dd;padding-left:10px; padding-bottom:10px;'>\
  				<div class='col-md-2 date'></div>\
				<div class='col-md-2 customer'></div>\
				<div class='col-md-2 project'></div>\
  				<div class='col-md-2 activity'></div>\
  				<div class='col-md-2 logsheet' style='padding-top: 20px;'></div>\
  				<div class='col-md-4'></div>\
  				</div>"
		me.page.html(html)
		me.customer_link = frappe.ui.form.make_control({
			parent: me.page.find(".customer"),
			df: {
			fieldtype: "Link",
			label:"Customer",
			options: "Customer",
			placeholder: __("Customer"),
			fieldname: "customer"
			},
			render_input: true
		});
		me.customer_link.refresh();
		me.date = frappe.ui.form.make_control({
			parent: me.page.find(".date"),
			df: {
				fieldtype: "Date",
				label:"Date",
				fieldname: "date",
				placeholder: __("Date"),
				default: frappe.datetime.get_today()
			},
			render_input: true
		});
		me.date.refresh();
		me.project = frappe.ui.form.make_control({
			parent: me.page.find(".project"),
			df: {
				fieldtype: "Link",
				label:"Project",
				fieldname: "project",
				options:"Project",
				placeholder: __("Project"),
				"get_query": function() {
					return {
						"doctype": "Project",
						"filters": {
							"customer": $(".customer").find("input[data-fieldname='customer']").val(),
						}
					}
				}
			},
			render_input: true
		});
		me.project.refresh();
		me.activity = frappe.ui.form.make_control({
			parent: me.page.find(".activity"),
			df: {
				fieldtype: "Link",
				fieldname: "activity",
				label:"Activity",
				options:"Activity Type",
				placeholder: __("Activity")
			},
			render_input: true
		});
		me.activity.refresh();
		me.logsheet = frappe.ui.form.make_control({
			parent: me.page.find(".logsheet"),
			df: {
				fieldtype: "Button",
				fieldname: "logsheet",
				label: __("Logged sheets")
			},
			render_input: true
		});
		me.logsheet.refresh();
		__html = frappe.render_template("time_log_sheet")
		me.page.append(__html)
		me.set_hours();
		me.common_for_limit();
		me.on_submit();
		me.calulate_hours();
		me.set_limit_to_input_hours_and_minute();
		me.get_loged_sheets();
		me.add_logged_sheets();
	},
	set_limit_to_input_hours_and_minute :function(){
		var me = this
		$(me.page).find(".start_input_hours").click(function(){
			me._selected = "start_input_hours"
			me.common_for_calculation_of_hours();
		})
		$(me.page).find(".end_input_hours").click(function(){
			me._selected = "end_input_hours"
			me.common_for_calculation_of_hours();
		})
		$(me.page).find(".start_input_minute").click(function(){
			me._selected = "start_input_minute"
			me.common_for_calculation_of_minute();
		})
		$(me.page).find(".end_input_minute").click(function(){
			me._selected = "end_input_minute"
			me.common_for_calculation_of_minute();
		})
	},
	common_for_limit:function(){
		var me = this;
		$(me.page).find(".start_input_hours").change(function(){
			if(flt($(this).val()) > 24){
				$(this).val(1)
			}
			me.common_for_calculation_of_hours();
		})
		$(me.page).find(".end_input_hours").change(function(){
			if(flt($(this).val()) > 24){
				$(this).val(1)
			}
			me.common_for_calculation_of_hours();
		})
		$(me.page).find(".start_input_minute").change(function(){
			if(flt($(this).val()) > 55){
				$(this).val(0)
			}
			me.common_for_calculation_of_minute();
		})
		$(me.page).find(".end_input_minute").change(function(){
			if(flt($(this).val()) > 55){
				$(this).val(0)
			}
			me.common_for_calculation_of_minute();
		})
	},	
	set_hours:function(){
		var me = this;
		var current_time = frappe.datetime.now_time();
		var current_hours = current_time.split(":")[0]
		$(".input_hours").val(0)
		$(".input_minute").val(0)
		
		current_minute = current_time.split(":")[1]
		
		if((flt(current_minute) <= 60) && (flt(current_minute) > 55)){
			current_minute = 0
			current_hours = flt(current_hours) + 1
		}
		
		if((flt(current_minute) < 5) && (flt(current_minute) > 0)){
			current_minute = 5
		}
		
		if((flt(current_minute) > 5) && (flt(current_minute) % 5 != 0)){
			add_minute = 5 - (flt(current_minute) % 5)
			current_minute = flt(current_minute) + add_minute
		}

		$(".start_input_minute").val(current_minute)
		$(".end_input_minute").val(current_minute)
		
		$(".start_input_hours").val(current_hours)
		$(".end_input_hours").val(flt(current_hours))

		$(".hours").click(function(){
			if(me._selected == "start_input_hours" || me._selected == "end_input_hours"){
				$("."+me._selected).val($(this).attr("value"))
				me.common_for_calculation_of_hours();
			}
		});
		$(".minute").click(function(){
			if(me._selected == "start_input_minute" || me._selected == "end_input_minute"){
				$("."+me._selected).val($(this).attr("value"))
				me.common_for_calculation_of_minute();
			}
		});
	},
	common_for_calculation_of_hours:function(){
		var me = this;
		if($(".end_input_hours").val() && me._selected == "start_input_hours"){
			difference = flt($(".end_input_hours").val()) - flt($(".start_input_hours").val())
			if(difference >= 0){
				$(".input_hours").val(difference)
			}
			else if(difference < 0){
				difference = 0
				$(".input_hours").val(difference)
				$(".start_input_hours").val(flt($(".end_input_hours").val()))
			}
		}
		if($(".start_input_hours").val() && me._selected == "end_input_hours"){
			difference = (flt($(".end_input_hours").val()) - flt($(".start_input_hours").val()))
			if(difference >= 0){
				$(".input_hours").val(difference)
			}
			else if(difference < 0){
				difference = 0
				$(".input_hours").val(difference)	
				$(".end_input_hours").val(flt($(".start_input_hours").val()))
			}
		}
	},
	common_for_calculation_of_minute:function(){
		var me = this;
		if(($(".end_input_minute").val() && me._selected == "start_input_minute")||($(".end_input_minute").val())) {
			diff = (flt($(".end_input_minute").val()) - flt($(".start_input_minute").val()))
			hour_diff = (flt($(".end_input_hours").val()) - flt($(".start_input_hours").val()))
			if(diff >= 0){
				$(".input_minute").val(diff)
			}
			else if(diff < 0 && hour_diff > 0){
				time_diff = (flt($(".end_input_hours").val())*60+flt($(".end_input_minute").val()))-(flt($(".start_input_hours").val())*60+flt($(".start_input_minute").val()))
				$(".input_minute").val(time_diff%60)
				$(".input_hours").val(Math.floor(time_diff/60))
			}
			else if(diff < 0 && hour_diff <= 0){
				diff = 0
				$(".start_input_minute").val(flt($(".end_input_minute").val()))
				$(".input_minute").val(diff)
			}
		}
		if(($(".start_input_minute").val() && me._selected == "end_input_minute") || ($(".start_input_minute").val())){
			diff = (flt($(".end_input_minute").val()) - flt($(".start_input_minute").val()))
			hour_diff = (flt($(".end_input_hours").val()) - flt($(".start_input_hours").val()))
			
			if(diff >= 0){
				$(".input_minute").val(diff)
			}
			else if(diff < 0 && hour_diff > 0){
				time_diff = (flt($(".end_input_hours").val())*60+flt($(".end_input_minute").val()))-(flt($(".start_input_hours").val())*60+flt($(".start_input_minute").val()))
				$(".input_minute").val(time_diff%60)
				$(".input_hours").val(Math.floor(time_diff/60))
			}
			else if(diff < 0 && hour_diff <= 0){
				diff = 0
				$(".input_minute").val(diff)	
				$(".end_input_minute").val(flt($(".start_input_minute").val()))
			}
		}
	},
	on_submit:function(){
		var me = this;
		$(".submit").click(function(){
			logged_date = $(".date").find("input[data-fieldname='date']").val()
			client = $(".customer").find("input[data-fieldname='customer']").val()
			project = $(".project").find("input[data-fieldname='project']").val()
			activity = $(".activity").find("input[data-fieldname='activity']").val()
			if (logged_date && client && project && activity){
				me.logged_date = logged_date
				if($(".start_input_hours").val() && $(".end_input_hours").val() && $(".start_input_minute").val() && $(".end_input_minute").val()){
					me.start = String(me.logged_date)+" "+ $(".start_input_hours").val()+":"+$(".start_input_minute").val()+":"+"00"
					me.end	= String(me.logged_date)+" "+ $(".end_input_hours").val()+":"+ $(".end_input_minute").val()+":"+"00"
					var from_time = moment(me.start,'DD.MM.YYYY HH:mm:ss').format(moment.defaultDatetimeFormat)
					var to_time = moment(me.end,'DD.MM.YYYY HH:mm:ss').format(moment.defaultDatetimeFormat)
					var hours = moment(to_time).diff(moment(from_time),"seconds") / 3600
					if (hours >= 0) {
						if(frappe.datetime.now_datetime() >= moment(me.end,'DD.MM.YYYY HH:mm:ss').format(moment.defaultDatetimeFormat)){
							me.make_timesheet();
						}
						else{
							frappe.msgprint(__("Timesheet log creation should be valid up to current time. Please choose valid date & time"));
						}												
					}
					else{
						frappe.msgprint(__("End Time should be greater then Start Time."));
					}
				}
				else{
					frappe.msgprint(__("Please select Start Time and End Time before Submit"));
				}
			}
			else{
				frappe.msgprint(__("Please select Client, Project, Activity and Date before Submit"));
			}
		})
	},
	make_timesheet: function() {
		var me = this;
		var from_time = moment(me.start,'DD.MM.YYYY HH:mm:ss').format(moment.defaultDatetimeFormat)
		var to_time = moment(me.end,'DD.MM.YYYY HH:mm:ss').format(moment.defaultDatetimeFormat)
		var hours = moment(to_time).diff(moment(from_time),"seconds") / 3600
		frappe.call({
			method: "switsol.time_log_sheet.page.time_log_sheet.time_log_sheet.make_timesheet",
			args: {
				"activity":me.activity.$input.val(),
				"project": me.project.$input.val(),
				"customer":me.customer_link.$input.val(),
				"from_date_time": from_time,
				"to_date_time": to_time,
				"hours": hours
			},
			freeze: true,
			freeze_message: __("Please Wait..."),
			callback: function(r) {
				$(".date").find("input[data-fieldname='date']").val("")
				$(".customer").find("input[data-fieldname='customer']").val("")
				$(".project").find("input[data-fieldname='project']").val("")
				$(".activity").find("input[data-fieldname='activity']").val("")
				$(".start_input_hours").val("")
				$(".end_input_hours").val("")
				$(".start_input_minute").val("")
				$(".end_input_minute").val("")
				$(".input_hours").val("")
				$(".input_minute").val("")
				me.calulate_hours();
				frappe.msgprint(__("Timesheet log created successfully"))
			}
		})
	},
	calulate_hours: function(){
		var me = this;
		var today = new Date();
    	var lastWeek_start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    	var lastWeek_end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    	lastWeek_start = moment(lastWeek_start).format("YYYY-MM-DD HH:mm:ss")
    	lastWeek_end = moment(lastWeek_end).format("YYYY-MM-DD HH:mm:ss")

		frappe.call({
			method: "switsol.time_log_sheet.page.time_log_sheet.time_log_sheet.calculate_total_hours",
			args: {
				"week_start": lastWeek_start,
				"week_end": lastWeek_end,
				"month_start" : frappe.datetime.month_start(),
				"month_end" : frappe.datetime.month_end()
			},
			callback: function(r) {
				$(".weekly_hrs").val(r.message[0])
				$(".monthly_hrs").val(r.message[1])
			}
		})
	},
	get_loged_sheets: function(){
		var me = this;
		me.page.find('.logsheet').css("width", "150px")
		$(".logsheet").find("button[data-fieldname='logsheet']").on("click", function(){
			logged_date = $(".date").find("input[data-fieldname='date']").val()
			if (logged_date){
				frappe.call({
					method: "switsol.time_log_sheet.page.time_log_sheet.time_log_sheet.get_loged_timesheets",
					args: {
						"date": logged_date
					},
					callback: function(r) {
						if (r.message){
							this.dialog = new frappe.ui.Dialog({
	                            title: __("Logged Timesheets Details"),
	                            fields: [
	                                {"fieldtype":"HTML", "label":__("Loged Timesheets"), "reqd":1, "fieldname":"loged_sheets"}
	                            ]
	                        });
	                        html = $(frappe.render_template("logged_time_log_sheet",{
            	   				"data":r.message
            	   			})).appendTo(this.dialog.fields_dict.loged_sheets.wrapper);
	                        this.dialog.show();
	                        $($(this.dialog.$wrapper).children()[1]).addClass("modal-lg")
						}
						else{
							frappe.msgprint(__("Logged Timesheets not found for this date"))
						}
					}
				})
			}
			else{
				frappe.msgprint(__("Please select Date first for populating Logged Timesheet details"));
			}
		})
	},
	add_logged_sheets: function(){
		var me = this;
		me.page.find('.dtls').hide();
		me.page.find('.logged-sheets').hide();
		$(".date").find("input[data-fieldname='date']").on("change",function(){
			logged_date = $(".date").find("input[data-fieldname='date']").val()
			me.page.find('.dtls').hide();
			me.page.find('.logged-sheets').hide();
			$('.logged-sheets').empty();
			if (logged_date){
				frappe.call({
					method: "switsol.time_log_sheet.page.time_log_sheet.time_log_sheet.get_loged_timesheets",
					args: {
						"date": logged_date
					},
					callback: function(r) {
						if (r.message){
							me.page.find('.dtls').show();
							me.page.find('.logged-sheets').show();
							$('.logged-sheets').append(frappe.render_template("logged_time_log_sheet", {"data":r.message}))
						}
						else{
							frappe.msgprint(__("Logged Timesheets not found for this date"))
						}
					}
				})
			}
			else{
				frappe.msgprint(__("Please select Date first for populating Logged Timesheet details"));
			}
		})
	},
});