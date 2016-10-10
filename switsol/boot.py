from __future__ import unicode_literals
import frappe

def boot_session(bootinfo):
	"""boot session - send website info if guest"""
	import frappe
	bootinfo.contact_no = frappe.db.sql("""select value from 
						`tabSingles` where field = "voip_contact_no" """,as_list=1)[0][0]