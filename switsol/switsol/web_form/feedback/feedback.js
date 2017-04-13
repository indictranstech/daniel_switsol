frappe.ready(function() {
	var form = $('#page-feedback')
	var seminar_course = $('form[data-web-form="feedback"]').find('select[name="seminar_course"]')
	var student_id = $('form[data-web-form="feedback"]').find('input[name="student_id"]')
	bind_field = new Fieldevent(form,seminar_course)
	window.location.href.split("=")[1] ? 
	filter_options_of_seminar([["training_id","=",String(window.location.href.split("=")[1])]],seminar_course,String(window.location.href.split("=")[1]))
	:filter_options_of_seminar([["status","=","1"]],seminar_course);
	if (frappe.session.user == 'Guest') {
		$('body').find('.sidebar-block').remove();
		$('body').find('.navbar-header').hide();
	}
	$('[name="Message"]').addClass("control-label text-muted");
	$('[name="Message"]').css("padding-top","40px");
});


Fieldevent = Class.extend({
	init:function(form,seminar_course){
		var me = this;
		this.form = form;
		this.seminar_course = seminar_course;
		me.change_events()

	},
	change_events:function(){
		var me = this;
		$(me.form).find('input[name="training_id"]').change(function(){
			if($(this).val()){
				filter_options_of_seminar([["training_id","=",String($(this).val())]],me.seminar_course,String($(this).val()))
			}
			else{
				var options= "<option value='' selected='selected'></option>"
				$(me.seminar_course).empty().append('"'+options+'"')
			}	
		})
		$(me.form).find('input[name="student_id"]').change(function(){
			if($(this).val()){
				email_id_of_student([["student_id","=",String($(this).val())]])			
			}
		})

		/*$(me.form).find('input[name="student_id"]').change(function(){
			if($(this).val()){
				name_of_student([["student_id","=",String($(this).val())]])			
			}
		})*/
	}
})


filter_options_of_seminar = function(filter_list,seminar_course,training_id){
	frappe.call({
		method:"switsol.switsol.web_form.feedback.feedback.get_list",
		args:{
			doctype:"Project",
			filters: filter_list,
			fields: ["name"]
		},	
		callback: function(r) {
			console.log(r.message)
			if (r.message) {
				if(r.message.length > 1){
					var options= "<option value='' selected='selected'></option>"
					$.each(r.message,function(i,d){
						console.log(d)
						options += "<option value='"+d['name']+"'"+">"+d['name']+"</option>"
					})
					$(seminar_course).empty().append('"'+options+'"')
				}
				else if(r.message.length == 1){
					var options= "<option value='"+r.message[0]['name']+"'"+"selected='selected' >"+r.message[0]['name']+"</option>"
					$(seminar_course).empty().append('"'+options+'"')
					$(seminar_course).prop("disabled", true );
					$('form[data-web-form="feedback"]').find('input[name="training_id"]').val(training_id)	
					$('form[data-web-form="feedback"]').find('input[name="training_id"]').prop("disabled", true );
				}
			}
			else{
				var options= "<option value='' selected='selected'></option>"
				$(seminar_course).empty().append('"'+options+'"')
			}
		}
	});
}

email_id_of_student = function(filter_list){
	frappe.call({
		method:"switsol.switsol.web_form.feedback.feedback.get_list",
		args:{
			doctype:"Student",
			filters: filter_list,
			fields: ["student_email_id"]
		},
		callback: function(r) {
			if(r.message) {
				console.log(r.message)
				$('form[data-web-form="feedback"]').find('input[name="student_email_id"]').val(r.message[0]['student_email_id'])
				$('form[data-web-form="feedback"]').find('input[name="student_email_id"]').prop("disabled", true );
			}
		}
	});
}

/*name_of_student = function(filter_list){
	frappe.call({
		method:"switsol.switsol.web_form.feedback.feedback.get_list",
		args:{
			doctype:"Student",
			filters: filter_list,
			fields: ["first_name","last_name"]
		},
		callback: function(r) {
			if(r.message) {
				console.log(r.message)
				$('form[data-web-form="feedback"]').find('input[name="first_name"]').val(r.message[0]['first_name'])
				$('form[data-web-form="feedback"]').find('input[name="last_name"]').val(r.message[0]['last_name'])
			}
		}
	});
}*/