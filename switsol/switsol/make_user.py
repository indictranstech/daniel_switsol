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
		user.add_roles("Accounts User","Purchase Master Manager","Sales Master Manager")
		make_redirect_url(email,contact_no)

	if frappe.session.user and frappe.session.user == email:
		flag = "User already logged in"
		make_redirect_url(email,contact_no,flag)	

	# elif email == check_password(email,password):
	# 	make_redirect_url(email,contact_no)

	elif password == get_salt_key(email)[0]["salt"]:
		make_redirect_url(email,contact_no)	

	else:
		raise frappe.AuthenticationError('Incorrect User or key')	
	 		

def make_redirect_url(email,contact_no,flag=None):
	print contact_no,"contact_no","\n\n\n\n\n"
	if frappe.db.get_value("Contact",{"mobile_no":contact_no},"name") or frappe.db.get_value("Contact",{"phone":contact_no},"name"):
		contact_not_found = "No"
		contact_person_list = frappe.db.sql("""select name,CASE WHEN customer IS NULL AND supplier IS NULL THEN concat("sales_partner","-",sales_partner) 
													WHEN sales_partner IS NULL AND supplier IS NULL THEN concat("customer","-",customer) 
													WHEN customer IS NULL AND sales_partner IS NULL THEN concat("supplier","-",supplier) ELSE "" 
												END as contact_person from `tabContact` where mobile_no = '{0}' or phone = '{0}' """.format(contact_no),as_dict=1)
		if len(contact_person_list) > 1:
			contact_person_name_str = ""
			for e in contact_person_list:
				contact_person_name_str += e["contact_person"]+","
				if e["contact_person"].split("-")[0] == "supplier":
					update_call_comming_from("Supplier",contact_no+"/"+e["name"],e["contact_person"].split("-")[1])
				if e["contact_person"].split("-")[0] == "customer":
					update_call_comming_from("Customer",contact_no+"/"+e["name"],e["contact_person"].split("-")[1])
				if e["contact_person"].split("-")[0] == "sales_partner":
					update_call_comming_from("Sales Partner",contact_no+"/"+e["name"],e["contact_person"].split("-")[1])

			update_tabsingles(contact_person_name_str,"contact_person_list")
			url = "contact_search-"
			set_redirect_url(email,url,contact_not_found,flag)

		if len(contact_person_list) == 1:				
			contact_person = frappe.db.get_value("Contact",{"mobile_no":contact_no},"name") if frappe.db.get_value("Contact",{"mobile_no":contact_no},"name") else frappe.db.get_value("Contact",{"phone":contact_no},"name")
			contact_doc = frappe.get_doc("Contact",frappe.db.get_value("Contact",{"mobile_no":contact_no},"name") if frappe.db.get_value("Contact",{"mobile_no":contact_no},"name") else frappe.db.get_value("Contact",{"phone":contact_no},"name"))
			update_tabsingles("ABCD","contact_person_list")

			if contact_doc.customer:
				url = "Form/Customer/{0}".format(contact_doc.customer)
				update_call_comming_from("Customer",contact_no+"/"+contact_person,contact_doc.customer)			
				set_redirect_url(email,url,contact_not_found,flag)


			if contact_doc.supplier:
				url = "Form/Supplier/{0}".format(contact_doc.supplier)
				update_call_comming_from("Supplier",contact_no+"/"+contact_person,contact_doc.supplier)
				set_redirect_url(email,url,contact_not_found,flag)

				
			if contact_doc.sales_partner:
				url = "Form/Sales Partner/{0}".format(contact_doc.sales_partner)			
				update_call_comming_from("Sales Partner",contact_no+"/"+contact_person,contact_doc.sales_partner)
				set_redirect_url(email,url,contact_not_found,flag)		


	else:
		update_tabsingles("ABCD","contact_person_list")
		url = "contact_search-"
		contact_not_found = "Yes"
		set_redirect_url(email,url,contact_not_found,flag)

def update_tabsingles(value,field):
	frappe.db.sql("""update `tabSingles` set value = '{0}' 
		 	where field = "{1}" """.format(value,field))
	frappe.db.commit()

def update_call_comming_from(table_name,call_comming_from,contact_reference):
	frappe.db.sql("""update `tab{0}` set call_comming_from  = '{1}' \
	 where name =  '{2}'""".format(table_name,call_comming_from,contact_reference))
	frappe.db.commit()

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
		update_tabsingles(frappe.local.form_dict["contact_no"],"voip_contact_no")

@frappe.whitelist()
def get_contact_no_and_contact_person_list():
	return frappe.db.sql("""select value,field from `tabSingles` 
						where doctype = "VOIP Contact" """,as_dict=1)

@frappe.whitelist()
def update_reference_person_after_making_call_logs(reference_person,reference_type):
	if reference_type == "Customer":
		reference_person_doc = frappe.get_doc("Customer",reference_person)
	elif reference_type == "Supplier":
		reference_person_doc = frappe.get_doc("Supplier",reference_person)	
	elif reference_type == "Sales Partner":
		reference_person_doc = frappe.get_doc("Sales Partner",reference_person)	

	if reference_person_doc:
		reference_person_doc.call_comming_from = ""
		reference_person_doc.save(ignore_permissions=True)	


@frappe.whitelist()
def get_salt_key(user):
	return frappe.db.sql("""select name, salt 
							from `__Auth` where doctype="User" 
							and name="{0}" """.format(user),as_dict=1)		
	


# old url

#http://localhost:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&customer=Sangram&contact_no=4555

# new url

#http://5.148.186.248:9090/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=&email=&password=&contact_no=
#http://localhost:9091/api/method/switsol.switsol.make_user.logged_and_redirect?user_name=jitendra&email=jitendra.k@indictranstech.com&password=khatri&contact_no=4555	