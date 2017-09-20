from __future__ import unicode_literals
import frappe
from frappe import _, msgprint
from frappe.utils import cstr, nowdate, getdate, flt


@frappe.whitelist()
def get_data(seminar_course):
	seminar_course = "where seminar_course = '{0}' ".format(seminar_course) if seminar_course else ""
	feedback_data = frappe.db.sql("""select name,quality_training_room,total_of_leader,
											comprehensan_t_content,advancement_opportunities,
											main_goal,other_please_specify,how_satisfied_training,how_satisfied_training_star as how_satisfied
							from `tabFeedback` {0} """.format(seminar_course),as_dict=1)
	count =  frappe.db.sql("""select count(seminar_course) as count
							from `tabFeedback` {0} """.format(seminar_course),as_dict=1)

	data_dict = {'quality_training_room':{},
				'total_of_leader':{},
				'comprehensan_t_content':{},
				'advancement_opportunities':{},
				'main_goal':{},
				'how_satisfied':{}
				}

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
			#patch for existing data on production(how satisfied converted from words to rating)	
			if j['how_satisfied_training'] == 'Very satisfied':
				j['how_satisfied'] = 5
				set_feedback_value(j['name'],j['how_satisfied'])
			elif j['how_satisfied_training'] == 'To some extent satisfied':
				j['how_satisfied'] = 3
				set_feedback_value(j['name'],j['how_satisfied'])
			elif j['how_satisfied_training'] == 'Rather dissatisfied':
				j['how_satisfied'] = 2
				set_feedback_value(j['name'],j['how_satisfied']) 
			elif j['how_satisfied_training'] == 'Very dissatisfied':
				j['how_satisfied'] = 1
				set_feedback_value(j['name'],j['how_satisfied']) 
			#-----------------------------------------------------------------------------------
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
			config = configuration_setting(data_dict.get('how_satisfied'))
			date = frappe.utils.get_datetime(nowdate()).strftime("%d.%m.%Y")
			return {"feedback_data":data_dict,"rating":rating,"config":config,"date":date}
		else:
			rating = set_average_rating(data_dict)
			config = configuration_setting(data_dict.get('how_satisfied'))
			date = frappe.utils.get_datetime(nowdate()).strftime("%d.%m.%Y")
			return {"feedback_data":data_dict,"rating":rating,"config":config,"date":date}
	else:
		return ""

def set_feedback_value(name,value):
	feedback_doc = frappe.get_doc("Feedback",name)
	feedback_doc.how_satisfied_training_star = value
	feedback_doc.how_satisfied_training = ""
	feedback_doc.save()

def set_average_rating(data_dict):
	average_rating = {}
	summary_data = ['quality_training_room','how_satisfied','total_of_leader','comprehensan_t_content','advancement_opportunities']
	for key, value in data_dict.iteritems():
		if key in summary_data:
			count,average = 0.0,0.0
			for rating,rating_cnt in value.iteritems():
				if rating != 0:
					temp=float(rating)*float(rating_cnt)
					average+=float(temp)
					count+=float(rating_cnt)
			average_rating[key] = round(average/count,2)
	return average_rating

def configuration_setting(how_satisfied):
	config_setting = frappe.get_doc("Configuration")
	config_dict = {
		"1":[config_setting.rating_1,how_satisfied.get(1,0)],
		"2":[config_setting.rating_2,how_satisfied.get(2,0)],
		"3":[config_setting.rating_3,how_satisfied.get(3,0)],
		"4":[config_setting.rating_4,how_satisfied.get(4,0)],
		"5":[config_setting.rating_5,how_satisfied.get(5,0)]
	}
	return config_dict
