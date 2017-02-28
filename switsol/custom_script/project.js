

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

language_of_user = function(){
	var lang
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "User",
				fieldname: "language",
				filters: {name:frappe.session.user}
			},
			async: false,
			callback: function(r) {
				if(r.message) {
				lang = r.message['language']
				}
			}
		});

return lang
}

cur_frm.cscript.kursbestatigung_generieren = function() {

	var lang = language_of_user()
	if(lang == "de"){
		var print_format = "New Horizons Zertifikat"
	}
	else if(lang == "en" || lang == "en-US"){
		var print_format = "New Horizons Certificate"
	}
	var name_of_instructor = cur_frm.doc.project_training_details[0]['instructor']
	dialog_for_SC_MS_certificate(print_format,name_of_instructor)
}

cur_frm.cscript.ms_zertifikat_generieren = function() {
	var lang = language_of_user()
	if(lang == "de"){
		var print_format = "Microsoft Zertifikat"	
	}
	else if(lang == "en" || lang == "en-US"){
		var print_format = "Microsoft Certificate"		
	}
	var name_of_instructor = cur_frm.doc.project_training_details[0]['instructor']
	dialog_for_SC_MS_certificate(print_format, name_of_instructor)
}

dialog_for_SC_MS_certificate = function(print_format, name_of_instructor){
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
						validate_signature($(this).val(),dialog)
						}
					},
					{fieldtype: "Check", fieldname: "certificate", label: __("Send certificate by mail")},
					{fieldtype: "Data", fieldname: "cc", label: __("CC"),default:"operations@newhorizons.ch"},
					{fieldtype: "Link", fieldname: "predefined_text", label: __("Email Content"),options: "Predefined Text Container",default: "Zertifikat für Ihr besuchtes New Horizons Training",
					 depends_on: 'eval:doc.certificate == "1"',
					 change: function(){
					 	content_of_predefined_text(dialog)
					 }
					},
					{fieldtype: "Text Editor", fieldname: "predefined_text_value",depends_on: 'eval:doc.certificate == "1"'}
					
			]
		})
		dialog.fields_dict.certificate.$input.click(function() {
			content_of_predefined_text(dialog)
		});
		if(print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat"){
			dialog.fields_dict.certificate.$wrapper.hide()
			dialog.fields_dict.cc.$wrapper.hide()
		}
		dialog.show();
		validate_signature(name_of_instructor,dialog);

		dialog.set_primary_action(__("ADD"), function(frm) {
			var is_checked_pdf_send_by_mail = dialog.fields_dict.certificate.get_value();
			var instructor_name = dialog.fields_dict.instructor.get_value(); 
			var certificate = make_certificate(student_data,instructor_name,is_checked_pdf_send_by_mail, print_format, dialog)
			dialog.fields_dict.instructor.get_value() ? certificate : frappe.throw(__("Please Add Instructor"))
			if(print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat")
				{
					for(var i in certificate) 
					{
						window.open(frappe.urllib.get_base_url() + "/print?doctype=Certificate&name="+certificate[i]+"&format=Microsoft%20Certificate&no_letterhead=0");
					}
				}
		});
	}
	else{ 
		frappe.throw(__("Select Student First"))
	}
}

make_certificate = function(student_data,instructor,is_checked_pdf_send_by_mail,print_format,dialog){
	dialog.hide();
	if (print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat"){
		async_val = false
	}
	else {
		async_val = true
	}
	var name_of_certificate
	frappe.call({
		method: "switsol.custom_script.project.certificate_creation",
		freeze: true,
		freeze_message: __("Sending Mails"),
		args: {
			"student_data":student_data,
			"project_name":cur_frm.doc.name,
			"instructor": instructor,
			"item": cur_frm.doc.item,
			"item_name":cur_frm.doc.item_name,
			"training_center":cur_frm.doc.project_training_details[0]['training_center'],
			"is_checked_pdf_send_by_mail" : is_checked_pdf_send_by_mail,
			"print_format" : print_format,
			"args" : dialog.get_values()
		},
		async : async_val,
		callback: function(r) {
			if(r.message){
				name_of_certificate = r.message
			}
			
		}
	})
	return name_of_certificate
}

content_of_predefined_text = function(dialog){
	predefined_content = dialog.fields_dict.predefined_text.get_value(); 
	frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Predefined Text Container",
				fieldname: "predefined_text_container",
				filters: {name:predefined_content}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("predefined_text_value",r.message.predefined_text_container)
				}
			}
		});

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
