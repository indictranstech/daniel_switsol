import frappe
from frappe import _
from frappe.utils.password import check_password
from datetime import datetime,date
from frappe.model.mapper import get_mapped_doc

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
		contact_person = frappe.db.get_value("Contact",{"mobile_no":contact_no},"name")
		contact_doc = frappe.get_doc("Contact",frappe.db.get_value("Contact",{"mobile_no":contact_no},"name"))
		if contact_doc.customer:
			url = "Form/Customer/{0}".format(contact_doc.customer)			
			customer_doc = frappe.get_doc("Customer",contact_doc.customer)
			customer_doc.call_comming_from = contact_no+"/"+contact_person
			customer_doc.save(ignore_permissions=True)
			set_redirect_url(email,url,flag)

		# if contact_doc.user:
		# 	url = "Form/User/{0}".format(contact_doc.user)
		# 	#customer_doc.call_comming_from = contact_no+"/"+contact_person
		# 	set_redirect_url(email,url,flag)

		if contact_doc.supplier:
			url = "Form/Supplier/{0}".format(contact_doc.supplier)
			supplier_doc = frappe.get_doc("Supplier",contact_doc.supplier)
			supplier_doc.call_comming_from = contact_no+"/"+contact_person
			supplier_doc.save(ignore_permissions=True)
			set_redirect_url(email,url,flag)
			
		if contact_doc.sales_partner:
			sales_partner_doc = frappe.get_doc("Sales Partner",contact_doc.sales_partner)
			sales_partner_doc.call_comming_from = contact_no+"/"+contact_person
			sales_partner_doc.save(ignore_permissions=True)
			url = "Form/Sales Partner/{0}".format(contact_doc.sales_partner)			
			set_redirect_url(email,url,flag)		

	else:
		url = "contact_search-"
		set_redirect_url(email,url,flag)		
		#frappe.request.path.startswith("/api/")


	

# def make_redirect_url(email,customer,contact_no,flag=None):
# 	if frappe.db.exists("Customer",customer):
# 		url = "Form/Customer/{0}".format(customer)
# 		customer_doc = frappe.get_doc("Customer",customer)
# 		contact_list = frappe.db.sql("""select name,customer,mobile_no from `tabContact`
# 			where customer = '{0}' """.format(customer),as_dict=1)

# 		if contact_list and len(contact_list) == 1 and contact_list[0]["mobile_no"] == contact_no:
# 			contact_person = frappe.db.get_value("Contact",{"customer":customer,"mobile_no":contact_no},'name')
# 			customer_doc.call_comming_from = contact_no+"/"+contact_person
# 			set_redirect_url(email,url,flag)
		
# 		if contact_list and len(contact_list) == 1 and contact_list[0]["mobile_no"] != contact_no:
# 			first_name =  "2"+ "-" + frappe.db.get_value("Contact",{"customer":customer},'customer')
# 			contact_person = make_new_contact(customer,contact_no,first_name)
# 			customer_doc.call_comming_from = contact_no+"/"+contact_person
# 			set_redirect_url(email,url,flag)	

# 		if contact_list and len(contact_list) == 2:
# 			mobile_no = []
# 			for row in contact_list:
# 				mobile_no.append(row["mobile_no"])
# 			if contact_no in mobile_no:	
# 				set_redirect_url(email,url,flag)	
# 				contact_person = frappe.db.get_value("Contact",{"customer":customer,"mobile_no":contact_no},'name')
# 				customer_doc.call_comming_from = contact_no+"/"+contact_person
# 			else:
# 				contact_doc = frappe.get_doc("Contact",contact_list[1]["name"])
# 				contact_doc.mobile_no = contact_no
# 				contact_doc.save(ignore_permissions=True)
# 				set_redirect_url(email,url,flag)
# 				contact_person = frappe.db.get_value("Contact",{"customer":customer,"mobile_no":contact_no},'name')
# 				customer_doc.call_comming_from = contact_no+"/"+contact_person

# 		if not contact_list:
# 			contact_person = make_new_contact(customer,contact_no)
# 			customer_doc.call_comming_from = contact_no+"/"+contact_person
			
# 			set_redirect_url(email,url,flag)
#         customer_doc.save(ignore_permissions=True)
# 	if not frappe.db.exists("Customer",customer):
# 		url = "List/Customer"								
# 		set_redirect_url(email,url,flag)

# def make_new_contact(customer,contact_no,first_name=None):
# 	contact = frappe.new_doc("Contact")
# 	contact.mobile_no = contact_no
# 	contact.customer = customer
# 	contact.first_name = first_name if first_name else customer
# 	contact.save(ignore_permissions = True)	
# 	return contact.name



def set_redirect_url(email,url,flag):
	if flag:
		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In',url=url)	
	else:
		frappe.local.login_manager.user = email
		frappe.local.login_manager.post_login()
		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In',url=url)


def redirect_login(desk_user,url):
	# redirect!
	frappe.local.response["type"] = "redirect"
	# the #desktop is added to prevent a facebook redirect bug
	frappe.local.response["location"] = "/desk#{0}".format(url)
	frappe.db.sql("""update `tabSingles` set value = {0} 
		where field = "voip_contact_no" """.format(frappe.local.form_dict["contact_no"]))

# old url

#http://localhost:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&customer=Sangram&contact_no=4555

# new url

#http://5.148.186.248:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=&email=&password=&contact_no=
#http://localhost:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&contact_no=4555

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