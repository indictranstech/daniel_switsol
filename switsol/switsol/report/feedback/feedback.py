# Copyright (c) 2013, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _

def execute(filters=None):
	columns, data = [], []
	columns = get_colums()
	data = get_data(filters)
	return columns, data

def get_data(filters):
	if filters:
		print "\n\n\n\n\n\n","filters",filters
		result = frappe.db.sql("""select seminar_course,remarks_target,remarks_room, 
								remarks_coach,changes_content,comments_contents,subjects_interest,comments_suggestions,other_please_specify
								from `tabFeedback` where seminar_course = "{0}" """ .format(filters.get('project')),as_list=1)
	else:
		result = frappe.db.sql("""select seminar_course,remarks_target,remarks_room, 
								remarks_coach,changes_content,comments_contents,subjects_interest,comments_suggestions,other_please_specify
								from `tabFeedback` """,as_list=1)	
	return result


def get_colums():
	columns = [_("Seminar / Course") + ":Link/Project:200"] + [_("Remarks Target") + ":Data:180"] + [_("Remarks Room") + ":Data:170"] + \
			  [_("Remarks Coach") + ":Data:180"] + \
			  [_("Changes content") + ":Data:180"] + [_("Comments Contents") + ":Data:180"] + [_("Are there other subjects that interest you?") + ":Data:180"] + \
			  [_("Any comments or suggestions?") + ":Data:180"] + [_("Other (please specify)") + ":Data:180"]
	return columns	