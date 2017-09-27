frappe.pages['contact_search-'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Contact Search'),
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
		/*if (frappe.boot.contact_no != "1234"){
			console.log("in my cond",$(me.page).find("input[data-fieldname='mobile_no']"))
			$(me.page).find("input[data-fieldname='mobile_no']").val(""+frappe.boot.contact_no+"/"+frappe.datetime.now_datetime())			
		}*/
		frappe.call({
			method: "switsol.switsol.make_user.get_contact_no_and_contact_person_list",
			freeze: true,
			freeze_message: __("Please Wait..."),
			callback: function(r) {
				if(r.message){
					$.each(r.message,function(i,d){
						if(d["field"] == "contact_person_list" && d["value"] != "ABCD"){ 
							$.each(d["value"].split(","),function(i,d){
								if(d.split("-")[0] == "supplier"){
									$(me.page).find("input[data-fieldname='supplier']").val(d.split("-")[1])			
								}
								if(d.split("-")[0] == "sales_partner"){
									$(me.page).find("input[data-fieldname='sales_partner']").val(d.split("-")[1])				
								}
								if(d.split("-")[0] == "customer"){
									$(me.page).find("input[data-fieldname='customer']").val(d.split("-")[1])
								}
							})
							$(me.page).find("input[data-fieldname='mobile_no']").hide();
							$(me.page).find("#message").text("Choose one of contact Person")
						}
						if(d["field"] == "voip_contact_no" && d["value"] != "ABCD"){
							$(me.page).find("input[data-fieldname='mobile_no']").val(""+d["value"] +"/"+frappe.datetime.now_datetime())
						}
					})
				}	
			}
		})
		/*if (frappe.boot.contact_person_list != "ABCD"){
			console.log(frappe.boot.contact_person_list.split(","))
			var contact_person_list = frappe.boot.contact_person_list.split(",")
			$(me.page).find("input[data-fieldname='mobile_no']").hide();
			$(me.page).find("#message").text("Choose one of contact Person")
			$.each(contact_person_list,function(i,d){
				if(d.split("-")[0] == "supplier"){
					$(me.page).find("input[data-fieldname='supplier']").val(d.split("-")[1])			
				}
				if(d.split("-")[0] == "sales_partner"){
					$(me.page).find("input[data-fieldname='sales_partner']").val(d.split("-")[1])				
				}
				if(d.split("-")[0] == "customer"){
					$(me.page).find("input[data-fieldname='customer']").val(d.split("-")[1])
				}
			})
		}*/
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
  				<div class='col-md-4' id='mobile_no'></div>\
  				<div class='col-md-4' id='message'></div>\
  				<div class='col-md-4'></div>\
  				<div class='row' style='padding-left: 10px;padding-right: 10px;'>\
  				<div class='col-md-12 render_contact'></div>\
  				</div>\
  				<div>"
		me.page.html(html)

		me.customer_link = frappe.ui.form.make_control({
			parent: me.page.find("#customer"),
			df: {
			fieldtype: "Link",
			options: "Customer",
			label:"Customer",
			fieldname: "customer",
			placeholder: __("Customer"),
			onchange: () => {
					me.show_contacts("customer");
				}
			},
			render_input: true
		});
		me.customer_link.refresh();
		me.sales_partner_link = frappe.ui.form.make_control({
			parent: me.page.find("#sales_partner"),
			df: {
			fieldtype: "Link",
			options: "Sales Partner",
			label:"Sales Partner",
			fieldname: "sales_partner",
			placeholder: __("Sales Partner"),
			onchange: () => {
					me.show_contacts("sales_partner");
				}
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
				label:"Supplier",
				placeholder: __("Supplier"),
				onchange: () => {
					me.show_contacts("supplier");
				}
			},
			render_input: true
		});
		me.supplier_link.refresh();
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
	},
	show_contacts: function(id){
		var me = this;
		 	me.active = id
			me.contact_name = String($(".reference_contact").find('input[data-fieldname='+ id+']').val())
			$.each($(me.page).find(".reference_contact"),function(i,d){
				if($(d).find("input").attr("data-fieldname") != me.active){
					$(d).find("input").val("")
				}
			})
			frappe.call({
				method: "switsol.switsol.page.contact_search_.contact_search_.get_contacts",
				args: {
					"reference_contact": String(id),
					"reference_contact_name": String($(".reference_contact").find('input[data-fieldname='+id+']').val())
				},
				callback: function(r) {
					if (r.message){
						$(me.page).find('.render_contact').empty();
						__html = frappe.render_template("contact_search",{"data":r.message})
						me.page.find('.render_contact').append(__html)
						me.add_contact();
						me.update_contact();
					}
					else{
						$(me.page).find('.render_contact').empty();
						__html = frappe.render_template("contact_search",{"data":""})
						me.page.find('.render_contact').append(__html)
						me.add_contact();
					}
				}
			});
	},
	add_contact:function(){
		var me =this;
		$(me.page).find(".add_contact").click(function(){
			me.tn = frappe.model.make_new_doc_and_get_name('Contact');
			if(String($(this).attr("number-type")) == "mobile"){
				locals['Contact'][me.tn].mobile_no = String($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[0];
			}
			else if(String($(this).attr("number-type")) == "phone"){
				locals['Contact'][me.tn].phone = String($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[0];		
			}
			if (String(me.active) == "customer"){
				me.doctype = "Customer"
				me.add_child()
			}
			else if (String(me.active) == "supplier"){
				me.doctype = "Supplier"
				me.add_child()
			}
			else if (String(me.active) == "sales_partner"){
				me.doctype = "Sales Partner"
				me.add_child()
			}

			frappe.route_options = {
				"doctype":me.doctype, 
				"doc_name":me.contact_name,
				"new_contact":"Yes",
				"mobile_no": String($(me.page).find("input[data-fieldname='mobile_no']").val().split("/")[0]),
				"call_receive_time":String($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[1],
				"contact_type":me.doctype,
				"call_type":"Incoming"
			};
			frappe.set_route('Form', 'Contact', me.tn);
		})
	},
	add_child:function(){
		var me = this;
		var row = frappe.model.add_child(locals['Contact'][me.tn], "Dynamic Link", "links");
		row.link_doctype = me.doctype
		row.link_name = me.contact_name
		refresh_field("links")
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
			frappe.route_options = {
				"doctype":me.doctype, 
				"doc_name":me.contact_name,
				"new_contact":"No",
				"mobile_no": String($(me.page).find("input[data-fieldname='mobile_no']").val().split("/")[0]),
				"mobile_or_phone":String($(this).attr("number-type")),
				"call_receive_time":String(($(me.page).find("input[data-fieldname='mobile_no']").val()).split("/")[1]),
				"contact_type":me.doctype,
				"call_type":"Incoming"
			};
			frappe.set_route('Form', 'Contact',$(this).attr("contact-name"));
		})
	}	
})	