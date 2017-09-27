from __future__ import unicode_literals
import frappe
import json
from frappe.model.mapper import get_mapped_doc


@frappe.whitelist()
def make_log(args_dict):
	data = json.loads(args_dict)
	doc = frappe.new_doc("Call Logs")
	doc.phone_number = data.get('phone_number')
	doc.contact_person = data.get('contact_person')
	doc.client = data.get('client')
	doc.start_time = data.get('start_time')
	doc.call_attendant = data.get('call_attendant')
	doc.contact_type = data.get('contact_type')
	doc.ignore_permissions = 1
	doc.save()
	return doc.name