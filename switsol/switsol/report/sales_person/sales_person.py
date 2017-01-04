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

def get_data(filters=None):
	result = frappe.db.sql("""select sp.sales_person,so.name,sp.item_code,
									sp.commission_rate,sp.commission,sp.commission*100/sp.commission_rate,sp.item_qty
									from `tabSales Order Sales Person` sp,`tabSales Order` so where sp.parent = so.name """,as_list=1)	
	
	return result


def get_colums():
	columns = [_("Sales Person") + ":Link/Sales Person:200"] + [_("Sales Order") + ":Link/Sales Order:180"] + [_("Item Code") + ":Link/Item:170"] + \
			  [_("Commission Rate %") + ":Float:180"] + \
			  [_("Commission") + ":Float:180"] + [_("Amount") + ":Float:180"] + [_("Qty") + ":Float:180"]
	return columns	
