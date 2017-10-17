/// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

cur_frm.add_fetch('student','title','student_name'); 
// cur_frm.add_fetch('item','item_name','item_name'); 
cur_frm.add_fetch('instructor','instructor_name','instructor_name'); 
cur_frm.add_fetch('instructor','employee','employee');
cur_frm.add_fetch('student','student_email_id','student_email_id');
cur_frm.add_fetch('predefined_text_container','predefined_text_container','predefined_text_container_value');
cur_frm.add_fetch("project","training_center","training_center")

frappe.ui.form.on('Certificate', {
	item : function(){
		if(cur_frm.doc.item){
			get_item_template_name()
		}
		else{
			cur_frm.set_value("item_name","")
		}
	}
	
});

get_item_template_name = function(){
	frappe.call({
			method: "switsol.switsol.doctype.certificate.certificate.get_item_template_name",
			args: {
				"item":cur_frm.doc.item
			},
			callback: function(r) {
				if(r.message) {
					cur_frm.set_value("item_name",r.message)
				}
			}
		});
}

/*frappe.ui.form.on('Certificate', {
	validate : function(frm){
		if (frm.doc.__islocal){
			cur_frm.doc.ms_certificate = 1
			refresh_field("ms_certificate")
		}
	},
	refresh:function(frm){
		console.log("inside refresh111")
		if(!frm.doc.__islocal && frm.doc.ms_certificate == 1){
			console.log(cur_frm.doc.__unsaved,"cur_frm.doc.__unsaved")
			console.log("inside refresh inside my cond")
			//save_attachments(frm);
		}
	},
	onload:function(frm){
		console.log("inside onload111")
	}
});



save_attachments = function(frm){
	console.log("save_attachments")
	if(frm.attachments.get_attachments() && frm.attachments.get_attachments().length > 0){
		console.log("inside my function")
		var attachments = []
		$.each(frm.attachments.get_attachments(),function(index,row){
        	attachments.push(row['file_name']) 
        })
        console.log(attachments,"attachments")
        if(attachments.indexOf('New Horizons Certificate.pdf') == -1){
        	console.log("inside attachments empty")
            attach_new_horizon_certificate(frm);		        
        }
	}
	
	if(frm.attachments.get_attachments() && frm.attachments.get_attachments().length == 0){
		console.log("inside empty")
		attach_new_horizon_certificate(frm);
	}

}

attach_new_horizon_certificate = function(frm) {
	console.log("inside frappe")
	var url = frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+frm.doc.name+"&format=New Horizons Certificate&no_letterhead=0"
	frappe.call({
		method: "switsol.switsol.doctype.certificate.certificate.add_attachments",
		args: {
			"certificate":frm.doc.name,
			"url":url,
			"print_format":print_format
		},
		callback: function(r) {
			if (r.message){
				//cur_frm.save()
				frappe.msgprint("New Horizons Certificate Is attached")
			}
		}
	})
}


attach_ms_certificate = function(frm) {
		console.log("inside attach_ms_certificate")
	var print_format = "Certificate"
	cur_frm.print_preview.with_old_style({
		format: print_format,
		callback: function(print_html) {
			console.log(print_html)
			if(print_html){
				send_details_of_print_format(frm,print_html,print_format)
			}
		}
	});
}

send_details_of_print_format = function(frm,print_html,print_format){
	frappe.call({
		method: "switsol.switsol.doctype.certificate.certificate.add_attachments",
		args: {
			"reference_name":frm.doc.name,
			"print_html":print_html,
			"print_format":print_format
		},
		callback: function(r) {
			if (r.message){
				cur_frm.reload_doc()
			}
		}
	})		
}*/