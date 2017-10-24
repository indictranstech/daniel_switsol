frappe.pages['feed_back_summary'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Feed Back Summary'),
		single_column: true
	});
	wrapper.feed_back_summary = new feed_back_summary(wrapper)
	frappe.breadcrumbs.add("Switsol");
}


frappe.pages['feed_back_summary'].refresh = function(wrapper) {
	wrapper.feed_back_summary.refresh();
}


feed_back_summary = Class.extend({
	init: function(wrapper) {
		var me = this;
		this.wrapper_page = wrapper.page;
		this.page = $(wrapper).find('.layout-main-section');
		this.wrapper = $(wrapper).find('.page-content');
		this.set_fields();
		if(!frappe.route_options) {
			me.get_column_data();
		}
	},
	set_fields:function(){
		var me = this;
		html = "<div class='row'>\
					<div class='col-xs-3 seminar_course' style='padding-left: 25px;'></div>\
				</div>\
				<div class='row'>\
				<div class='col-xs-12 pie-chart'></div>\
				</div>"
		me.page.html(html)
		me.seminar_course = frappe.ui.form.make_control({
			parent: me.page.find(".seminar_course"),
			df: {
			fieldtype: "Link",
			options: "Project",
			label:__("Seminar / Course"),
			fieldname: "seminar_course",
			placeholder: __("Seminar / Course")
			},
			render_input: true
		});
		me.seminar_course.refresh();
		me.seminar_course_change();	
		me.wrapper_page.set_primary_action(__("Preview"),function() { 
			$('.modal').remove()
			me.open_print_modal()
		});		
	},
	open_print_modal: function() {
		var me = this;
		this.dialog = new frappe.ui.Dialog({
			title: __("Print Preview"),
			fields: [
				{
					"fieldtype": "HTML",
					"fieldname": "graph_print"
				}
			]
		})

		this.dialog.show()
		this.$body = this.dialog.body;
		var val = ""
		me.data.feedback_data.project_count ? val = me.data.feedback_data.project_count[0] : ""
		project = {"pro":me.seminar_course.$input.val(), "val":val}
		$(this.$body).html(frappe.render_template("feedback_print",{"data":me.data,"project":project}))
		$(this.$body).parents(':eq(1)').css({"width":"60%"})
		me.set_print_chart()
		
      	this.dialog.set_primary_action(__("Print"), function(){
      		var html = me.dialog.body.innerHTML;
       		me.print_document(html)
       		me.dialog.hide()
      	})

	},
	print_document: function(html){
		var w = window.open();
	 	var htmlToPrint = 
        `<style type="text/css">
        table th,td {
        	border:1px solid #d1d8dd;
       		padding:0.32em;
       		font-size:13px;
        }
	 	.table {
      	 border-collapse: collapse !important;
     	}
     	.main_goal{
     		padding-top:16px;
     	}
     	@page { size: auto;  margin: 5mm; }
     	.logo{
     		margin-top: -10px !important;
     	}
     	.footer_date{
     		margin-top: 40px !important;
     		font-size: 10px;
     		font-color: #d1d8dd;
     		position: fixed;
    		bottom: 0;
     	}
     	.break-table{
     		padding-top:30px;
     	}
     	.align_table_8{
     		width:80%;
     	}
     	.align_table_4{
     		width:20%
     	}    	
        </style>`;
        htmlToPrint += html;
		w.document.write(htmlToPrint);
		w.document.close();
		setTimeout(function(){
			w.print();
			w.close();
		}, 50)
	},
	seminar_course_change:function(){
		var me =this;
		$(me.page).find(".seminar_course").change(function(){
			me.get_column_data();
		})
	},
	refresh: function() {
		var me = this;
		if (frappe.route_options){
			var value = frappe.route_options['project']
			me.seminar_course.$input.val(value)
			frappe.route_options = null;
			me.get_column_data();
		}
	},	
	get_column_data:function(){
		var me =this;
		var test;
		frappe.call({
			method: "switsol.switsol.page.feed_back_summary.feed_back_summary.get_data",
			args: {
				"seminar_course":me.seminar_course.$input.val() ? me.seminar_course.$input.val() :"",
			},
			callback: function(r) {
				if (r.message){
					me.data = r.message;
					var val = ""
					me.data.feedback_data.project_count ? val = me.data.feedback_data.project_count[0] : ""
					project = {"pro":me.seminar_course.$input.val(), "val":val}
					var __html = frappe.render_template("feed_back_summary",{"data":r.message,"project":project})
					$(me.page).find(".pie-chart").empty();
					me.page.find(".pie-chart").append(__html)
					setTimeout(function(){
						me.set_chart();
					},50)	
				}
				else{
					$(me.page).find(".pie-chart").empty();
					__html = "<h1 class='pie-chart' style='padding-left: 25px;'>No Feedback Record Found</h1>"
					me.page.find(".pie-chart").append(__html)
				}
			}
		})		
	},
	set_chart: function(){
		var me = this;
		me.color_codes = {
					1: '#8b1a1a',
            		2: '#FF0000',
            		3: '#FF6347',
            		4: '#FF7F00',
            		5: '#FFA500',
            		6: '#ffd700', 
            		7: '#7fff00',
            		8: '#3cb44b',
            		9: '#006400'
        		}
		var chart1 = c3.generate({
	        bindto:'#total_of_leader',
	        data: {
				columns:[
						["1", me.data['feedback_data']['total_of_leader']['1'] ? me.data['feedback_data']['total_of_leader']['1']:0],
						["2", me.data['feedback_data']['total_of_leader']['2'] ? me.data['feedback_data']['total_of_leader']['2']:0],
						["3",me.data['feedback_data']['total_of_leader']['3'] ? me.data['feedback_data']['total_of_leader']['3']:0],
						["4", me.data['feedback_data']['total_of_leader']['4'] ? me.data['feedback_data']['total_of_leader']['4']:0],
						["5",me.data['feedback_data']['total_of_leader']['5'] ? me.data['feedback_data']['total_of_leader']['5']:0],
						["6", me.data['feedback_data']['total_of_leader']['6'] ? me.data['feedback_data']['total_of_leader']['6']:0],
						["7",me.data['feedback_data']['total_of_leader']['7'] ? me.data['feedback_data']['total_of_leader']['7']:0],
						["8", me.data['feedback_data']['total_of_leader']['8'] ? me.data['feedback_data']['total_of_leader']['8']:0],
						["9",me.data['feedback_data']['total_of_leader']['9'] ? me.data['feedback_data']['total_of_leader']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart2 = c3.generate({
	        bindto:'#comprehensan_content',
	        data: {
				columns:[
						["1", me.data['feedback_data']['comprehensan_t_content']['1'] ? me.data['feedback_data']['comprehensan_t_content']['1']:0],
						["2", me.data['feedback_data']['comprehensan_t_content']['2'] ? me.data['feedback_data']['comprehensan_t_content']['2']:0],
						["3",me.data['feedback_data']['comprehensan_t_content']['3'] ? me.data['feedback_data']['comprehensan_t_content']['3']:0],
						["4", me.data['feedback_data']['comprehensan_t_content']['4'] ? me.data['feedback_data']['comprehensan_t_content']['4']:0],
						["5",me.data['feedback_data']['comprehensan_t_content']['5'] ? me.data['feedback_data']['comprehensan_t_content']['5']:0],
						["6", me.data['feedback_data']['comprehensan_t_content']['6'] ? me.data['feedback_data']['comprehensan_t_content']['6']:0],
						["7",me.data['feedback_data']['comprehensan_t_content']['7'] ? me.data['feedback_data']['comprehensan_t_content']['7']:0],
						["8", me.data['feedback_data']['comprehensan_t_content']['8'] ? me.data['feedback_data']['comprehensan_t_content']['8']:0],
						["9",me.data['feedback_data']['comprehensan_t_content']['9'] ? me.data['feedback_data']['comprehensan_t_content']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart3 = c3.generate({
	        bindto:'#quality',
	        data: {
				columns:[
						["1", me.data['feedback_data']['quality_training_room']['1'] ? me.data['feedback_data']['quality_training_room']['1']:0],
						["2", me.data['feedback_data']['quality_training_room']['2'] ? me.data['feedback_data']['quality_training_room']['2']:0],
						["3",me.data['feedback_data']['quality_training_room']['3'] ? me.data['feedback_data']['quality_training_room']['3']:0],
						["4", me.data['feedback_data']['quality_training_room']['4'] ? me.data['feedback_data']['quality_training_room']['4']:0],
						["5",me.data['feedback_data']['quality_training_room']['5'] ? me.data['feedback_data']['quality_training_room']['5']:0],
						["6", me.data['feedback_data']['quality_training_room']['6'] ? me.data['feedback_data']['quality_training_room']['6']:0],
						["7",me.data['feedback_data']['quality_training_room']['7'] ? me.data['feedback_data']['quality_training_room']['7']:0],
						["8", me.data['feedback_data']['quality_training_room']['8'] ? me.data['feedback_data']['quality_training_room']['8']:0],
						["9",me.data['feedback_data']['quality_training_room']['9'] ? me.data['feedback_data']['quality_training_room']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
	},
	set_print_chart : function(){
		var me = this;
		var chart1 = c3.generate({
	        bindto: "#c3_graph_leader",
	        size: {
	        	"height": 175,
	        	"width": 250
	        },
	        data: {
				columns:[
						["1", me.data['feedback_data']['total_of_leader']['1'] ? me.data['feedback_data']['total_of_leader']['1']:0],
						["2", me.data['feedback_data']['total_of_leader']['2'] ? me.data['feedback_data']['total_of_leader']['2']:0],
						["3",me.data['feedback_data']['total_of_leader']['3'] ? me.data['feedback_data']['total_of_leader']['3']:0],
						["4", me.data['feedback_data']['total_of_leader']['4'] ? me.data['feedback_data']['total_of_leader']['4']:0],
						["5",me.data['feedback_data']['total_of_leader']['5'] ? me.data['feedback_data']['total_of_leader']['5']:0],
						["6", me.data['feedback_data']['total_of_leader']['6'] ? me.data['feedback_data']['total_of_leader']['6']:0],
						["7",me.data['feedback_data']['total_of_leader']['7'] ? me.data['feedback_data']['total_of_leader']['7']:0],
						["8", me.data['feedback_data']['total_of_leader']['8'] ? me.data['feedback_data']['total_of_leader']['8']:0],
						["9",me.data['feedback_data']['total_of_leader']['9'] ? me.data['feedback_data']['total_of_leader']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});

      	var chart2 = c3.generate({
	        bindto:'#c3_graph_comprehensan',
	        size: {
	        	"height": 175,
	        	"width": 250
	        },
	        data: {
				columns:[
						["1", me.data['feedback_data']['comprehensan_t_content']['1'] ? me.data['feedback_data']['comprehensan_t_content']['1']:0],
						["2", me.data['feedback_data']['comprehensan_t_content']['2'] ? me.data['feedback_data']['comprehensan_t_content']['2']:0],
						["3",me.data['feedback_data']['comprehensan_t_content']['3'] ? me.data['feedback_data']['comprehensan_t_content']['3']:0],
						["4", me.data['feedback_data']['comprehensan_t_content']['4'] ? me.data['feedback_data']['comprehensan_t_content']['4']:0],
						["5",me.data['feedback_data']['comprehensan_t_content']['5'] ? me.data['feedback_data']['comprehensan_t_content']['5']:0],
						["6", me.data['feedback_data']['comprehensan_t_content']['6'] ? me.data['feedback_data']['comprehensan_t_content']['6']:0],
						["7",me.data['feedback_data']['comprehensan_t_content']['7'] ? me.data['feedback_data']['comprehensan_t_content']['7']:0],
						["8", me.data['feedback_data']['comprehensan_t_content']['8'] ? me.data['feedback_data']['comprehensan_t_content']['8']:0],
						["9",me.data['feedback_data']['comprehensan_t_content']['9'] ? me.data['feedback_data']['comprehensan_t_content']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart3 = c3.generate({
	        bindto:'#c3_graph_quality',
	        size: {
	        	"height": 175,
	        	"width": 250
	        },
	        data: {
				columns:[
						["1", me.data['feedback_data']['quality_training_room']['1'] ? me.data['feedback_data']['quality_training_room']['1']:0],
						["2", me.data['feedback_data']['quality_training_room']['2'] ? me.data['feedback_data']['quality_training_room']['2']:0],
						["3",me.data['feedback_data']['quality_training_room']['3'] ? me.data['feedback_data']['quality_training_room']['3']:0],
						["4", me.data['feedback_data']['quality_training_room']['4'] ? me.data['feedback_data']['quality_training_room']['4']:0],
						["5",me.data['feedback_data']['quality_training_room']['5'] ? me.data['feedback_data']['quality_training_room']['5']:0],
						["6", me.data['feedback_data']['quality_training_room']['6'] ? me.data['feedback_data']['quality_training_room']['6']:0],
						["7",me.data['feedback_data']['quality_training_room']['7'] ? me.data['feedback_data']['quality_training_room']['7']:0],
						["8", me.data['feedback_data']['quality_training_room']['8'] ? me.data['feedback_data']['quality_training_room']['8']:0],
						["9",me.data['feedback_data']['quality_training_room']['9'] ? me.data['feedback_data']['quality_training_room']['9']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
	}
})
