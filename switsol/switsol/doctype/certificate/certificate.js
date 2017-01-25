// Copyright (c) 2016, Switsol and contributors
// For license information, please see license.txt

cur_frm.add_fetch('student','title','student_name'); 
cur_frm.add_fetch('item','item_name','item_name'); 
cur_frm.add_fetch('instructor','instructor_name','instructor_name'); 

frappe.ui.form.on('Certificate', {
	validate:function(frm){
		if(frm.doc.ms_certificate){
			if(frm.attachments.get_attachments() && frm.attachments.get_attachments().length > 0){
				$.each(frm.attachments.get_attachments(),function(index,value){
					if(value['file_name'] != String(frm.doc.name)+'.pdf'){
						cur_frm.cscript.attach_ms_certificate(frm);
					}
					else{
						frappe.msgprint("Certificate Is already attached")
					}
				})
			}
			else{
				if(frm.doc.ms_certificate){
					cur_frm.cscript.attach_ms_certificate(frm);
				}
			}
		}	
	},
	refresh:function(frm){
		if(!frm.doc.__islocal){
			frm.set_df_property("ms_certificate","hidden",0);
		}
	}
});


cur_frm.cscript.attach_ms_certificate = function(frm) {
	frappe.call({
		method: "switsol.switsol.doctype.certificate.certificate.add_attachments",
		args: {
			"reference_name":frm.doc.name
		},
		callback: function(r) {
			if (r.message){
				cur_frm.reload_doc()
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