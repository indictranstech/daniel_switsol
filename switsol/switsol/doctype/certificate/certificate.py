# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import urllib
from frappe import _
import datetime
import json
from frappe.desk.form.load import get_attachments
# from frappe.utils.file_manager import save_file
# from frappe.utils.pdf import get_pdf

class Certificate(Document):
	def autoname(self):
		date = frappe.utils.get_datetime(self.start_date).strftime("%d.%m.%Y")
		self.name = self.student_name + " - " + self.item_name + " - " + date
		
	def validate(self):
		if self.make_certificate_from == "From Itself":
			self.ms_certificate = 1

	def after_insert(self):
		if self.ms_certificate:
			if get_attachments(self.doctype,self.name):
				for item in get_attachments(self.doctype,self.name):
					frappe.errprint(item)	
			else:
				url = "http://"+frappe.request.host+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+self.name+\
												"&format=New Horizons Certificate&no_letterhead=0"

				add_attachments(self.name,url,_("New Horizons Certificate"))	


@frappe.whitelist()
def add_attachments(certificate,url,print_format):
	# frappe.errprint(["inside add_aatachments",print_format,url,certificate])
	doc = frappe.get_doc("Certificate",certificate)
	file_url = urllib.unquote(url)
	f = frappe.get_doc({
		"doctype": "File",
		"file_url": url,
		"file_name": print_format,
		"attached_to_doctype": doc.doctype,
		"attached_to_name": doc.name,
		"folder": "Home/Attachments"
	})
	f.flags.ignore_permissions = True
	try:
		f.insert();
		return "True"
	except frappe.DuplicateEntryError:
		return frappe.get_doc("File", f.duplicate_entry)

@frappe.whitelist()
def get_item_template_name(item):
	item_doc = frappe.get_doc("Item",item)
	item_name = frappe.db.get_value("Item",{"name":item_doc.name},"item_name")
	template_item_name = frappe.db.get_value("Item",{"name":item_doc.variant_of},"item_name")

	return template_item_name if template_item_name else item_name


@frappe.whitelist()
def checking_training_center(doc_name):
	certificate = frappe.get_doc("Certificate",doc_name)
	if certificate.training_center:
		certificate.training_center_new = certificate.training_center
		certificate.training_center = ""
		certificate.save(ignore_permissions=True)
		return True



# print_html = frappe.render_template("templates/certificate_print_format.html", {
# 	"doc": doc
# })
# attachment = frappe.attach_print("Certificate",reference_name, html=print_html)
# save_file(attachment['fname'], attachment['fcontent'],"Certificate", reference_name)
#save_file(certificate,url,doc.doctype, doc.name, decode=True)
#return "Done"
