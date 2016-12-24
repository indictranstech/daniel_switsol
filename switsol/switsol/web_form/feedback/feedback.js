frappe.ready(function() {
	var seminar_course = $('form[data-web-form="feedback"]').find('select[name="seminar_course"]')
	frappe.call({
		method:"frappe.client.get_list",
		args:{
			doctype:"Project",
			filters: [
				["status","=", "Open"]
			],
			fields: ["name"]
		},
		callback: function(r) {
			if (r.message) {
				var options= "<option value='' selected='selected'></option>"
				$.each(r.message,function(i,d){
					options += "<option value='"+d['name']+"'"+">"+d['name']+"</option>"
				})
				$(seminar_course).empty().append('"'+options+'"')
			}
			else{
				var options= "<option value='' selected='selected'>No Open Project</option>"
				$(seminar_course).empty().append('"'+options+'"')
			}
		}
	});
});