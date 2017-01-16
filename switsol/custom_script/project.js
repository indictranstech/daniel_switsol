frappe.ui.form.on("Project", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal){
		frm.add_custom_button(__("Feedback Kursteilnehmer"), function() {
			frappe.route_options = null;
			frappe.route_options = {"project": cur_frm.doc.name};
			frappe.set_route("feed_back_summary");
		});
		frm.add_custom_button(__("Freitexte Kursteilnehmer"), function() {
			frappe.route_options = {"project": cur_frm.doc.name};
			frappe.set_route("query-report","Feedback");
		});
		frm.add_custom_button(__("Task Group Details"), function() {
			frappe.route_options = {"project": cur_frm.doc.name};
			var dialog = new frappe.ui.Dialog({ 
				title: __("Task Group Details"),
				fields: [
						{
							"label": __("Task Group Details"), 
							"fieldname": "task_group_details",
							"fieldtype": "HTML", 
						}
				]

			})
			dialog.show();
			var me = this;
			frappe.call({
				method: "switsol.switsol.page.task_group.task_group.get_task_details",
				args: {
					"project":cur_frm.doc.name,
				},
				callback: function(r) {
					if (r.message){
						due_and_done_task = [{},{}]
						$.each(r.message,function(i,d){
							due_and_done_task[0][i] = 0
							due_and_done_task[1][i] = 0
							$.each(r.message[i],function(j,k){
								 console.log(k)
								if(k[1] == "Done"){
									due_and_done_task[0][i] =  (flt(due_and_done_task[0][i]) + flt(1/r.message[i].length*100)).toFixed(2)
								}
								if(k[5] < frappe.datetime.nowdate()){
									due_and_done_task[1][i] += 1
								}
							})
						})
						me.data = r.message;
						task_group_details_field = dialog.fields_dict.task_group_details.$wrapper;
						var __html = frappe.render_template("task_group",{"data":me.data,"due_and_done_task":due_and_done_task})
						task_group_details_field.append(__html)
						show_table(task_group_details_field);
					}
					else{
						__html = "<h1 class='task_group' style='padding-left: 25px;'>No Result</h1>"
						task_group_details_field.append(__html)
					}
				}				
			})
		});
		/*cur_frm.set_indicator_formatter("task_group_with_indicator",function(doc) { 
			if(doc.start_date > frappe.datetime.nowdate()){
				return "orange"
			}
			if(doc.end_date < frappe.datetime.nowdate()){
				return "red"
			}
		});*/
		if(cur_frm.doc.tasks && cur_frm.doc.task_group_task_table.length == 0){
			frappe.call({
				method: "switsol.switsol.page.task_group.task_group.get_task_details",
				freeze: true,
				freeze_message: __("Please Wait..."),
				args: {
					"project":cur_frm.doc.name
				},
				callback: function(r) {
					if (r.message){
						due_and_done_task = {}
						$.each(r.message,function(i,d){
							due_and_done_task[i] = []
							$.each(d,function(j,k){
								if(k[5] < frappe.datetime.nowdate()){
									due_and_done_task[i][0] = flt(due_and_done_task[i][0]) + 1 
								}
								if(k[1] == "Done"){
									due_and_done_task[i][1] = (flt(due_and_done_task[i][1]) + flt(1/r.message[i].length*100)).toFixed(2)
								}
							})
						})
						cur_frm.doc.task_group_task_table = []
						$.each(due_and_done_task,function(i,d){
							var row = frappe.model.add_child(cur_frm.doc,'Task Group Task Table', 'task_group_task_table');
							row.task_group = i
							row.overdue = d[1] ? d[1]:"0.0"
							row.done = d[0] ? d[0]:"0.0"
							refresh_field("task_group_task_table");
						})
					}
				}
			})		
		}
	}
});

show_table = function(task_group_details_field){

						var me = this;
						$.each($(task_group_details_field).find(".task_group_title"),function(i,d){
							// console.log("byee",me.page)
							$(d).click(function(){
								if($(d).hasClass("activate")){
									$(d).removeClass("activate")
									$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","none")	
								}
								else{
									$(d).addClass("activate")
									$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","")
								}
							})
						})
			}


frappe.ui.form.on("Task Group Task Table",{
	responsible_user:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		update_or_add_responsible_user_of_task(d);
	}
})

update_or_add_responsible_user_of_task = function(d){
	if(cur_frm.doc.tasks.length > 0){
		$.each(cur_frm.doc.tasks,function(i,row){
			if(row['group_name'] == d.task_group){
				frappe.model.set_value(row.doctype, row.name, 
					"responsible_user", d.responsible_user);
			}
		})
	}
}	