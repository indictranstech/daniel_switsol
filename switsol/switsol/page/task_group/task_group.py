from __future__ import unicode_literals
import frappe
from frappe import _, msgprint


@frappe.whitelist()
def get_task_details(project):
	data = frappe.db.sql("""select task.subject,task.status,
							task.exp_start_date,task.responsible_user,task.group_name,task.exp_end_date
							from `tabTask` task,`tabProject` pro
							where task.project = pro.name and pro.name = '{0}' 
							order by task.group_name """.format(project),as_list=1)

	from collections import defaultdict
	d = defaultdict(list)
	for row in data:
		d[row[4]].append(row)

	return dict(d) 