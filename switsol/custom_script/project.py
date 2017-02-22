from __future__ import unicode_literals
import frappe
from frappe import _
import json
from switsol.switsol.doctype.certificate.certificate import add_attachments
from frappe.desk.form.load import get_attachments


@frappe.whitelist()
def certificate_creation(**kwargs):
	data = json.loads(kwargs.get('args'))
	predefined_text_content = data.get('predefined_text').encode('utf-8')
	predefined_text_value =  frappe.db.get_value("Predefined Text Container",predefined_text_content,"predefined_text_container".encode('utf-8'))
	student_data = json.loads(kwargs['student_data'])
	student_not_have_certficate = []
	instructor_employee_name = frappe.db.get_values("Instructor",{"name":kwargs['instructor']},["instructor_name","employee"],as_dict=True)

	for student_name in student_data.keys():
		name = check_student_for_certificate(kwargs['project_name'],student_name,kwargs['instructor'])
		if name:
			certificate_doc = frappe.get_doc("Certificate",name)
			attachments_list = []
			if get_attachments("Certificate",name):
				for item in get_attachments("Certificate",name):
					attachments_list.append(item['file_name'])		

			if kwargs['print_format'] not in attachments_list:
				attach_pdf_as_certificate(name,kwargs['print_format'])

			if kwargs['is_checked_pdf_send_by_mail'] == "1" and certificate_doc:
				check_student_email_id_and_send_mail(student_data[student_name][0],student_data[student_name][1],kwargs['print_format'],name,predefined_text_content,predefined_text_value)
				frappe.db.set_value("Certificate", certificate_doc.name, "send_by_mail",1)

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
			certificate.instructor = kwargs['instructor']
			certificate.employee = instructor_employee_name[0]['employee']
			certificate.instructor_name = instructor_employee_name[0]['instructor_name']
			certificate.predefined_text_container = predefined_text_content
			certificate.predefined_text_container_value = predefined_text_value
			certificate.make_certificate_from = "From Project"
			certificate.save(ignore_permissions=True)
			attach_pdf_as_certificate(certificate.name,kwargs['print_format'])

			if kwargs['is_checked_pdf_send_by_mail'] == "1":
				check_student_email_id_and_send_mail(student_data[student][0],student_data[student][1],kwargs['print_format'],certificate.name,predefined_text_content,predefined_text_value)
				frappe.db.set_value("Certificate", certificate.name, "send_by_mail",1)

def check_student_email_id_and_send_mail(student_mail_id,name_of_student,print_format,name,predefined_text_content,predefined_text_value):
	cc = []
	orientation = "Landscape" if print_format == 'Microsoft Certificate' or print_format == "Microsoft Zertifikat" else "Portrait"
	
	if print_format in ["Microsoft Certificate", "Microsoft Zertifikat"]:
		print_format ="Microsoft Certificate" 
	elif print_format in ["New Horizons Certificate", "New Horizons Zertifikat"]:
		print_format ="New Horizons Certificate" 

	if student_mail_id:
		recipients  = [student_mail_id]
		cc = [frappe.session.user]
		attachments = [frappe.attach_print("Certificate",name, file_name=print_format, print_format=print_format, orientation=orientation)]
		subject = print_format
		message = predefined_text_value
	else:
		recipients  = [frappe.session.user]
		attachments = [frappe.attach_print("Certificate",name, file_name=print_format, print_format=print_format, orientation=orientation)]
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
		delayed=None,
		communication=None
	)
	except Exception,e:
		frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))

def check_student_for_certificate(project_name,student_name,instructor_name):
	return frappe.db.get_value("Certificate",{"project":project_name,"student":student_name,"instructor":instructor_name},"name")

def attach_pdf_as_certificate(certificate_name,print_format_name):
	if print_format_name == "Microsoft Certificate" or print_format_name == "Microsoft Zertifikat":
		url = "http://"+frappe.request.host+"/print?doctype=Certificate&name="+certificate_name+"&format=Microsoft Certificate&no_letterhead=0"
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
	
	if employee and employee.signature:
		return "true"
	if not employee and not instructor.image:
		return _("Add signature to Instructor ") + " <b>{0}</b> ".format(instructor.instructor_name) 
	if employee and not employee.signature and not instructor.image:
		return _("Add signature to either Instructor ") + " <b>{0}</b> ".format(instructor.instructor_name) + _("or Employee") + " <b>{0}</b> ".format(employee.name)



 	

	
		
