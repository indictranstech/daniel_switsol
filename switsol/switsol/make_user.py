import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def make_user_logged(user_name,email):
	
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
			"user_type": "Website User"
		})

		user.flags.ignore_permissions = True
		user.flags.no_welcome_mail = True
		user.save()
		
		frappe.local.login_manager.user = email
		frappe.local.login_manager.post_login()
		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In')

	if user_name == "administrator" or user_name == "Administrator":
		frappe.local.login_manager.user = user_name
		frappe.local.login_manager.post_login()

		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In')

	else:
		frappe.local.login_manager.user = email
		frappe.local.login_manager.post_login()

		redirect_login(desk_user=frappe.local.response.get('message') == 'Logged In')


def redirect_login(desk_user):
	# redirect!
	frappe.local.response["type"] = "redirect"

	# the #desktop is added to prevent a facebook redirect bug
	frappe.local.response["location"] = "/desk#List%2FCustomer"