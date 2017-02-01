# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import urllib
# from frappe.utils.file_manager import save_file
# from frappe.utils.pdf import get_pdf

class Certificate(Document):
	pass


@frappe.whitelist()
def add_attachments(certificate,url):
	frappe.errprint(certificate)
	doc = frappe.get_doc("Certificate",certificate)
	file_url = urllib.unquote(url)
	frappe.errprint(file_url)
	f = frappe.get_doc({
		"doctype": "File",
		"file_url": url,
		"file_name": certificate+'.pdf',
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
	# print_html = frappe.render_template("templates/certificate_print_format.html", {
	# 	"doc": doc
	# })
	# attachment = frappe.attach_print("Certificate",reference_name, html=print_html)
	# save_file(attachment['fname'], attachment['fcontent'],"Certificate", reference_name)
	#save_file(certificate,url,doc.doctype, doc.name, decode=True)
	#return "Done"
	