from __future__ import unicode_literals
import frappe
from frappe import _
import json
from switsol.switsol.doctype.certificate.certificate import add_attachments
from frappe.utils import nowdate, cstr, flt, cint, now, getdate
from frappe.desk.form.load import get_attachments
from frappe.utils.pdf import get_pdf
from datetime import datetime, timedelta
import datetime


"""On Project doctype if user select student and hit button either to create MS Certificate or 
	   New Horizons Certificate then Certificate is created automatically in the background 
	   with attachement of print format as certificate 
    """  
@frappe.whitelist()
def certificate_creation(**kwargs):
	 
	name_of_certificate = []
	data = json.loads(kwargs.get('args'))
	email_id_of_cc = []
	if kwargs['print_format'] in ["New Horizons Certificate", "New Horizons Zertifikat"]:
		if data.get('send_by_mail') == 1 and data.get('cc'):
			email_id_of_cc = (data.get('cc').encode('utf-8')).split(",")
		if data.get('send_by_mail') == 1:
			predefined_text_content = data.get('predefined_text').encode('utf-8')
			predefined_text_value =  frappe.db.get_value("Predefined Text Container",predefined_text_content,"predefined_text_container".encode('utf-8'))
	
	student_data = json.loads(kwargs['student_data'])
	student_not_have_certficate = []
	if data.get('instructor'):
		instructor_employee_name = frappe.db.get_values("Instructor",{"name":data.get('instructor')},["instructor_name","employee"],as_dict=True)

	for student_name in student_data.keys():
		name = check_student_for_certificate(kwargs['project_name'],student_name,data.get('instructor'))
		if name:
			certificate_doc = frappe.get_doc("Certificate",name)
			attachments_list = []
			if get_attachments("Certificate",name):
				for item in get_attachments("Certificate",name):
					attachments_list.append(item['file_name'])		

			if kwargs['print_format'] not in attachments_list:
				attach_pdf_as_certificate(name,kwargs['print_format'])

			if data.get('send_by_mail') == 1 and certificate_doc:
				check_student_email_id_and_send_mail(student_data[student_name][0],student_data[student_name][1],kwargs['print_format'],name,predefined_text_content,predefined_text_value,email_id_of_cc)
				frappe.db.set_value("Certificate", certificate_doc.name, "send_by_mail",1)
			name_of_certificate.append(name)
		else:
			student_not_have_certficate.append(student_name)


	if student_not_have_certficate:
		for student in student_not_have_certficate:
			student_doc = frappe.get_doc("Student",student)
			item_doc = frappe.get_doc("Item",kwargs.get('item'))
			item_name = frappe.db.get_value("Item",{"name":item_doc.variant_of},"item_name")
		 	certificate = frappe.new_doc("Certificate")
		 	certificate.student = student
			certificate.student_email_id = student_data[student][0]
			certificate.student_name = student_doc.first_name + " " + student_doc.last_name if student_doc.last_name else student_doc.first_name
			certificate.project = kwargs['project_name']
			certificate.item = kwargs['item']
			certificate.item_name = item_name if item_name else kwargs.get('item_name')
			certificate.training_center = kwargs['training_center']
			certificate.instructor = data.get('instructor')
			if data.get('instructor'):
				certificate.employee = instructor_employee_name[0]['employee']
				certificate.instructor_name = instructor_employee_name[0]['instructor_name']
			if kwargs['print_format'] in ["New Horizons Certificate", "New Horizons Zertifikat"]:
				if data.get('send_by_mail') == 1:
					certificate.predefined_text_container = predefined_text_content
					certificate.predefined_text_container_value = predefined_text_value
			certificate.make_certificate_from = "From Project"
			certificate.save(ignore_permissions=True)

			attach_pdf_as_certificate(certificate.name,kwargs['print_format'])

			if data.get('send_by_mail') == 1:
				check_student_email_id_and_send_mail(student_data[student][0],student_data[student][1],kwargs['print_format'],certificate.name,predefined_text_content,predefined_text_value,email_id_of_cc)
				frappe.db.set_value("Certificate", certificate.name, "send_by_mail",1)
			name_of_certificate.append(certificate.name)
	return name_of_certificate

"""It checks student mail id if exist then mail is send to particular student with attachement of print format """
def check_student_email_id_and_send_mail(student_mail_id,name_of_student,print_format,name,predefined_text_content,predefined_text_value,email_id_of_cc):
	orientation = "Landscape" if print_format == 'Microsoft Certificate' or print_format == "Microsoft Zertifikat" else "Portrait"
	if print_format in ["Microsoft Certificate", "Microsoft Zertifikat"]:
		attach_file_name = print_format
		print_format ="Microsoft Certificate" 
	elif print_format in ["New Horizons Certificate", "New Horizons Zertifikat"]:
		attach_file_name = print_format
		print_format ="New Horizons Certificate" 

	if student_mail_id:
		recipients  = [student_mail_id]
		cc = email_id_of_cc
		attachments = [frappe.attach_print("Certificate",name, file_name=attach_file_name, print_format=print_format, orientation=orientation)]
		subject = print_format
		message = predefined_text_value
	else:
		recipients  = [frappe.session.user]
		cc = email_id_of_cc
		attachments = [frappe.attach_print("Certificate",name, file_name=attach_file_name, print_format=print_format, orientation=orientation)]
		subject = print_format
		message = _("Please Send Certificate to <b>{0}</b> <br>".format(name_of_student)) + predefined_text_value

	try:
		frappe.sendmail(
		recipients=(recipients or []),
		cc=cc,
		expose_recipients="header",
		sender=None,
		reply_to=None,
		subject=_(subject),
		content=None,
		reference_doctype=None,
		reference_name=None,
		attachments=attachments,
		message = message,
		message_id=None,
		unsubscribe_message=None,
		delayed=False,
		communication=None
	)
	except Exception,e:
		frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))

"""To check if certificate is already created for student having project name and instructor"""
def check_student_for_certificate(project_name,student_name,instructor_name):
	return frappe.db.get_value("Certificate",{"project":project_name,"student":student_name,"instructor":instructor_name},"name")

""" When certificate is created print format is attached in attachments for particular certificate creation.
    Method is imported from certificate.py"""
def attach_pdf_as_certificate(certificate_name,print_format_name):
	if print_format_name == "Microsoft Certificate" or print_format_name == "Microsoft Zertifikat":
		url = "http://"+frappe.request.host+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate_name+\
														"&format=Microsoft Certificate&print_format="+print_format_name+"&no_letterhead=0"
		add_attachments(certificate_name,url,print_format_name)
	else:
		if print_format_name == "New Horizons Certificate" or print_format_name == "New Horizons Zertifikat": 
			url = "http://"+frappe.request.host+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate_name+\
														"&format=New Horizons Certificate&no_letterhead=0"
			add_attachments(certificate_name,url,print_format_name)

"""On print format i.e certificate of student instructor or employee signature is needed.
returns message if instructor is not having signature and if instructor and employee both are not having signature"""	
@frappe.whitelist()
def check_employee_signature(instructor_name):
	instructor = frappe.get_doc("Instructor",instructor_name)
	employee = frappe.get_doc("Employee",instructor.employee) if instructor and instructor.employee else ""
	error = ""		
	if not employee and not instructor.signature:
		error = _("Add signature to Instructor ") + " <b>{0}</b> ".format(instructor.instructor_name) 

	if employee and not employee.signature and not instructor.signature:
		error = _("Add signature to either Instructor") + " <b>{0}</b> ".format(instructor.instructor_name) + _("or Employee") + " <b>{0}</b> ".format(employee.name)
	return error	

"""
override_whitelisted_methods is mentioned in hooks.py.
download_pdf method is called in print format URL. 
Here download_pdf method is overrided for making orientation of print format as landscape 
"""
@frappe.whitelist()
def download_pdf(doctype, name, format=None, doc=None,print_format=None):
	if print_format in ["Microsoft Certificate", "Microsoft Zertifikat"]:
		orientation = "Landscape" 
		html = frappe.get_print(doctype, name, format, doc=doc,as_pdf=True,orientation=orientation)
		frappe.local.response.filename = "{name}.pdf".format(name=name.replace(" ", "-").replace("/", "-"))
		frappe.local.response.filecontent = html
		frappe.local.response.type = "download"
	else:
		html = frappe.get_print(doctype, name, format, doc=doc)
		frappe.local.response.filename = "{name}.pdf".format(name=name.replace(" ", "-").replace("/", "-"))
		frappe.local.response.filecontent = get_pdf(html)
		frappe.local.response.type = "download"
	
@frappe.whitelist()
def get_events(start=None,end=None,filters=None):
	data = frappe.db.sql("""select p.name as name,timestamp(pt.start_date, pt.start_time) as start_date,timestamp(pt.start_date, pt.end_time) as end_date from `tabProject` p, `tabProject Training Details` pt where pt.parent = p.name and timestamp(pt.start_date, pt.start_time) between '2017-01-10' and '2017-02-17' or timestamp(pt.start_date, pt.end_time) between '2017-01-10' and '2017-02-17' """,as_dict=True)
	return data

"""Returns room data for showing rooms on left side of calendar and room event data for showing event on calendar.
   
	param: get_args- start and end of week

	if room is alloted on same date with diferent times then data having mininmum time is displayed on event
	for eg:
		In rooms_data query:
		min(pt.start_time) as time
		group by pt.start_date,p.name

	Mapping of rooms from `tabProject` and `tabRoom` then sorting of rooms according 
	to training center from `tabRoom` 
	Sorting Rule:
		1. Rooms with Training Center Glattbrugg 
		2. Rooms with Training Center Aarau 
		3. Rooms with other Training Centers 
		4. Rooms with Training Center Extern
	all_rooms query for dispaying all rooms on calendar
"""
@frappe.whitelist()
def get_room(get_args,room=None):
	data = json.loads(get_args)
	week_start_day = getdate(data.get('start'))
	week_end_day = getdate(data.get('end'))
	rooms_data = frappe.db.sql("""select p.name as name,
							CONVERT(p.max_number_participant, CHAR(50)) as participant,
							ifnull (p.learning_solution_name,"") as solution_name,
							ifnull (pt.training_instructor_name,"") as instructor,
							r.room_name as room,
							r.name as room_id,
							pt.start_date as date,
							min(pt.start_time) as time
							from `tabProject` p, `tabProject Training Details` pt, `tabRoom` r
							where 
							pt.parent = p.name and 
							pt.room = r.name and 
							pt.start_date is not null and 
							pt.room != '' and
							pt.start_date between "{0}" and "{1}"
							group by pt.start_date,p.name
							order by r.room_name
							""".format(week_start_day,week_end_day),as_dict=1)

	
	room_id_list = [data['room_id'].encode('utf-8') for data in rooms_data]
	
	if room_id_list:
		room_ids = ""
		if len(room_id_list) == 1:
			room_ids = "where name = '{0}'".format(room_id_list[0])
		else:
			room_ids = "where name in {0}".format(tuple(room_id_list))

		center_name = frappe.db.sql("""select name as room_id ,training_center as center 
										from `tabRoom` {0}
							""".format(room_ids),as_dict=1)

		center_name = {center['room_id']:center['center'] for center in center_name}

		for row in rooms_data:
			if row['room_id'] in center_name.keys():
				row['center'] = center_name[row['room_id']]
		
		for row_dict in rooms_data:
			if row_dict.get('center') == "Glattbrugg (NH)":
				row_dict['sort_id'] = 1
			elif row_dict.get('center') == "Aarau (NH)":
				row_dict['sort_id'] = 2
			elif row_dict.get('center') == "Extern":
				row_dict['sort_id'] = 4
			else:
				row_dict['sort_id'] = 3
		import operator
		rooms_data.sort(key=operator.itemgetter('sort_id'))

	room_data = []
	room_event_data = []
	event_index = 1

	for event_id,row in enumerate(rooms_data):
		doc = frappe.get_doc("Project",row['name'])
		length = len(doc.project_participant_details)
		room_description = [
							(row['name']) + "**" +
							(str(length)+'/'+row['participant']+' ('+row['solution_name'] + ')' if row['solution_name'] else  _("No Learning Solution")) + "**" +
							(row['instructor'] if row['instructor'] else _("No trainer added"))
							]	
		room_data.append({"title":row['room'],"id":row['room']})
		room_event_data.append([{
							"project":row['name'],
							"id":event_id,
							"resourceId":row['room'],
							"start":row['date'],
							"title":room_description
							}])


 	sorted_room_data = []
	if room_event_data:
		for i in room_event_data:
			for j in i:
				sorted_room_data.append(j)
 
	room_ids = ""
	if room_id_list:
		if len(room_id_list) == 1:
			room_ids = "where name != '{0}'".format(room_id_list[0])
		else:
			room_ids = "where name not in {0}".format(tuple(room_id_list))

	all_rooms = frappe.db.sql("""select name as id,room_name as room from `tabRoom` 
						 {0} order by room_name""".format(room_ids),as_dict=1)
	for row in all_rooms:
			room_data.append({"title":row['room'],"id":row['room']})

	return {'room_data':room_data,'room_event_data':sorted_room_data}
