from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, scrub
from frappe import _
import json

@frappe.whitelist()
def payment_reminder(customer_address,args):
	email_id = frappe.db.get_value("Address",customer_address,"email_id")
	data = json.loads(args) 
	try:
		frappe.sendmail(
		recipients=(email_id),
		expose_recipients="header",
		sender=None,
		reply_to=None,
		subject="Reminder",
		content=None,
		reference_doctype=None,
		reference_name=None,
		attachments=None,
		message = data.get('predefined_text'),
		message_id=None,
		unsubscribe_message=None,
		delayed=False,
		communication=None
		)
		return True
	except Exception,e:
		frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))