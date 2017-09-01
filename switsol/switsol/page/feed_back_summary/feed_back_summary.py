from __future__ import unicode_literals
import frappe
from frappe import _, msgprint


@frappe.whitelist()
def get_data(seminar_course):
	seminar_course = "where seminar_course = '{0}' ".format(seminar_course) if seminar_course else ""
	# data1 = frappe.db.sql("""select main_goal,how_satisfied_training
	# 						from `tabFeed Back` {0} """.format(seminar_course),as_list=1)
	feedback_data = frappe.db.sql("""select quality_training_room,total_of_leader,
											comprehensan_t_content,advancement_opportunities,
											main_goal,other_please_specify,how_satisfied_training_star as how_satisfied
							from `tabFeedback` {0} """.format(seminar_course),as_dict=1	)
	count =  frappe.db.sql("""select count(seminar_course) as count
							from `tabFeedback` {0} """.format(seminar_course),as_dict=1)

	data_dict = {'quality_training_room':{},
				'total_of_leader':{},
				'comprehensan_t_content':{},
				'advancement_opportunities':{},
				'main_goal':{},
				#'main_goal':{"other_please_specify":0},
				'how_satisfied':{}
				}
	# for i in sum(data1,[]):
	# 	data_dict['main_goal'][i] = sum(data1,[]).count(i)

	if feedback_data:
		for j in feedback_data:
			if j['main_goal'] in data_dict['main_goal'].keys():
				data_dict['main_goal'][j['main_goal']] = data_dict['main_goal'][j['main_goal']] + 1
			else:
				data_dict['main_goal'][j['main_goal']] = 1
			
			if j['other_please_specify']:
				if 'other_please_specify' in data_dict['main_goal'].keys():
					data_dict['main_goal']['other_please_specify'] = data_dict['main_goal']['other_please_specify'] + 1
				else:
					data_dict['main_goal']['other_please_specify'] = 1	

			if j['how_satisfied'] in data_dict['how_satisfied'].keys():
				data_dict['how_satisfied'][j['how_satisfied']] = data_dict['how_satisfied'][j['how_satisfied']] + (float(j['how_satisfied'])/float(j['how_satisfied']))
			else:
				data_dict['how_satisfied'][j['how_satisfied']] = 1
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
		if seminar_course:
			project_count = [data.get('count') for data in count]
			data_dict["project_count"] = project_count
			rating = set_average_rating(data_dict)
			return {"feedback_data":data_dict,"rating":rating}
		else:
			rating = set_average_rating(data_dict)
			return {"feedback_data":data_dict,"rating":rating}
	else:
		return ""
		
def set_average_rating(data_dict):
	average_rating = {}
	summary_data = ['quality_training_room','how_satisfied','total_of_leader','comprehensan_t_content','advancement_opportunities']
	for key, value in data_dict.iteritems():
		if key in summary_data:
			count,average = 0.0,0.0
			for rating,rating_cnt in value.iteritems():
				temp=float(rating)*float(rating_cnt)
				average+=float(temp)
				count+=float(rating_cnt)
			average_rating[key] = round(average/count,2)
	return average_rating
