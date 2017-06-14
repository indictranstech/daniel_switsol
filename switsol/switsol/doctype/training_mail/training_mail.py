# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt
#!/usr/bin/env python


from __future__ import unicode_literals
import frappe
import json
import email.utils
from frappe import _
from frappe.model.document import Document
from frappe.email.email_body import get_message_id
from frappe.utils import flt, today, get_url, get_datetime

class TrainingMail(Document):
	pass	
@frappe.whitelist()
def send_mail_to_client(project_data,contact_data,predefined_text):
	contact_data = json.loads(contact_data)
	project_data = json.loads(project_data)
	project_bundle = ""
	item_details = ""
	
	for project in project_data:
		if project.get("project_name"):
			project_doc = frappe.get_doc("Project",project.get("project_name"))
			item_details = project_doc.item_name +"&nbsp;"+ "(Startdatum:" + str(project_doc.expected_start_date.strftime('%d.%m.%Y')) + "," +"&nbsp;"+ (project_doc.training_center if project_doc.training_center else "") + ")" 
			project_id = "http://"+frappe.request.host+"/project_participant?training_id="+project.get("training_id")
			project_bundle += "<a href="+project_id+">"+project.get("project_name")+"</a>"+"&nbsp;&nbsp;"+item_details + "<br><br>"
			message = predefined_text.replace("<a href=\"%TRAININGSPLAN\" rel=\"nofollow\" target=\"_blank\">diesem Link</a>.", "<br>"+project_bundle)
	for contact in contact_data:	
		msg = send_mail(contact.get("email_id"),message)
		contact_doc = frappe.get_doc("Contact",contact.get("contact_name"))
		add_email_communication(message,contact.get("email_id"),contact_doc)

		if contact_doc.customer:
			customer_doc = frappe.get_doc("Customer",frappe.get_doc("Contact",contact.get("contact_name")).customer)
			add_email_communication(message,contact.get("email_id"),customer_doc)
	return msg

def send_mail(email_id,message):
	email_account = frappe.get_doc("Email Account", "New Horizons (Schweiz)")
	sender = email.utils.formataddr(("New Horizons (Schweiz) AG", email_account.get("email_id")))
	try:
		frappe.sendmail(
			recipients=(email_id or []),
			cc = ["operations@newhorizons.ch"],
			expose_recipients="header",
			sender = sender,
			reply_to=None,
			subject= "Information zu moeglichen Trainings",
			content=None,
			reference_doctype=None,
			reference_name=None,
			attachments=None,
			message = message,
			message_id=None,
			unsubscribe_message=None,
			delayed=False,
			communication=None
		)
		return _("The invitation email has been sent")
	except Exception,e:
		frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))

def add_email_communication(html,email_id,doc):
	comm = frappe.get_doc({
		"doctype":"Communication",
		"subject": "Information zu moeglichen Trainings",
		"content": html,
		"sender": None,
		"recipients": email_id,
		"cc": None,
		"communication_medium": "Email",
		"sent_or_received": "Sent",
		"reference_doctype": doc.doctype,
		"reference_name": doc.name,
		"message_id":get_message_id().strip(" <>"),
		"customer": doc.name if doc.doctype == "Customer" else "",
		"contact_person": doc.name if doc.doctype == "Contact" else ""
	})
	comm.insert(ignore_permissions=True)
