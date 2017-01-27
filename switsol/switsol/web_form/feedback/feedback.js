frappe.ready(function() {
	var form = $('#page-feedback')
	var seminar_course = $('form[data-web-form="feedback"]').find('select[name="seminar_course"]')
	bind_field = new Fieldevent(form,seminar_course)
	window.location.href.split("=")[1] ? 
	filter_options_of_seminar([["training_id","=",String(window.location.href.split("=")[1])]],seminar_course)
	:filter_options_of_seminar([["status","=","1"]],seminar_course);
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
				filter_options_of_seminar([["name","=",String($(this).val())]],me.seminar_course)			
			}
			else{
				var options= "<option value='' selected='selected'></option>"
				$(me.seminar_course).empty().append('"'+options+'"')
			}	
		})
	}
})


filter_options_of_seminar = function(filter_list,seminar_course){
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
						options += "<option value='"+d['name']+"'"+">"+d['name']+"</option>"
					})
					$(seminar_course).empty().append('"'+options+'"')
				}
				else if(r.message.length == 1){
					var options= "<option value='"+r.message[0]['name']+"'"+"selected='selected' >"+r.message[0]['name']+"</option>"
					$(seminar_course).empty().append('"'+options+'"')	
				}
			}
			else{
				var options= "<option value='' selected='selected'></option>"
				$(seminar_course).empty().append('"'+options+'"')
			}
		}
	});
}