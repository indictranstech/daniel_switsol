# Copyright (c) 2013, Switsol and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
	columns, data = [], []
	columns = get_colums(filters)
	data = get_data(filters)
	return columns, data

def get_data(filters=None):
	date_field = "transaction_date" if filters["doc_type"] == "Sales Order" else "posting_date"
	paid_date = ",'paid_date'" if filters["doc_type"] == "Sales Invoice" else ""
	if filters:
		result = frappe.db.sql("""select dt.name,dt.customer,dt.{0} {1},sp.item_code,sp.item_qty,sp.sales_person,
									sp.commission_rate,sp.commission,sp.commission*100/sp.commission_rate
									from `tabSales Order Sales Person` sp,`tab{2}` dt where sp.parent = dt.name and dt.docstatus = 1 {3}
									""".format(date_field,paid_date,filters.get("doc_type"),get_conditions(filters,date_field)), as_list=1)

		if filters.get("doc_type") == "Sales Invoice" and result:
			for index,si in enumerate(result):
				pe_posting_date = frappe.db.sql("""select pe.posting_date
																from `tabPayment Entry` pe,`tabPayment Entry Reference` per 
																	where per.reference_doctype = "Sales Invoice" 
																		and per.reference_name = '{0}' and per.parent = pe.name """.format(si[0]),as_list=1)
				result[index][3] = pe_posting_date[0][0] if pe_posting_date else ""
	return result


def get_conditions(filters,date_field):
	conditions = ""
	if filters.get("from_date"):
		conditions = "and dt.{0} >= {1} ".format(date_field, filters.get("from_date"))

	elif filters.get("to_date"):
		conditions = "and dt.{0} <= {1} ".format(date_field, filters.get("to_date"))

	if filters.get("to_date") and filters.get("from_date"):
		conditions = "and dt.{0} BETWEEN '{1}' AND '{2}' ".format(date_field, filters.get("from_date"),filters.get("to_date"))

	fields = []
	fields.append(filters.get("customer") if filters.get("customer") else "None")
	fields.append(filters.get("sales_person") if filters.get("sales_person") else "None")
	fields.append(filters.get("item_code") if filters.get("item_code") else "None")

	for index,field in enumerate(fields):
		if field != "None" and index == 0:
			conditions += " and customer = '{0}' ".format(field)
		if field != "None" and index == 1:
			conditions += " and sales_person = '{0}' ".format(field)
		if field != "None" and index == 2:
			conditions += " and item_code = '{0}' ".format(field)		
		
	return conditions		


def get_colums(filters):
	columns = [filters["doc_type"] + ":Link/" + filters["doc_type"] + ":140",
				_("Customer") + ":Link/Customer:140",
				_("Posting Date") + ":Date:100",
				_("Item Code") + ":Link/Item:170",
				_("Qty") + ":Float:180",
				_("Sales Person") + ":Link/Sales Person:200",
				_("Commission Rate %") + ":Float:180",
				_("Commission") + ":Float:180",
				_("Amount") + ":Float:180",
				]
	if filters["doc_type"] == "Sales Invoice":
		columns.insert(3,_("Paid Date") + ":Date:100")
	return columns	
