from __future__ import unicode_literals
import frappe
from frappe import _
import json
from switsol.switsol.doctype.certificate.certificate import add_attachments
from frappe.desk.form.load import get_attachments
from frappe.utils.pdf import get_pdf

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
		 	certificate = frappe.new_doc("Certificate")
		 	certificate.student = student
			certificate.student_email_id = student_data[student][0]
			certificate.student_name = student_data[student][1]
			certificate.project = kwargs['project_name']
			certificate.item = kwargs['item']
			certificate.item_name = kwargs['item_name']
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

def check_student_for_certificate(project_name,student_name,instructor_name):
	return frappe.db.get_value("Certificate",{"project":project_name,"student":student_name,"instructor":instructor_name},"name")

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
		
@frappe.whitelist()
def check_employee_signature(instructor_name):
	instructor = frappe.get_doc("Instructor",instructor_name)
	employee = frappe.get_doc("Employee",instructor.employee) if instructor and instructor.employee else ""
	error = ""
	# if employee and employee.signature:
	# 	error = "true"
		
	if not employee and not instructor.image:
		error = _("Add signature to Instructor ") + " <b>{0}</b> ".format(instructor.instructor_name) 

	if employee and not employee.signature and not instructor.image:
		error = _("Add signature to either Instructor") + " <b>{0}</b> ".format(instructor.instructor_name) + _("or Employee") + " <b>{0}</b> ".format(employee.name)
	return error	

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
	# data = frappe.db.sql("""select p.name as name,timestamp(pt.start_date, pt.start_time) as start_date,
	# 		timestamp(pt.start_date, pt.end_time) as end_date
	# 		from `tabProject` p, `tabProject Training Details` pt
	# 		where 
	# 		pt.parent = p.name and 
	# 		timestamp(pt.start_date, pt.start_time) between %(start)s 
	# 		and %(end)s or timestamp(pt.start_date, pt.end_time) between %(start)s and %(end)s """,{
	# 		"start":start,
	# 		"end":end
	# 		},as_dict=True)
	data = frappe.db.sql("""select p.name as name,timestamp(pt.start_date, pt.start_time) as start_date,timestamp(pt.start_date, pt.end_time) as end_date from `tabProject` p, `tabProject Training Details` pt where pt.parent = p.name and timestamp(pt.start_date, pt.start_time) between '2017-01-10' and '2017-02-17' or timestamp(pt.start_date, pt.end_time) between '2017-01-10' and '2017-02-17' """,as_dict=True)
	return data

@frappe.whitelist()
def get_room(room=None):
	room = frappe.db.sql("""select p.name as name,
							CONVERT(p.max_number_participant, CHAR(50)) as participant,
							ifnull (p.learning_solution_name,"") as solution_name,
							ifnull (pt.instructor_name,"") as instructor,
							r.room_name as room,
							pt.start_date as date
							from `tabProject` p, `tabProject Training Details` pt, `tabRoom` r
							where pt.parent = p.name and pt.start_date is not null and pt.room != '' and
							pt.room = r.name 
							""",as_dict=1)
	room_data = []
	room_event_data = []
	event_index = 1
	for row in room:
		if row['participant'] == '0':
			row['participant'] = _("No participant added")
		room_description = [
							"1 -"+row['name'],
							"2 -"+row['participant'],
							"3 -"+'('+row['solution_name'] + ')' if row['solution_name'] else "3 -"+_("No Learning Solution"),
							"4 -"+row['instructor'] if row['instructor'] else "4 -"+_("No trainer added")
							]		
		room_data.append({"title":row['room'],"id":row['room']})
		room_event_data.append(make_event_data(room_description,row,event_index)["room_list"])
		event_index = make_event_data(room_description,row,event_index)["event_index"]

	sorted_room_data = []
	if room_event_data:
		for i in room_event_data:
			for j in i:
				sorted_room_data.append(j)			
	return {'room_data':room_data,'room_event_data':sorted_room_data}
 	
def make_event_data(data,row,event_index):
	room_list = []
	for event_id,j in enumerate(data):
		room_list.append({"project":row['name'],
							"id":event_id+event_index,
							"resourceId":row['room'],
							"start":row['date'],
							"title":data[event_id]
						})
	event_index += len(data)
	return {"room_list":room_list,"event_index":event_index}

		
