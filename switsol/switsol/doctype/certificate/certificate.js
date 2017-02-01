// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

cur_frm.add_fetch('student','title','student_name'); 
cur_frm.add_fetch('item','item_name','item_name'); 
cur_frm.add_fetch('instructor','instructor_name','instructor_name'); 

frappe.ui.form.on('Certificate', {
	ms_certificate:function(frm){
		if(frm.doc.ms_certificate && frm.doc.instructor_signature && frm.attachments.get_attachments() && frm.attachments.get_attachments().length > 0){
			//if(frm.attachments.get_attachments() && frm.attachments.get_attachments().length > 0){
				var attachments = []
				$.each(frm.attachments.get_attachments(),function(index,row){
		        	attachments.push(row['file_name'])      
		        })
		        if(attachments.indexOf(String(frm.doc.name)+'.pdf') == -1){
	                cur_frm.cscript.attach_ms_certificate(frm);		        
		        }
		}
		if(frm.doc.ms_certificate && !frm.doc.instructor_signature){
			cur_frm.set_value("ms_certificate",0)
			msgprint("please attach signature")
		}	
		/*if(frm.attachments.get_attachments() && frm.attachments.get_attachments().length == 0){
			if(frm.doc.ms_certificate){
				cur_frm.cscript.attach_ms_certificate(frm);
				frappe.msgprint("MS Certificate Is attached")
			}
		}*/
	},
	refresh:function(frm){
		if(!frm.doc.__islocal){
			frm.set_df_property("ms_certificate","hidden",0);
		}
	}
});


cur_frm.cscript.attach_ms_certificate = function(frm) {
	var url = frappe.urllib.get_base_url()+"/api/method/frappe.utils.print_format.download_pdf?doctype=Certificate&name="+frm.doc.name+"&format=Certificate&no_letterhead=0"
	frappe.call({
		method: "switsol.switsol.doctype.certificate.certificate.add_attachments",
		args: {
			"certificate":frm.doc.name,
			"url":url
		},
		callback: function(r) {
			if (r.message){
				cur_frm.save()
				frappe.msgprint("MS Certificate Is attached")
			}
		}
	})
}

/*cur_frm.cscript.attach_ms_certificate = function(frm) {
		console.log("inside attach_ms_certificate")
	var print_format = "Certificate"
	cur_frm.print_preview.with_old_style({
		format: print_format,
		callback: function(print_html) {
			console.log(print_html)
			if(print_html){
				cur_frm.cscript.send_details_of_print_format(frm,print_html,print_format)
			}
		}
	});
}

cur_frm.cscript.send_details_of_print_format = function(frm,print_html,print_format){
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