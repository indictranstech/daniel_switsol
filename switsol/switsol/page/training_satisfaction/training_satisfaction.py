from __future__ import unicode_literals
import frappe
from frappe import _, msgprint


@frappe.whitelist()
def get_data():
	data1 = frappe.db.sql("""select main_goal,how_satisfied_training
							from `tabFeed Back` """,as_list=1)
	data2 = frappe.db.sql("""select quality_training_room,total_of_leader,comprehensan_t_content,advancement_opportunities
											from `tabFeed Back` """,as_dict=1)
	data_dict = {'quality_training_room':{},
				'total_of_leader':{},
				'comprehensan_t_content':{},
				'advancement_opportunities':{}
				}
	for i in sum(data1,[]):
		data_dict[i] = sum(data1,[]).count(i)
	for j in data2:
		if j['quality_training_room'] in data_dict['quality_training_room'].keys():
			data_dict['quality_training_room'][j['quality_training_room']] = data_dict['quality_training_room'][j['quality_training_room']] + (float(j['quality_training_room'])/float(j['quality_training_room']))
		else:
			data_dict['quality_training_room'][j['quality_training_room']] = 1			
		if j['total_of_leader'] in data_dict['total_of_leader'].keys():
			data_dict['total_of_leader'][j['total_of_leader']] = data_dict['total_of_leader'][j['total_of_leader']] + (float(j['total_of_leader'])/float(j['total_of_leader']))
		else:
			data_dict['total_of_leader'][j['total_of_leader']] = 1
		if j['comprehensan_t_content'] in data_dict['comprehensan_t_content'].keys():
			data_dict['comprehensan_t_content'][j['comprehensan_t_content']] = data_dict['comprehensan_t_content'][j['comprehensan_t_content']] + (float(j['comprehensan_t_content'])/float(j['comprehensan_t_content']))
		else:
			data_dict['comprehensan_t_content'][j['comprehensan_t_content']] = 1
		if j['advancement_opportunities'] in data_dict['advancement_opportunities'].keys():
			data_dict['advancement_opportunities'][j['advancement_opportunities']] = data_dict['advancement_opportunities'][j['advancement_opportunities']] + (float(j['advancement_opportunities'])/float(j['advancement_opportunities']))
		else:
			data_dict['advancement_opportunities'][j['advancement_opportunities']] = 1
	return data_dict