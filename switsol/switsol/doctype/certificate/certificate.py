# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils.file_manager import save_file
from frappe.utils.pdf import get_pdf

class Certificate(Document):
	pass


@frappe.whitelist()
def add_attachments(reference_name):
	doc = frappe.get_doc("Certificate",reference_name)
	print_html = frappe.render_template("templates/certificate_print_format.html", {
		"doc": doc
	})
	attachment = frappe.attach_print("Certificate",reference_name, html=print_html)
	save_file(attachment['fname'], attachment['fcontent'],"Certificate", reference_name)
	return "Done"
	