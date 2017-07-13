from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, scrub
from frappe import _
from frappe.email.email_body import get_message_id
import json
import datetime
import frappe.defaults
from frappe.utils import cstr, nowdate, getdate

@frappe.whitelist()
def payment_reminder(customer_name,args,flag,reminder_count,si_name):
	data = json.loads(args) 
	si_doc = frappe.get_doc("Sales Invoice",si_name)
	customer_doc = frappe.get_doc("Customer",customer_name)
	attachments = [frappe.attach_print("Sales Invoice",si_name, file_name=si_name, print_format="Sales Invoice Switsol AG")]
	if flag == 'Reminder':
		subject = _("Reminder")
		try:
			frappe.sendmail(
			recipients=data.get('email_id'),
			expose_recipients="header",
			sender=None,
			reply_to=None,
			subject= data.get('subject'),
			content=None,
			reference_doctype=None,
			reference_name=None,
			attachments=attachments,
			message = data.get('greeting') + "<br><br>"+ data.get('predefined_text'),
			message_id=None,
			unsubscribe_message=None,
			delayed=False,
			communication=None
			)
			add_email_communication(data.get('predefined_text'),data.get('email_id'),customer_doc,si_doc)
			reminder_logs(si_doc,reminder_count)
			return True
		except Exception,e:
			print frappe.get_traceback()
			frappe.throw(_("Mail has not been Sent. Kindly Contact to Administrator"))
	else:
		letter_name = make_new_letter(si_doc,reminder_count,data,data.get('greeting'))
		customer_doc.add_comment("Comment", "{0}.".format(reminder_count) +"&nbsp"+_("Reminder")+"&nbsp"+_("had been sent for Sales Invoice :") 
			+ " " + "<a href='#Form/Sales Invoice/{0}'>{0}</a>".format(si_name))
		reminder_logs(si_doc,reminder_count)
		return letter_name

def add_email_communication(message,email_id,doc,si_doc):
	comm = frappe.get_doc({
		"doctype":"Communication",
		"subject": "Reminder: "+si_doc.name,
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

def reminder_logs(si_doc,reminder_count):
	reminder_count = json.loads(reminder_count)
	if reminder_count == 1:
		status = "1. Zahlungserinnerung"
	elif reminder_count == 2:
		status = "2. Zahlungserinnerung"
	elif reminder_count == 3:
		status = "Betreibungsandrohung"

	si_doc.append("reminder_logs",{
			"date" : nowdate(),
			"reminder_status": status
		})
	si_doc.reminder_count = si_doc.reminder_count + 1
	si_doc.save(ignore_permissions=True)

def make_new_letter(si_doc,reminder_count,data,greeting):
	letter = frappe.new_doc("Letter")
	letter.name = si_doc.customer_name
	letter.customer = si_doc.customer
	letter.customer_name = si_doc.customer_name
	letter.comapany = frappe.defaults.get_defaults().company
	letter.date = nowdate()
	letter.clerk_name = frappe.session.user
	letter.status = "Sent"
	letter.customer_address = si_doc.company_address_name if si_doc.company_name else si_doc.customer_address
	letter.contact_person = si_doc.contact_person
	letter.contact_display = si_doc.contact_display
	letter.address_display = si_doc.company_address if si_doc.company_name else si_doc.address_display
	letter.subject =  data.get('subject')
	letter.contact_greeting = data.get('greeting')
	letter.letter_text = data.get('predefined_text_container')
	letter.body_text = greeting + "<br><br>" + data.get('predefined_text')
	letter.chief_signature = si_doc.chief_signature
	letter.chief_signature_value = frappe.db.get_value("Employee", {"user_id": si_doc.chief_signature}, "signature")
	letter.employee_signature = data.get('signed_by')
	letter.employee_signature_value = frappe.db.get_value("Employee", {"user_id": data.get('signed_by')}, "signature")
	letter.related_doctype = si_doc.doctype
	letter.related_name = si_doc.name
	letter.flags.ignore_permissions = 1
	letter.flags.ignore_mandatory = True
	letter.save()
	letter.submit()
	return letter.name
   