frappe.ui.form.on("Timesheet","refresh",function(frm) {
	if(cur_frm.doc.signature_json){
		var sign = ""
		sign = JSON.parse("[" + cur_frm.doc.signature_json + "]")
		console.log(sign[0])
                $('[data-fieldname="signature"]').show() 
		$('[data-fieldname="signature"]').signature()
                $('[data-fieldname="signature"]').signature({disabled: true});  
		$('[data-fieldname="signature"]').signature("draw", sign[0])
                $('[data-fieldname="signature_svg"]').css("width", "5cm")
        }
        else {
          $('[data-fieldname="signature"]').hide()
        }  
})