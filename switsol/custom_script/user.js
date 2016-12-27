frappe.ui.form.on("User", "refresh", function(frm) {
	if(!cur_frm.doc.__islocal && cur_frm.doc.email && user == cur_frm.doc.email) {
		cur_frm.add_custom_button(__("SaltKey generieren"),
		function() {
			console.log("hihihi")
			frappe.call({
				method: "switsol.switsol.make_user.get_salt_key",
				args: {
					"user": cur_frm.doc.email
				},
				callback: function(r) {
					if(r.message){
						frappe.msgprint({title:__("Salt Key"), indicator:'red',
							message: __("<b>"+r.message[0]["salt"]+"</b>")})
					}
				}
			})
		})
	}
})