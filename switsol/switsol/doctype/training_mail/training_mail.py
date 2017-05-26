# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.document import Document
from frappe.email.email_body import get_message_id
from frappe.utils import flt, today, get_url, get_datetime

class TrainingMail(Document):
	pass

@frappe.whitelist()
def send_mail_to_client(project_data,contact_data,predefined_text):
	project_data = json.loads(project_data)
	contact_data = json.loads(contact_data)
	project_bundle = ""
	
	for project in project_data:
		project_id = "http://"+frappe.request.host+"/project_participant?training_id="+project.get("training_id")
		project_bundle += "<a href="+project_id+">"+project.get("project_name")+"</a><br>"
		index = predefined_text.replace("<a href=\"%TRAININGSPLAN\" rel=\"nofollow\" target=\"_blank\">diesem Link</a>.", "<br>"+project_bundle)
		message = index.encode('utf-8').strip()
	for contact in contact_data:	
		msg = send_mail(contact.get("email_id"),json.dumps(message))
		contact_doc = frappe.get_doc("Contact",contact.get("contact_name"))
		add_email_communication(json.dumps(message),contact.get("email_id"),contact_doc)

		if contact_doc.customer:
			customer_doc = frappe.get_doc("Customer",frappe.get_doc("Contact",contact.get("contact_name")).customer)
			add_email_communication(json.dumps(message),contact.get("email_id"),customer_doc)
	return msg

def send_mail(email_id,message):
	try:
		frappe.sendmail(
			recipients=(email_id),
			expose_recipients="header",
			sender=None,
			reply_to=None,
			subject="Training",
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
		"subject": "Training",
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
	
