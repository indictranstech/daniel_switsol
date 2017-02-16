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
		common_function();	
	}
});


show_table = function(task_group_details_field){
	var me = this;
	$.each($(task_group_details_field).find(".task_group_title"),function(i,d){
		
			if($(d).hasClass("activate")){
				$(d).removeClass("activate")
				$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","none")	
			}
			else{
				$(d).addClass("activate")
				$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","")
			}
		
	})
}

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


common_function = function(){
	var me = this;
			frappe.call({
				method: "switsol.switsol.page.task_group.task_group.get_task_details",
				args: {
					"project":cur_frm.doc.name
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
								if(k[1] != "Done" && k[5] < frappe.datetime.nowdate()){
									due_and_done_task[1][i] += 1
								}
							})
						})
						me.data = r.message;
						cur_frm.fields_dict['task_group_template'].$wrapper.html(frappe.render_template("task_group",
																					{"data":me.data,
																					"due_and_done_task":due_and_done_task}
																					))
						show_table(cur_frm.fields_dict['task_group_template'].$wrapper.html);
						$(cur_frm.fields_dict['task_group_template'].$wrapper).find(".triangle").click(function(){
							id = $(this).attr("task-id")
							var dialog = new frappe.ui.Dialog({
			 				fields: [
									{
										"label": __("Title"), 
										"fieldname": "title",
										"fieldtype": "Data",
										"read_only": 1
									},
									{
										"label": __("Status"), 
										"fieldname": "status",
										"fieldtype": "Select",
										"options": ['Open','Waiting for Other Person','Unnecessary','Done','Working','Closed']
									},
									{
										"label": __("Task Group"), 
										"fieldname": "task_group",
										"fieldtype": "Data",
										"read_only": 1
									},
									{
										"fieldtype":"Column Break"
									},
									{
										"label": __("Start Date"), 
										"fieldname": "start_date",
										"fieldtype": "Date" 
									},
									{
										"label": __("End Date"), 
										"fieldname": "end_date",
										"fieldtype": "Date"
									},
									{
										"label": __("Responsible Staff Member"), 
										"fieldname": "responsible_staff_member",
										"fieldtype": "Link",
										"options":"Employee" 
									},
									{
										"label": __("Task ID"), 
										"fieldname": "task_id",
										"fieldtype": "Data" ,
										"read_only": 1
									}
							]

						});
						$.each(cur_frm.doc.tasks,function(task_index,task_data){
							if(id == task_data.task_id){
								dialog.fields_dict.title.set_value(task_data.title)
								dialog.fields_dict.status.set_value(task_data.status)
								dialog.fields_dict.task_group.set_value(task_data.group_name)
								dialog.fields_dict.start_date.set_value(task_data.start_date)
								dialog.fields_dict.end_date.set_value(task_data.end_date)
								dialog.fields_dict.responsible_staff_member.$input.val(task_data.responsible_user)
								dialog.fields_dict.task_id.set_value(task_data.task_id)
								$(dialog.fields_dict.task_id.$wrapper).hide();
								dialog.show();
							}
						});
						dialog.set_primary_action(__("Update"), function() {
							var id_value = dialog.fields_dict.task_id.value
							$.each(cur_frm.doc.tasks,function(i,d){
								if(id_value == d.task_id){
									frappe.model.set_value(String(d.doctype),String(d.name),"status",dialog.fields_dict.status.$input.val())
									frappe.model.set_value(String(d.doctype),String(d.name),"start_date",dialog.fields_dict.start_date.$input.val())
									frappe.model.set_value(String(d.doctype),String(d.name),"end_date",dialog.fields_dict.end_date.$input.val())
									frappe.model.set_value(String(d.doctype),String(d.name),"responsible_user",dialog.fields_dict.responsible_staff_member.$input.val())
								}
							});
							$.each($(cur_frm.fields_dict['task_group_template'].$wrapper).find(".task_row_data"),function(index,r_data){
								if(id_value == $(r_data).attr("task-id")) {
									$(r_data).find(".status").text(dialog.fields_dict.status.$input.val())	
									$(r_data).find(".start_date").text(dialog.fields_dict.start_date.$input.val())	
									$(r_data).find(".responsible_user").text(dialog.fields_dict.responsible_staff_member.$input.val())
								}
							});
							dialog.hide();
						});
			 		})
				}
				}				
			})	
}

var name_of_instructor = cur_frm.doc.project_training_details[0]['instructor']
cur_frm.cscript.kursbestatigung_generieren = function() {
	dialog_for_SC_MS_certificate("New Horizons Certificate",name_of_instructor)
}
cur_frm.cscript.ms_zertifikat_generieren = function() {
	dialog_for_SC_MS_certificate("Microsoft Certificate",name_of_instructor)
}

dialog_for_SC_MS_certificate = function(print_format,name_of_instructor){
	var student_data = {}
	$.each(cur_frm.doc.project_participant_details, function(idx, val){
		if(val.__checked == 1){
			student_data[val.student] = [val.student_email_id,val.student_name]
		}
	})
	if(Object.keys(student_data).length > 0){
		var dialog = new frappe.ui.Dialog({ 
			title: __("Details"),
			fields: [
					{fieldtype: "Link", fieldname: "instructor", label: __("Instructor"),options: "Instructor",default: name_of_instructor,
					change: function() {
						instructor_name = dialog.get_values().instructor;	
						validate_signature(instructor_name,dialog)
						}
					},
					{fieldtype: "Check", fieldname: "certificate", label: __("Certificate to be sent by Email?")
					}
			]
		})
		dialog.show();
		validate_signature(name_of_instructor,dialog);
		dialog.set_primary_action(__("ADD"), function(frm) {
			var is_checked_pdf_send_by_mail = dialog.fields_dict.certificate.get_value();
			var instructor_name = dialog.fields_dict.instructor.get_value();
			dialog.fields_dict.instructor.get_value() ? make_certificate(student_data,instructor_name,is_checked_pdf_send_by_mail,print_format,dialog):
			frappe.throw("Please Add Instructor")	
			// attach_new_horizon_certificate(frm); 
		});
	}
	else{
		frappe.throw("Select Student First")
	}
}

make_certificate = function(student_data,instructor,is_checked_pdf_send_by_mail,print_format,dialog){	
	frappe.call({
		method: "switsol.custom_script.project.certificate_creation",
		args: {
			"student_data":student_data,
			"project_name":cur_frm.doc.name,
			"instructor": instructor,
			"item": cur_frm.doc.item,
			"item_name":cur_frm.doc.item_name,
			"training_center":cur_frm.doc.project_training_details[0]['training_center'],
			"is_checked_pdf_send_by_mail" : is_checked_pdf_send_by_mail,
			"print_format" : print_format
		},
		callback: function(r) {
			/*if (r.message){
				attach_new_horizon_certificate(r.message,print_format)
			}*/
			dialog.hide()		
		}
	})
}

validate_signature = function(instructor_name,dialog){
	if(instructor_name){
		frappe.call({
			method:"switsol.custom_script.project.check_employee_signature",
			args:{
				"instructor_name": instructor_name
			},
			callback: function(r){
				if (r.message && r.message != "true"){
					dialog.fields_dict.instructor.$input.val("")
					frappe.throw(__(r.message))
				}
			}
		})
	}
}

/*attach_new_horizon_certificate = function(certificate,print_format) {
	console.log("inside frappe",print_format)
	var url = frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate+"&format="+print_format+"&no_letterhead=0"
	frappe.call({
		method: "switsol.switsol.doctype.certificate.certificate.add_attachments",
		args: {
			"certificate":certificate,
			"url":url,
			"print_format":print_format
		},
		callback: function(r) {
			if (r.message){
				cur_frm.save()
				frappe.msgprint("Standard Certificate Is attached")
			}
		}
	})
}
*/

/*frappe.ui.form.on("Task Group Task Table",{
	responsible_user:function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		update_or_add_responsible_user_of_task(d);
	}
});*/


/*frappe.call({
							method: "switsol.switsol.page.task_group.task_group.all_data",
							args: {
								"id": id
							},
							callback: function(r) {
								console.log(r.message[0]['responsible_user'])
								if(r.message){	
									dialog.fields_dict.title.set_value(r.message[0]['subject'])
									dialog.fields_dict.status.set_value(r.message[0]['status'])
									dialog.fields_dict.task_group.set_value(r.message[0]['group_name'])
									dialog.fields_dict.start_date.set_value(r.message[0]['exp_start_date'])
									dialog.fields_dict.end_date.set_value(r.message[0]['exp_end_date'])
									dialog.fields_dict.responsible_staff_member.$input.val(r.message[0]['responsible_user'])
									dialog.fields_dict.task_id.set_value(r.message[0]['name'])
									$(dialog.fields_dict.task_id.$wrapper).hide();
									dialog.show();
								}
							}
						});*/


		/*frm.add_custom_button(__("Task Group Details"), function() {
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
		});*/

		/*cur_frm.set_indicator_formatter("task_group_with_indicator",function(doc) { 
			if(doc.start_date > frappe.datetime.nowdate()){
				return "orange"
			}
			if(doc.end_date < frappe.datetime.nowdate()){
				return "red"
			}
		});*/
		/*if(cur_frm.doc.tasks && cur_frm.doc.task_group_task_table.length == 0){
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
		}*/
/*show_table = function(task_group_details_field){
	var me = this;
	$.each($(task_group_details_field).find(".task_group_title"),function(i,d){
		$(d).click(function(e){
			if($(d).hasClass("activate")){
				$(d).removeClass("activate")
				$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","none")	
			}
			else{
				$(d).addClass("activate")
				$(task_group_details_field).find(".table[group-name='"+$(this).attr("group-name")+"']").css("display","")
			}
		}).on('click','.table-hover',function(e){
			e.stopPropagation();
		})
	})
}*/