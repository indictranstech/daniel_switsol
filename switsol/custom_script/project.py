from __future__ import unicode_literals
import frappe
from frappe import _
import json
from switsol.switsol.doctype.certificate.certificate import add_attachments
from frappe.desk.form.load import get_attachments


@frappe.whitelist()
def certificate_creation(**kwargs):
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
				check_student_email_id_and_send_mail(student_data[student_name][0],student_data[student_name][1],kwargs['print_format'],name)
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
			certificate.make_certificate_from = "From Project"
			certificate.save(ignore_permissions=True)
			attach_pdf_as_certificate(certificate.name,kwargs['print_format'])

			# if kwargs['print_format'] == "Microsoft Certificate": 
			# 	attach_pdf_as_certificate(certificate.name,kwargs['print_format'])

			if kwargs['is_checked_pdf_send_by_mail'] == "1":
				check_student_email_id_and_send_mail(student_data[student][0],student_data[student][1],kwargs['print_format'],certificate.name)
				# if kwargs['print_format'] == "New Horizons Certificate":
				# elif kwargs['print_format'] == "Microsoft Certificate":
				# 	check_student_email_id_and_send_mail(student_data[student][0],student_data[student][1],kwargs['print_format'],certificate.name)

def check_student_email_id_and_send_mail(student_mail_id,name_of_student,print_format,name):
	cc = []
	if student_mail_id:
		recipients  = [student_mail_id]
		cc = [frappe.session.user]
		attachments = [frappe.attach_print("Certificate",name, file_name=print_format, print_format=print_format)]
		subject = print_format
		message = _("Please See your Certificate")
	else:
		recipients  = [frappe.session.user]
		attachments = [frappe.attach_print("Certificate",name, file_name=print_format, print_format=print_format)]
		subject = print_format
		message = _("Please Send Certificate to <b>{0}</b>".format(name_of_student))

	frappe.sendmail(
		recipients=(recipients or []),
		cc=cc,
		expose_recipients="header",
		sender=None,
		reply_to=None,
		subject=subject,
		content=None,
		reference_doctype=None,
		reference_name=None,
		attachments=attachments,
		message = message,
		message_id=None,
		unsubscribe_message=None,
		delayed=True,
		communication=None
	)	

def check_student_for_certificate(project_name,student_name,instructor_name):
	return frappe.db.get_value("Certificate",{"project":project_name,"student":student_name,"instructor":instructor_name},"name")

def attach_pdf_as_certificate(certificate_name,print_format_name):
	url = "http://"+frappe.request.host+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate_name+\
												"&format="+print_format_name+"&no_letterhead=0"
	add_attachments(certificate_name,url,print_format_name)
	
@frappe.whitelist()
def check_employee_signature(instructor_name):
	instructor = frappe.get_doc("Instructor",instructor_name)
	employee = frappe.get_doc("Employee",instructor.employee) if instructor and instructor.employee else ""
	if employee and employee.signature:
		return "true"	
	elif employee and not employee.signature:
		return "Add signature For Employee <b>{0}</b> that is link in <b>{1}</b> Instructor".format(employee.name,instructor_name)	
	elif not employee:
		return "Please Add employee In Instructor For <b>{0}</b>".format(instructor_name)				



 	

	
		
	