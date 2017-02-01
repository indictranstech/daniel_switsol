# -*- coding: utf-8 -*-
# Copyright (c) 2015, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Feedback(Document):
	pass
	
# @frappe.whitelist()
# def get_name():
# 	stud_id = frappe.db.get_value("Feedback",{"student_id":"111"},"student_id")
# 	name = frappe.db.sql("""select name from `tabStudent` where name = %s""",(stud_id),as_dict=1)
# 	return name