frappe.pages['contact_search-'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Contact Search',
		single_column: true
	});
	wrapper.contact_search = new render_contact(wrapper)
	frappe.breadcrumbs.add("Switsol");
}

render_contact = Class.extend({
	init: function(wrapper) {
		var me = this;
		//this.onload();
		this.wrapper_page = wrapper.page;
		this.page = $(wrapper).find('.layout-main-section-wrapper');
		this.wrapper = $(wrapper).find('.page-content');
		this.set_fields();
	},
	onload:function(){
		var me =this;
		if (frappe.boot.contact_no){
			console.log("in my cond",$(me.page).find("input[data-fieldname='mobile_no']"))
			$(me.page).find("input[data-fieldname='mobile_no']").val(""+frappe.boot.contact_no+"/"+frappe.datetime.now_datetime())			
		}
	},
	set_fields: function() {
		var me = this;
				//<div class='col-md-3  reference_contact' id='user'></div>\
		html = "<div class='row' style='padding-left: 10px;padding-right: 10px;'>\
				<div class='col-md-4  reference_contact' id='customer'></div>\
  				<div class='col-md-4  reference_contact' id='sales_partner'></div>\
  				<div class='col-md-4  reference_contact' id='supplier'></div>\
  				</div>\
  				<div class='row' style='padding-left: 10px;padding-right: 10px;'>\
  				<div class='col-md-6' id='mobile_no'></div>\
  				<div class='col-md-6'></div>\
  				<div>"
		me.page.html(html)
		me.customer_link = frappe.ui.form.make_control({
			parent: me.page.find("#customer"),
			df: {
			fieldtype: "Link",
			options: "Customer",
			fieldname: "customer",
			placeholder: "Client"
			},
			render_input: true
		});
		me.customer_link.refresh();
		me.sales_partner_link = frappe.ui.form.make_control({
			parent: me.page.find("#sales_partner"),
			df: {
			fieldtype: "Link",
			options: "Sales Partner",
			fieldname: "sales_partner",
			placeholder: "Sales Partner"
			},
			render_input: true
		});
		me.sales_partner_link.refresh();
		me.supplier_link = frappe.ui.form.make_control({
			parent: me.page.find("#supplier"),
			df: {
				fieldtype: "Link",
				fieldname: "supplier",
				options:"Supplier",
				placeholder: "Supplier",
			},
			render_input: true
		});
		me.supplier_link.refresh();
		/*me.user_link = frappe.ui.form.make_control({
			parent: me.page.find("#user"),
			df: {
				fieldtype: "Link",
				fieldname: "user",
				options:"User",
				placeholder: "User"
			},
			render_input: true
		});
		me.user_link.refresh();*/
		me.mobile_no = frappe.ui.form.make_control({
			parent: me.page.find("#mobile_no"),
			df: {
				fieldtype: "Data",
				fieldname: "mobile_no",
				placeholder: "Mobile No"
			},
			render_input: true
		});
		me.mobile_no.refresh();
		me.onload();
		me.show_contacts();
	},
	show_contacts: function(){
		var me = this;
		$(me.page).find(".reference_contact").change(function(){
			me.active = $(this).attr("id")
			me.contact_name = String($(".reference_contact").find('input[data-fieldname='+$(this).attr("id")+']').val())
			$.each($(me.page).find(".reference_contact"),function(i,d){
				if($(d).find("input").attr("data-fieldname") != me.active){
					$(d).find("input").val("")
				}
			})
			frappe.call({
				method: "switsol.switsol.page.contact_search_.contact_search_.get_contacts",
				args: {
					"reference_contact": String($(this).attr("id")),
					"reference_contact_name": String($(".reference_contact").find('input[data-fieldname='+$(this).attr("id")+']').val())
				},
				callback: function(r) {
					if (r.message){
						$(me.page).find(".contacts").empty();
						$(me.page).find(".add_contact").empty();
						__html = frappe.render_template("contact_search",{"data":r.message})
						me.page.append(__html)
						me.add_contact();
						me.update_contact();
					}
					else{
						$(me.page).find(".contacts").empty();
						$(me.page).find(".add_contact").empty();
						html = "<div class='row add_contact'>\
								<div class='col-xs-6'>\
								<button type='button' class='add_contact'>Add Contact</button>\
								</div>\
								<div class='col-xs-6'></div>\
								</div>"
						me.page.append(html)
						me.add_contact();
					}
				}
			});
		})
	},
	add_contact:function(){
		var me =this;
		$(me.page).find(".add_contact").click(function(){
			tn = frappe.model.make_new_doc_and_get_name('Contact');
			locals['Contact'][tn].mobile_no = String($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[0];

			if (String(me.active) == "customer"){
				me.doctype = "Customer"
				locals['Contact'][tn].customer = me.contact_name
			}
			else if (String(me.active) == "supplier"){
				me.doctype = "Supplier"
				locals['Contact'][tn].supplier = me.contact_name
			}
			else if (String(me.active) == "sales_partner"){
				me.doctype = "Sales Partner"
				locals['Contact'][tn].sales_partner = me.contact_name
			}
			/*else if (String(me.active) == "user"){
				me.doctype = "User"
				locals['Contact'][tn].user = me.contact_name
			}*/	
			frappe.route_options = {
				"doctype":me.doctype, 
				"doc_name":me.contact_name,
				"new_contact":"Yes",
				"call_receive_time":String($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[1],
				"contact_type":me.doctype
			};
			frappe.set_route('Form', 'Contact', tn);
		})
	},
	update_contact:function(){
		var me =this;
		$(me.page).find(".update_contact").click(function(){
			if (String(me.active) == "customer"){
				me.doctype = "Customer"
			}
			else if (String(me.active) == "supplier"){
				me.doctype = "Supplier"
			}
			else if (String(me.active) == "sales_partner"){
				me.doctype = "Sales Partner"
			}
			/*else if (String(me.active) == "user"){
				me.doctype = "User"
			}*/
			frappe.route_options = {
				"doctype":me.doctype, 
				"doc_name":me.contact_name,
				"new_contact":"No",
				"mobile_no": String($(me.page).find("input[data-fieldname='mobile_no']").val().split("/")[0]),
				"call_receive_time":String(($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[1]),
				"contact_type":me.doctype
			};
			frappe.set_route('Form', 'Contact',$(this).attr("contact-name"));
		})
	}	
})	