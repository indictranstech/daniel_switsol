# Copyright (c) 2013, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

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
	columns = [("Seminar / Course") + ":Link/Project:200"] + [("Remarks Target") + ":Data:180"] + [("Remarks Room") + ":Data:70"] + \
			  [("Remarks Coach") + ":Data:150"] + \
			  [("Changes Content") + ":Data:100"] + [("Comments Content") + ":Data:100"] + [("Are there other subjects that interest you") + ":Data:100"] + \
			  [("Any comments or suggestions") + ":Data:80"] + [("Other(Main Goal)") + ":Data:80"]
	return columns	