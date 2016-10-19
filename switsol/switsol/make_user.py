import frappe
from frappe import _
from frappe.utils.password import check_password
from datetime import datetime,date
from frappe.model.mapper import get_mapped_doc
#from switsol.switsol.boot import boot_session

@frappe.whitelist(allow_guest=True)
def logged_and_redirect(user_name,password,email,contact_no):
	
	save = False

	if not frappe.db.exists("User", email):
		# is signup disabled?
		if frappe.utils.cint(frappe.db.get_single_value("Website Settings", "disable_signup")):
			raise SignupDisabledError

		save = True
		user = frappe.new_doc("User")

		user.update({
			"doctype":"User",
			"first_name": user_name,
			"email": email,
			"enabled": 1,
			"new_password": password,
			"user_type": "System User"
		})

		user.flags.ignore_permissions = True
		user.flags.no_welcome_mail = True
		user.save()
		user.add_roles("Accounts User")
		make_redirect_url(email,contact_no)

	if frappe.session.user and frappe.session.user == email:
		flag = "User already logged in"
		make_redirect_url(email,contact_no,flag)	

	elif email == check_password(email,password):
		make_redirect_url(email,contact_no)
	 		
	# if user_name == "administrator" or user_name == "Administrator":
	# 	make_redirect_url(email,customer,contact_no)


def make_redirect_url(email,contact_no,flag=None):
	if frappe.db.get_value("Contact",{"mobile_no":contact_no},"name"):
		contact_not_found = "No"
		contact_person_list = frappe.db.sql("""select name,CASE WHEN customer IS NULL AND supplier IS NULL THEN concat("sales_partner","-",sales_partner) 
													WHEN sales_partner IS NULL AND supplier IS NULL THEN concat("customer","-",customer) 
													WHEN customer IS NULL AND sales_partner IS NULL THEN concat("supplier","-",supplier) ELSE "" 
												END as contact_person from `tabContact` where mobile_no = '{0}'""".format(contact_no),as_dict=1)
		if len(contact_person_list) > 1:
			contact_person_name_str = ""
			for e in contact_person_list:
				contact_person_name_str += e["contact_person"]+","
				if e["contact_person"].split("-")[0] == "supplier":
					frappe.db.sql("""update `tabSupplier` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+e["name"],e["contact_person"].split("-")[1]))		
				if e["contact_person"].split("-")[0] == "customer":
					frappe.db.sql("""update `tabCustomer` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+e["name"],e["contact_person"].split("-")[1]))
				if e["contact_person"].split("-")[0] == "sales_partner":
					frappe.db.sql("""update `tabSales Partner` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+e["name"],e["contact_person"].split("-")[1]))
			frappe.db.sql("""update `tabSingles` set value = '{0}' 
			where field = "contact_person_list" """.format(contact_person_name_str))			
			url = "contact_search-"
			set_redirect_url(email,url,contact_not_found,flag)

		if len(contact_person_list) == 1:				
			contact_person = frappe.db.get_value("Contact",{"mobile_no":contact_no},"name")
			contact_doc = frappe.get_doc("Contact",frappe.db.get_value("Contact",{"mobile_no":contact_no},"name"))
			frappe.db.sql("""update `tabSingles` set value = 'ABCD' 
			where field = "contact_person_list" """)
			if contact_doc.customer:
				url = "Form/Customer/{0}".format(contact_doc.customer)			
				frappe.db.sql("""update `tabCustomer` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+contact_person,contact_doc.customer))
				# customer_doc = frappe.get_doc("Customer",contact_doc.customer)
				# customer_doc.call_comming_from = contact_no+"/"+contact_person
				# customer_doc.save(ignore_permissions=True)
				set_redirect_url(email,url,contact_not_found,flag)

			if contact_doc.supplier:
				url = "Form/Supplier/{0}".format(contact_doc.supplier)
				frappe.db.sql("""update `tabSupplier` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+contact_person,contact_doc.supplier))
				# supplier_doc = frappe.get_doc("Supplier",contact_doc.supplier)
				# supplier_doc.call_comming_from = contact_no+"/"+contact_person
				# supplier_doc.save(ignore_permissions=True)
				set_redirect_url(email,url,contact_not_found,flag)
				
			if contact_doc.sales_partner:
				url = "Form/Sales Partner/{0}".format(contact_doc.sales_partner)			
				frappe.db.sql("""update `tabSales Partner` set call_comming_from  = '{0}' where name =  '{1}'""".format(contact_no+"/"+contact_person,contact_doc.sales_partner))
				# sales_partner_doc = frappe.get_doc("Sales Partner",contact_doc.sales_partner)
				# sales_partner_doc.call_comming_from = contact_no+"/"+contact_person
				# sales_partner_doc.save(ignore_permissions=True)
				set_redirect_url(email,url,contact_not_found,flag)		

	else:
		url = "contact_search-"
		contact_not_found = "Yes"
		set_redirect_url(email,url,contact_not_found,flag)


def set_redirect_url(email,url,contact_not_found,flag):
	if flag:
		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In',url=url,contact_not_found=contact_not_found)	
	else:
		frappe.local.login_manager.user = email
		frappe.local.login_manager.post_login()
		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In',url=url,contact_not_found=contact_not_found)


def redirect_login(desk_user,url,contact_not_found):
	# redirect!
	frappe.local.response["type"] = "redirect"
	# the #desktop is added to prevent a facebook redirect bug
	frappe.local.response["location"] = "/desk#{0}".format(url)
	if contact_not_found == "Yes":
		frappe.db.sql("""update `tabSingles` set value = {0} 
			where field = "voip_contact_no" """.format(frappe.local.form_dict["contact_no"]))
		frappe.db.commit()
# old url

#http://localhost:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&customer=Sangram&contact_no=4555

# new url

#http://5.148.186.248:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=&email=&password=&contact_no=
#http://localhost:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&contact_no=4555




@frappe.whitelist()
def get_contact_no_and_contact_person_list():
	return frappe.db.sql("""select value,field from `tabSingles` 
						where doctype = "VOIP Contact" """,as_dict=1)

@frappe.whitelist()
def get_call_logs_from_customer(source_name, target_doc=None):
	customer = frappe.get_doc("Customer",source_name)
	target_doc = get_mapped_doc("Customer", source_name,
		{
			"Customer": {
				"doctype": "Call Logs",
			},
		}, target_doc)

	target_doc.client = str(customer.name)
	target_doc.phone_number = str(customer.call_comming_from).split("/")[0]
	target_doc.contact_person = str(customer.call_comming_from).split("/")[1]
	target_doc.contact_type = "Customer"
	target_doc.start_time = str(datetime.now()).split(".")[0]
	target_doc.call_attendant = frappe.session.user

	return target_doc

@frappe.whitelist()
def get_call_logs_from_supplier(source_name, target_doc=None):
	supplier = frappe.get_doc("Supplier",source_name)
	target_doc = get_mapped_doc("Supplier", source_name,
		{
			"Supplier": {
				"doctype": "Call Logs",
			},
		}, target_doc)

	target_doc.client = str(supplier.name)
	target_doc.phone_number = str(supplier.call_comming_from).split("/")[0]
	target_doc.contact_person = str(supplier.call_comming_from).split("/")[1]
	target_doc.contact_type = "Supplier"	
	target_doc.start_time = datetime.now()
	target_doc.call_attendant = frappe.session.user	
	return target_doc	

@frappe.whitelist()
def get_call_logs_from_sales_partner(source_name, target_doc=None):
	sales_partner = frappe.get_doc("Sales Partner",source_name)
	target_doc = get_mapped_doc("Sales Partner", source_name,
		{
			"Sales Partner": {
				"doctype": "Call Logs",
			},
		}, target_doc)

	target_doc.client = str(sales_partner.name)
	target_doc.phone_number = str(sales_partner.call_comming_from).split("/")[0]
	target_doc.contact_person = str(sales_partner.call_comming_from).split("/")[1]
	target_doc.contact_type = "Sales Partner"
	target_doc.start_time = datetime.now()
	target_doc.call_attendant = frappe.session.user	
	return target_doc