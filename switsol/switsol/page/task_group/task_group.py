from __future__ import unicode_literals
import frappe
import json
from frappe import _, msgprint


@frappe.whitelist()
def get_task_details(project):
	data = frappe.db.sql("""select task.subject,task.status,
							task.exp_start_date,task.responsible_user,task.group_name,task.exp_end_date,task.name
							from `tabTask` task,`tabProject` pro
							where task.project = pro.name and pro.name = '{0}' 
							order by task.group_name """.format(project),as_list=1)

	from collections import defaultdict
	d = defaultdict(list)
	for row in data:
		d[row[4]].append(row)

	return dict(d)



@frappe.whitelist()	
def all_data(id):
	data = frappe.db.sql("""select subject,status,group_name,exp_start_date,exp_end_date,responsible_user,name
							from `tabTask` 
							where name = '{0}' """.format(id),as_dict=1)
	return data

# DATE_FORMAT(exp_start_date,'%d.%m.%Y') AS exp_start_date,
# 							DATE_FORMAT(exp_end_date,'%d.%m.%Y') AS exp_end_date



	
