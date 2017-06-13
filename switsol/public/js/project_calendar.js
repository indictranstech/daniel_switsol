
frappe.views.calendar["Project"] = {
	field_map: {
		"start": "start_date",
		"end": "end_date",
		"id": "name",
		"title": "name",
		"Room" : "room"
		//"allDay": "allDay"
	},
	filters: [
	{
		"fieldtype": "Button",
		"fieldname": "course_schedule",
		"label": __("Course Schedule"),
		"click": function(){
			frappe.set_route("Calendar","Course Schedule")
		}
	}
],
	get_events_method: "switsol.custom_script_project.project.get_events"
}
