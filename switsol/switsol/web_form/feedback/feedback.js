frappe.ready(function() {
	var me = this;
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
		me.make_star_rating()
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
	},
	make_star_rating: function(){
		var me = this;
		html = "<div class='rateyo' style='padding: 0px 50px;margin-left: -50px;padding-bottom:15px'>\
	 			</div>"
	 	var section_name = {}
	 	section_name = {
	 						'quality_training_room':'quality_training_room_star',
	 						'performance_hardware': 'performance_hard_soft_star',
	 						'knowledge_of_leader':'knowledge_leader_star',
	 						'answering_by_instructor':'answering_instructor_star',
							'practical_examples':'ability_examples_star',
							'presentation_ability_of_leader':'presentation_leader_star',
							'total_performance_of_leader':'total_of_leader_star',
							'comprehensibility_of_training_content':'comprehensan_t_content_star',
							'context_of_training_content':'context_t_content_star',
							'verbosity_of_training':'verbosity_t_content_star',
							'benefits_of_exercises':'benefits_of_practice_star',
							'suitability_of_exercises':'suitability_knowledge_skills_star',
							'time_spent_with_discussions':'pure_lecture_time_star',
							'language_quality_of_course_materials':'course_materials_star',
							'knowledge_skills_acquired':'knowledge_skills_training_star',
							'influence_of_training':'advancement_opportunities_star',
							'accomplishment_of_your_professional_tasks':'professional_tasks_star',
							'training_expectations':'t_meet_expectations_star',
							'satisfied_with_this_training':'how_satisfied_training_star'
						}

		$.each(section_name,function(i,d){
			var select_field = $('[name='+ i + ']')
			select_field.addClass("control-label text-muted small");
			select_field.append(html)
			me.rate(d)

		})	

	},
	rate: function(field){
		$(".rateyo").each(function (e) {
		    $(this).rateYo({
		        onSet: function (rating, rateYoInstance) {
		            $(this).next().val(rating);
		            $('input[name='+field+']').val(rating)
		        },
		        rating: 0,
		        starWidth: "25px",
		        numStars: 5,
		        halfStar: true
		    });
		});
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