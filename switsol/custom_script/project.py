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
			certificate_doc = frappe.get_doc("Certificate",check_student_for_certificate(kwargs['project_name'],student_name,kwargs['instructor']))
			if kwargs['print_format'] == "Microsoft Certificate":
				if get_attachments("Certificate",name):
					for item in get_attachments("Certificate",name):
						if item['file_name'] == "Microsoft Certificate":
							pass
						else:
							attach_pdf_as_certificate(name,"Microsoft Certificate")
			if kwargs['is_checked_pdf_send_by_mail'] == "1" and certificate_doc:
				send_certificate_pdf_to_student(certificate_doc.name,student_data[student_name][0],kwargs['print_format'])	
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
			certificate.save(ignore_permissions=True)

			if kwargs['print_format'] == "Microsoft Certificate": 
				attach_pdf_as_certificate(certificate.name,kwargs['print_format'])

			if kwargs['is_checked_pdf_send_by_mail'] == "1":
				if kwargs['print_format'] == "New Horizons Certificate":
					check_student_email_id(student_data[student][0],student_data[student][1],kwargs['print_format'])
					send_certificate_pdf_to_student(certificate.name,certificate.student_email_id,kwargs['print_format'])
				elif kwargs['print_format'] == "Microsoft Certificate":
					print_format = "Microsoft Certificate"	
					check_student_email_id(student_data[student][0],student_data[student][1],print_format)			
					send_certificate_pdf_to_student(certificate.name,certificate.student_email_id,print_format)

def check_student_email_id(mail_id,name_of_student,print_format):
	if mail_id == "":
		frappe.sendmail(recipients=[frappe.session.user],sender=None, subject=print_format,
			message=_("Please Send Mail manually to Student <b>{0}</b>".format(name_of_student)))



def check_student_for_certificate(project_name,student_name,instructor_name):
	return frappe.db.get_value("Certificate",{"project":project_name,"student":student_name,"instructor":instructor_name},"name")

def send_certificate_pdf_to_student(name,student_email_id,print_format):
	frappe.sendmail(recipients=student_email_id, cc=[frappe.session.user],sender=None, subject=print_format,
			message="Please See your Certificate", attachments=[frappe.attach_print("Certificate",
			name, file_name=print_format, print_format=print_format)])

def attach_pdf_as_certificate(certificate_name,print_format_name):
	url = "http://localhost:8000/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+certificate_name+\
												"&format=Microsoft Certificate&no_letterhead=0"
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



 	

	
		
	