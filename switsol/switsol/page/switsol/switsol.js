frappe.pages['switsol'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Switsol Time Log',
		single_column: true
	});
	wrapper.timelog = new timelog(wrapper)
	frappe.breadcrumbs.add("Switsol");
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
		html = "<div class='row'  style='border:1px solid #d1d8dd; padding-bottom:10px;'>\
  				<div class='col-xs-2 date'></div>\
				<div class='col-xs-2 customer'></div>\
				<div class='col-xs-2 project'></div>\
  				<div class='col-xs-2 activity'></div>\
  				<div class='col-xs-2 logsheet' style='padding-top: 20px;'></div>\
  				<div class='col-xs-2'></div>\
  				</div>"
		me.page.html(html)
		me.customer_link = frappe.ui.form.make_control({
			parent: me.page.find(".customer"),
			df: {
			fieldtype: "Link",
			options: "Customer",
			fieldname: "customer",
			placeholder: "Select Client"
			},
			render_input: true
		});
		me.customer_link.refresh();
		me.date = frappe.ui.form.make_control({
			parent: me.page.find(".date"),
			df: {
				fieldtype: "Date",
				fieldname: "date",
				placeholder: "Date",
				default: frappe.datetime.get_today()
			},
			render_input: true
		});
		me.date.refresh();
		me.project = frappe.ui.form.make_control({
			parent: me.page.find(".project"),
			df: {
				fieldtype: "Link",
				fieldname: "project",
				options:"Project",
				placeholder: "Project",
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
				options:"Activity Type",
				placeholder: "Activity"
			},
			render_input: true
		});
		me.activity.refresh();
		me.logsheet = frappe.ui.form.make_control({
			parent: me.page.find(".logsheet"),
			df: {
				fieldtype: "Button",
				fieldname: "logsheet",
				label: __("Loged Sheets")
			},
			render_input: true
		});
		me.logsheet.refresh();
		__html = frappe.render_template("switsol")
		me.page.append(__html)
		me.set_hours();
		me.on_submit();
		me.calulate_hours();
		me.get_loged_sheets();
	},
	set_hours:function(){
		var hours = ""
		var minute = ""
		$(".start_input_hours").click(function(){
			hours = String($(this).attr("class"))
			minute = ""
		})
		$(".end_input_hours").click(function(){
			hours = String($(this).attr("class"))
			minute = ""
		})
		$(".start_input_minute").click(function(){
			minute = String($(this).attr("class"))
			hours = ""
		})
		$(".end_input_minute").click(function(){
			minute = String($(this).attr("class"))
			hours = ""
		})
		$(".hours").click(function(){
			$("."+hours).val($(this).attr("value"))
			if($(".end_input_hours").val() && hours == "start_input_hours"){
				difference = (flt($(".end_input_hours").val()) - flt($(".start_input_hours").val()))
				if(difference >= 0){
					$(".input_hours").val(difference)
				}
				else if(difference < 0){
					difference = 24 - difference
					$(".input_hours").val(difference)	
				}
			}
			if($(".start_input_hours").val() && hours == "end_input_hours"){
				difference = (flt($(".end_input_hours").val()) - flt($(".start_input_hours").val()))
				if(difference >= 0){
					$(".input_hours").val(difference)
				}
				else if(difference < 0){
					difference = 24 + difference
					$(".input_hours").val(difference)	
				}
			}
		});
		$(".minute").click(function(){
			$("."+minute).val($(this).attr("value"))
			if($(".end_input_minute").val() && minute == "start_input_minute"){
				diff = (flt($(".end_input_minute").val()) - flt($(".start_input_minute").val()))
				if(diff >= 0){
					$(".input_minute").val(diff)
				}
				else if(diff < 0){
					diff = 60 - diff
					$(".input_minute").val(diff)	
				}
			}
			if($(".start_input_minute").val() && minute == "end_input_minute"){
				diff = (flt($(".end_input_minute").val()) - flt($(".start_input_minute").val()))
				if(diff >= 0){
					$(".input_minute").val(diff)
				}
				else if(diff < 0){
					diff = 60 + diff
					$(".input_minute").val(diff)	
				}
			}
		});
	},
	on_submit:function(){
		var me = this;
		$(".submit").click(function(){
			date = $(".date").find("input[data-fieldname='date']").val()
			client = $(".customer").find("input[data-fieldname='customer']").val()
			project = $(".project").find("input[data-fieldname='project']").val()
			activity = $(".activity").find("input[data-fieldname='activity']").val()

			if (date && client && project && activity){
				me.date = date.split("-")
				me.date = me.date[2]+"-"+me.date[1]+"-"+me.date[0]
				
				if($(".start_input_hours").val() && $(".end_input_hours").val() && $(".start_input_minute").val() && $(".end_input_minute").val()){
					if ($(".start_input_hours").val() <= $(".end_input_hours").val()){
						me.start = String(me.date)+" "+ $(".start_input_hours").val()+":"+$(".start_input_minute").val()+":"+"00"
						me.end	= String(me.date)+" "+ $(".end_input_hours").val()+":"+ $(".end_input_minute").val()+":"+"00"
						if(frappe.datetime.now_datetime() >= me.end){
							me.make_timesheet();
						}
						else{
							msgprint(__("Timesheet log creation should be valid up to current time. Please chose valide date & time."));
						}												
					}
					else{
						msgprint(__("End Time should be greater then Start Time."));
					}
				}
				else{
					msgprint(__("Please select Start Time and End Time befor Submit..."));
				}
			}
			else{
				msgprint(__("Please select Client, Project, Activity and Date befor Submit..."));
			}
		})
	},
	make_timesheet: function() {
		var me = this;
		start = me.start
		var d = new Date(me.start);
		d.setHours(d.getHours() + cint($(".input_hours").val()));
		d.setMinutes(d.getMinutes() + cint($(".input_minute").val()));
		end = moment(d).format("YYYY-MM-DD HH:mm:ss")
		hours = moment(end).diff(moment(start),"seconds") / 3600
		frappe.call({
			method: "switsol.switsol.page.switsol.switsol.make_timesheet",
			args: {
				"customer": client,
				"activity":me.activity.$input.val(),
				"project": me.project.$input.val(),
				"from_date_time": start,
				"to_date_time": end,
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
				msgprint("Timesheet log created successfully...")
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
			method: "switsol.switsol.page.switsol.switsol.calculate_total_hours",
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
		console.log(me.page.find('.logsheet'))
		console.log($('.logsheet'))
		me.page.find('.logsheet').css("width", "150px")
		$(".logsheet").find("button[data-fieldname='logsheet']").on("click", function(){
			date = $(".date").find("input[data-fieldname='date']").val()
			if (date){
				date = date.split("-")
				date = date[2]+"-"+date[1]+"-"+date[0]
				frappe.call({
					method: "switsol.switsol.page.switsol.switsol.get_loged_timesheets",
					args: {
						"date": date
					},
					callback: function(r) {
						if (r.message){
							var di = new frappe.ui.Dialog({
	                            title: __("Loged Timesheets Details"),
	                            fields: [
	                                {"fieldtype":"HTML", "label":__("Loged Timesheets"), "reqd":1, "fieldname":"loged_sheets"}
	                            ]
	                        })
	                        $(di.body).find("[data-fieldname='loged_sheets']").html(frappe.render_template("switsol_logsheet", {"data":r.message}))
	                        di.show();
	                        $(di.body).find("[data-fieldname='loged_sheets']").css({"width": "710px", "height":"250px", "overflow-x": "scroll"})
	                        $(".modal-content").css({"width": "750px"})
						}
					}
				})
			}
			else{
				msgprint(__("Please select Date first for populating Loged Timesheet details..."));
			}
		})
	},
});