

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
		frm.add_custom_button(__("Werbemail Senden"), function() {
			frappe.route_options = {
				"project_name": frm.doc.name,
				"training_id": frm.doc.training_id
			};
			frappe.set_route("Form", "Training Mail");
		});
		render_task_group();	
		make_jumping_section();
	}
});

/*
section_jump.html is rendered in 'section_jump_template' html field in which id is attached.
For jumping to the particular section, id is generated dynamically for each section

By scrollTop(jquery plugin), it redirects to particuar section by providing # + dynamic id 
*/
make_jumping_section = function(){
	
	cur_frm.fields_dict['section_jump_template'].$wrapper.html(frappe.render_template("section_jump"))

	var section_name = ['sb_project_customer_details','training_details_sb','sb_learning_material',
						'section_break0','agenda_sb','task_group_sb_trainer',
						'task_group_sb_lernumgebung','task_group_sb_lernmaterial',
						'task_group_sb_raum','task_group_sb_tn_amt','task_group_sb_teilnehmer',
						'task_group_sb_organisation','task_group_sb_mobiles_klassenzimmer']
	
	$.each(cur_frm.fields_dict,function(i,d){
		if(inList(section_name, d.df.fieldname)) {
			$(d.wrapper[0]).attr('id',String(d.df.fieldname))
		}
	});

	$('[scroll-id="comments"]').click(function(e){
		e.preventDefault();
		 $("html, body").animate({scrollTop: $('.timeline-items').offset().top - $("html, body").offset().top, scrollLeft: 0},300); 
	});

	$(cur_frm.fields_dict.section_jump_template.wrapper).find('.jump').click(function(e){
		e.preventDefault();
		$('html, body').animate({
        scrollTop: $("#"+$(this).attr('scroll-id')).offset().top-100},'slow');
		});

	var comment_list = []
	$.each(cur_frm.timeline.get_communications(),function(i,d){
		if(d.content){
			comment_list.push(d.content)
		}
	})
	
	comment_list.length ? $('[scroll-id="comments"]').css("font-weight","bold") : ""
	cur_frm.doc.agenda ? $('[scroll-id="agenda_sb"]').css("font-weight","bold")  : ""
	cur_frm.doc.notes ? $('[scroll-id="section_break0"]').css("font-weight","bold") : ""
	cur_frm.doc.project_participant_details.length ? $('[scroll-id="sb_project_customer_details"]').css("font-weight","bold") : ""
	cur_frm.doc.project_learning_material ? $('[scroll-id="sb_learning_material"]').css("font-weight","bold") : ""
	cur_frm.doc.project_training_details ? $('[scroll-id="training_details_sb"]').css("font-weight","bold") : ""
}

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


render_task_group = function(){
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

								if(k[5] && k[5] < dateutil.get_today() && ($.inArray(k[1], ["Done", "Closed", "Unnecessary"]) == -1)) {
									due_and_done_task[1][i] += 1;
								}

								if(!($.inArray(k[1], ["Done", "Closed", "Unnecessary"]) == -1)) {
									due_and_done_task[0][i] += 1
								}
								
							})
							due_and_done_task[0][i] = (due_and_done_task[0][i]*100/r.message[i].length).toFixed(2);
						})
						me.data = r.message;
						cur_frm.fields_dict['task_group_template'].$wrapper.html(frappe.render_template("task_group",
																					{"data":me.data,
																					"due_and_done_task":due_and_done_task}
																					))
						show_table(cur_frm.fields_dict['task_group_template'].$wrapper.html);

						$(".tlink").click(function(e){
								e.preventDefault();
								$('html, body').animate({
								scrollTop: $("#"+$(this).attr('scroll-id')).offset().top-100},'slow');
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
//for new horizon certificate creation
cur_frm.cscript.kursbestatigung_generieren = function() {
	var lang = language_of_user()
	if(lang == "de"){
		var print_format = "New Horizons Zertifikat"
	}
	else if(lang == "en" || lang == "en-US"){
		var print_format = "New Horizons Certificate"
	}
	dialog_for_SC_MS_certificate(print_format)
}

//for microsoft certificate creation
cur_frm.cscript.ms_zertifikat_generieren = function() {
	var lang = language_of_user()
	if(lang == "de"){
		var print_format = "Microsoft Zertifikat"	
	}
	else if(lang == "en" || lang == "en-US"){
		var print_format = "Microsoft Certificate"		
	}
	dialog_for_SC_MS_certificate(print_format)
}

/*
Dialog created for both "Microsoft Certificate"	and "New Horizons Certificate"
*/
dialog_for_SC_MS_certificate = function(print_format){
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
					{fieldtype: "Link", fieldname: "instructor", label: __("Signature Certificate"),options: "Instructor",default:"TRAINER-00001",
					change: function() {
						validate_signature($(this).val(),dialog)
						}
					},
					{fieldtype: "Data", fieldname: "instructor_name", label: __("Name of the signature person"),read_only: 1},
					{fieldtype: "Check", fieldname: "send_by_mail", label: __("Send certificate by mail")},
					{fieldtype: "Data", fieldname: "cc", label: __("CC"),default:"operations@newhorizons.ch",depends_on: 'eval:doc.send_by_mail == "1"'},
					{fieldtype: "Link", fieldname: "predefined_text", label: __("Email Content"),options: "Predefined Text Container",default: "Zertifikat für Ihr besuchtes New Horizons Training",
					 depends_on: 'eval:doc.send_by_mail == "1"',
					 change: function(){
					 	content_of_predefined_text(dialog)
					 }
					},
					{fieldtype: "Text Editor", fieldname: "predefined_text_value",depends_on: 'eval:doc.send_by_mail == "1"'}
					
			]
		})
		dialog.fields_dict.send_by_mail.$input.click(function() {
			content_of_predefined_text(dialog)
		});
		if(print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat"){
			dialog.fields_dict.send_by_mail.$wrapper.hide()
			dialog.fields_dict.cc.$wrapper.hide()
		}
		dialog.show();
		validate_signature(dialog.fields_dict.instructor.get_value(),dialog);

		dialog.set_primary_action(__("ADD"), function(frm) {
			var instructor_name = dialog.fields_dict.instructor.get_value(); 
			var certificate = make_certificate(student_data,print_format,dialog)
			instructor_name ? certificate : frappe.throw(__("Please Add Instructor"))
			if(print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat")
				{
					for(var i in certificate) 
					{
						window.open(frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate[i]+"&format=Microsoft Certificate&print_format="+print_format+"&no_letterhead=0");
					}
				}
		});
	}
	else{ 
		frappe.throw(__("Select Student First"))
	}
}
make_certificate = function(student_data,print_format,dialog){
	dialog.hide();
	var async_val = true;
	if (print_format == "Microsoft Certificate" || print_format == "Microsoft Zertifikat"){
		async_val = false
	}
	
	var name_of_certificate
	frappe.call({
		method: "switsol.custom_script_project.project.certificate_creation",
		freeze: true,
		freeze_message: __("Sending Mails"),
		args: {
			"student_data":student_data,
			"project_name":cur_frm.doc.name,
			"item": cur_frm.doc.item,
			"item_name":cur_frm.doc.item_name,
			"training_center":cur_frm.doc.project_training_details[0]['training_center'],
			"print_format" : print_format,
			"start_date" : cur_frm.doc.expected_start_date,
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

_instructor_name = function(dialog){
	instructor = dialog.fields_dict.instructor.get_value()
    frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Instructor",
				fieldname: "instructor_name",
				filters: {name:instructor}
			},
			callback: function(r) {
				if(r.message) {
					dialog.set_value("instructor_name",r.message.instructor_name)
				}
			}
		});
}

validate_signature = function(instructor_name,dialog){
	if(instructor_name){
		frappe.call({
			method:"switsol.custom_script_project.project.check_employee_signature",
			args:{
				"instructor_name": instructor_name
			},
			callback: function(r){
				if (r.message){
					dialog.fields_dict.instructor.$input.val("")
					dialog.fields_dict.instructor_name.set_value("")
					frappe.msgprint(__(r.message))
				}
				else{
					_instructor_name(dialog);
				}
			}
		})
	}
}

/*send_training_mail = function(){
	// var project_name = [cur_frm.doc.name]
	var dialog = new frappe.ui.Dialog({ 
			title: __("Training Mail"),
			fields: [
					{fieldtype: "Link", fieldname: "project", label: __("Project"),options: "Project",default:cur_frm.doc.name,
						change: function(){
							// project_name.push($(this).val())
							$(dialog.body).find('.project_name').append("<tr><td>"+$(this).val()+"</td><td>x</td></tr>")
							// console.log(project_name,"**********")
						}
					},
					{fieldtype: "HTML", fieldname: "project_table"},
					{fieldtype: "Link", fieldname: "customer", label: __("Customer"),options: "Customer"},
					{fieldtype: "Link", fieldname: "contact", label: __("Contact"),options: "Contact",
						change: function(){

						}
					},
					{fieldtype: "HTML", fieldname: "contact_table"},
					{fieldtype: "Link", fieldname: "predefined_text", label: __("Email Content"),options: "Predefined Text Container",
					 change: function(){
					 	content_of_predefined_text(dialog)
					 }
					},
					{fieldtype: "Text Editor", fieldname: "predefined_text_value"}

			]
		})
	// console.log(project_name,"**********")
	$(frappe.render_template("training_mail",{"name":dialog.fields_dict.project.value})).appendTo(dialog.fields_dict.project_table.wrapper);
	$(frappe.render_template("training_mail",{"name":dialog.fields_dict.contact.value})).appendTo(dialog.fields_dict.contact_table.wrapper);

	dialog.show();
}*/