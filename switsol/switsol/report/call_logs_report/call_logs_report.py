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
		print "\n\n\n\n\n",filters.get('client_info').split("-")[0]	
		#get_cond(filters)
		result = frappe.db.sql("""
			SELECT
 date(creation),
 phone_number,
 contact_person,
 client, 
 time(start_time),
 time(end_time),
 TIMEDIFF(time(start_time),time(end_time)),
 call_attendant,
 name
FROM
 `tabCall Logs` 
{0}
order by
 name asc""" .format(get_cond(filters)),as_list=1,debug=1)

	return result

def get_cond(filters):
	cond = ""
	if filters.get('client_info').split("-")[0] == "Call Logs":
		cond = "where phone_number = '{0}'".format(filters.get('client_info').split("-")[-1])
	if filters.get('client_info').split("-")[0] == "Customer":
		cond = "where client = '{0}' and contact_type = 'Customer' ".format(filters.get('client_info').split("-")[0])
	if filters.get('client_info').split("-")[0] == "Supplier":
		cond = "where contact_type = '{0}' and contact_type = 'Supplier' ".format(filters.get('client_info').split("-")[0])
	if filters.get('client_info').split("-")[0] == "Sales Partner":
		cond = "where contact_type = '{0}' and contact_type = 'Sales Partner' ".format(filters.get('client_info').split("-")[0])
	if filters.get('client_info').split("-")[0] == "Contact":
		cond = "where phone_number = '{0}' and contact_person = '{1}'".format(filters.get('client_info').split("-")[3],filters.get('client_info').split("-")[1])						
	return cond	
def get_colums():
	columns = [("Date") + ":Date:80"] + [("Phone Number") + ":Data:70"] + \
			  [("Conact Person") + ":Data:150"] + \
			  [("Client") + ":Data:100"] + [("Start Time") + ":Data:200"] + \
			  [("End Time") + ":Data:80"] + [("Call Length") + ":Data:80"] + \
			  [("Agent/Call attendant") + ":Data:90"] + [("call Log Id") + ":Link:80"]
	return columns