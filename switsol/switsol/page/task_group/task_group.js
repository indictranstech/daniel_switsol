frappe.pages['task-group'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Task Group'),
		single_column: true
	});
	wrapper.feed_back_summary = new task_group(wrapper)
	frappe.breadcrumbs.add("Switsol");
}

task_group = Class.extend({
	init: function(wrapper) {
		var me = this;
		this.wrapper_page = wrapper.page;
		this.page = $(wrapper).find('.layout-main-section');
		this.wrapper = $(wrapper).find('.page-content');
		this.set_fields();
	},
	set_fields:function(){
		var me = this;
		html = "<div class='row' style='border-bottom:1px solid #d1d8dd;margin-right:0px;margin-left: 0px;'>\
					<div class='col-xs-3 project' style='padding-left: 25px;'></div>\
				</div>\
				<div class='row task_group' style='margin-right:0px;margin-left: 0px;'>\
				</div>"
		me.page.html(html)
		me.project = frappe.ui.form.make_control({
			parent: me.page.find(".project"),
			df: {
			fieldtype: "Link",
			options: "Project",
			label:__("Project"),
			fieldname: "project",
			placeholder: __("Project")
			},
			render_input: true
		});
		me.project.refresh();
		me.project_change();
	},
	project_change:function(){
		var me = this;
		$(me.page).find(".project").change(function(){
			me.get_task_details();
		})
	},
	get_task_details:function(){
		var me = this;
		frappe.call({
			method: "switsol.switsol.page.task_group.task_group.get_task_details",
			args: {
				"project":me.project.$input.val() ? me.project.$input.val() :"",
			},
			callback: function(r) {
				if (r.message){
					due_and_done_task = [{},{}]
					$.each(r.message,function(i,d){
						due_and_done_task[0][i] = 0
						due_and_done_task[1][i] = 0
						$.each(r.message[i],function(j,k){
							if(k[1] == "Done"){
								due_and_done_task[0][i] =  (flt(due_and_done_task[0][i]) + flt(1/r.message[i].length*100)).toFixed(2)
							}
							if(k[5] < frappe.datetime.nowdate()){
								due_and_done_task[1][i] += 1
							}
						})
					})
					me.data = r.message;
					var __html = frappe.render_template("task_group",{"data":me.data,"due_and_done_task":due_and_done_task})
					$(me.page).find(".task_group").empty();
					me.page.find(".task_group").append(__html)
					me.show_table();
				}
				else{
					$(me.page).find(".task_group").empty();
					__html = "<h1 class='task_group' style='padding-left: 25px;'>No Result</h1>"
					me.page.find(".task_group").append(__html)		
				}
			}
		})
	},
	show_table:function(){
		var me = this;
		$.each($(me.page).find(".task_group_title"),function(i,d){
			$(d).click(function(){
				if($(d).hasClass("activate")){
					$(d).removeClass("activate")
					$(me.page).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","none")	
				}
				else{
					$(d).addClass("activate")
					$(me.page).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","")
				}
			})
		})
	}
})	