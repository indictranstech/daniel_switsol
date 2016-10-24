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
		result = frappe.db.sql("""select name,date(creation),phone_number,contact_person,client,contact_type, 
 								time(start_time),time(end_time),TIMEDIFF(time(start_time),time(end_time)),call_attendant,subject
 								FROM `tabCall Logs` {0} order by name asc""" .format(get_cond(filters)),as_list=1,debug=1)

	else:
		result = frappe.db.sql("""select name,date(creation),phone_number,contact_person,client,contact_type, 
 								time(start_time),time(end_time),TIMEDIFF(time(start_time),time(end_time)),call_attendant,subject
 								FROM `tabCall Logs` order by name asc""",as_list=1,debug=1)	
	return result

def get_cond(filters):
	cond = ""
	if filters.get('client_info').split("//")[0] == "Call Logs":
		cond = "where phone_number = '{0}' and client = '{1}'".format(filters.get('client_info').split("//")[-1],filters.get('client_info').split("//")[2])
	if filters.get('client_info').split("//")[0] == "Contact":
		cond = "where phone_number = '{0}' and contact_person = '{1}'".format(filters.get('client_info').split("//")[2],filters.get('client_info').split("//")[1])						
	if filters.get('client_info').split("//")[0] == "Customer":
		cond = "where client = '{0}' and contact_type = 'Customer' ".format(filters.get('client_info').split("//")[1])
	if filters.get('client_info').split("//")[0] == "Supplier":
		cond = "where client = '{0}' and contact_type = 'Supplier' ".format(filters.get('client_info').split("//")[1])
	if filters.get('client_info').split("//")[0] == "Sales Partner":
		cond = "where client = '{0}' and contact_type = 'Sales Partner' ".format(filters.get('client_info').split("//")[1])
	return cond	

def get_colums():
	columns = [("Telefon Protokoll") + ":Link/Call Logs:"] + [("Date") + ":Date:80"] + [("Telefonnummer") + ":Data:70"] + \
			  [("Contact Person") + ":Link/Contact:150"] + \
			  [("Customer") + ":Dynamic Link/"+("Contact Type")+":100"] + [("Contact Type") + ":Data:100"] + [("Start Time") + ":Data:100"] + \
			  [("End Time") + ":Data:80"] + [("Dauer des Anrufs") + ":Data:80"] + \
			  [("Mitarbeiter") + ":Link/User:180"] + [("Subject") + ":Small Text:180"]
	return columns