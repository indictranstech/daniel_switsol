# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe.model.document import Document

class TrainingMail(Document):
	pass

@frappe.whitelist()
def send_mail_to_client(project_data,contact_data,predefined_text):
	project_data = json.loads(project_data)
	contact_data = json.loads(contact_data)
	project_bundle = []

	for project in project_data:
		project_bundle.append("http://"+frappe.request.host+"/project_participant?training_id="+project.get("training_id"))

	for contact in contact_data:
		html = frappe.render_template("switsol/templates/training_mail.html",{
										"first_name":contact.get("first_name"),
										"salutation":contact.get("salutation"),
										"project_link":project_bundle}) + predefined_text
		send_mail(contact.get("email_id"),html)

def send_mail(email_id,html):
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
		message = html,
		message_id=None,
		unsubscribe_message=None,
		delayed=False,
		communication=None
)