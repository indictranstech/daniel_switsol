frappe.ready(function() {
	var seminar_course = $('form[data-web-form="feedback"]').find('select[name="seminar_course"]')
	window.location.href.split("=")[1] ? 
	filter_options_of_seminar([["training_id","=",String(window.location.href.split("=")[1])]],seminar_course)
	:filter_options_of_seminar([["status","=","Open"]],seminar_course)
});

filter_options_of_seminar = function(filter_list,seminar_course){
	console.log(filter_list,seminar_course)
	frappe.call({
		method:"switsol.switsol.web_form.feedback.feedback.get_list",
		args:{
			doctype:"Project",
			filters: filter_list,
			fields: ["name"]
		},	
		callback: function(r) {
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
				var options= "<option value='' selected='selected'>No Project</option>"
				$(seminar_course).empty().append('"'+options+'"')
			}
		}
	});
}