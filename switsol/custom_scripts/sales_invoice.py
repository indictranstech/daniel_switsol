from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, scrub
from frappe import _
from frappe.email.email_body import get_message_id
import json

@frappe.whitelist()
def payment_reminder(customer_address,customer_name,args,flag,reminder_count,si_name):
	data = json.loads(args) 
	customer_doc = frappe.get_doc("Customer",customer_name)
	if flag == 'Reminder':
		try:
			frappe.sendmail(
			recipients=data.get('email_id'),
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
			add_email_communication(data.get('predefined_text'),data.get('email_id'),customer_doc,si_name)
			return True
		except Exception,e:
			print frappe.get_traceback()
			frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))
	else:
		customer_doc.add_comment("Comment", _("Reminder")+" "+reminder_count +" "+_("had been sent for Sales Invoice :") 
			+ " " + "<a href='#Form/Sales Invoice/{0}'>{0}</a>".format(si_name))
		return True

def add_email_communication(message,email_id,doc,si_name):
	si_doc = frappe.get_doc("Sales Invoice",si_name)
	comm = frappe.get_doc({
		"doctype":"Communication",
		"subject": "Reminder: "+si_name,
		"content": message,
		"sender": None,
		"recipients": email_id,
		"cc": None,
		"communication_medium": "Email",
		"sent_or_received": "Sent",
		"reference_doctype": si_doc.doctype,
		"reference_name": si_doc.name,
		"message_id":get_message_id().strip(" <>"),
		"customer": doc.name
	})
	comm.insert(ignore_permissions=True)