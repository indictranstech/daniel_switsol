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
		//this.onload();
		//this.refresh();
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
		/*me.wrapper_page.set_primary_action(__("Print"),function() { 
			console.log(me.wrapper_page.add_view("printaaaaa"))

		// this.print_preview = new frappe.ui.form.PrintPreview({
		// 		frm: this
		// 	});
		});*/		
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
		frappe.call({
			method: "switsol.switsol.page.feed_back_summary.feed_back_summary.get_data",
			args: {
				"seminar_course":me.seminar_course.$input.val() ? me.seminar_course.$input.val() :"",
			},
			callback: function(r) {
				if (r.message){
					me.data = r.message;
					var __html = frappe.render_template("feed_back_summary",{"data":r.message})
					$(me.page).find(".pie-chart").empty();
					me.page.find(".pie-chart").append(__html)
					me.set_chart();
					project = $(".project").append('&nbsp;'+ me.seminar_course.$input.val())
					if (r.message['project_count']){
						project.append(' / '+'<b>'+__('Number of Reviews')+'</b>'+'&nbsp;'+':'+'&nbsp;'+ r.message['project_count'][0])
					}
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
		console.log(me.data,"inside chart")
		me.color_codes = {
					0.5:'#08285b',
            		1.0:'#8B0000',
            		1.5:'#FF0000',
            		2.0:'#FFA500',
            		2.5:'#A52A2A',
            		3.0:'#EE82EE',
            		3.5:'#800080', 
            		4.0:'#90EE90',
            		4.5:'#008000',
            		5.0:'#0000FF'
        		}
		var chart1 = c3.generate({
	        bindto:'#total_of_leader',
	        data: {
				columns:[
						["0.5", me.data['total_of_leader']['0.5'] ? me.data['total_of_leader']['0.5']:0],
						["1.0", me.data['total_of_leader']['1.0'] ? me.data['total_of_leader']['1.0']:0],
						["1.5", me.data['total_of_leader']['1.5'] ? me.data['total_of_leader']['1.5']:0],
						["2.0",me.data['total_of_leader']['2.0'] ? me.data['total_of_leader']['2.0']:0],
						["2.5", me.data['total_of_leader']['2.5'] ? me.data['total_of_leader']['2.5']:0],
						["3.0",me.data['total_of_leader']['3.0'] ? me.data['total_of_leader']['3.0']:0],
						["3.5", me.data['total_of_leader']['3.5'] ? me.data['total_of_leader']['3.5']:0],
						["4.0",me.data['total_of_leader']['4.0'] ? me.data['total_of_leader']['4.0']:0],
						["4.5", me.data['total_of_leader']['4.5'] ? me.data['total_of_leader']['4.5']:0],
						["5.0",me.data['total_of_leader']['5.0'] ? me.data['total_of_leader']['5.0']:0]
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
						["0.5", me.data['comprehensan_t_content']['0.5'] ? me.data['comprehensan_t_content']['0.5']:0],
						["1.0", me.data['comprehensan_t_content']['1.0'] ? me.data['comprehensan_t_content']['1.0']:0],
						["1.5", me.data['comprehensan_t_content']['1.5'] ? me.data['comprehensan_t_content']['1.5']:0],
						["2.0",me.data['comprehensan_t_content']['2.0'] ? me.data['comprehensan_t_content']['2.0']:0],
						["2.5", me.data['comprehensan_t_content']['2.5'] ? me.data['comprehensan_t_content']['2.5']:0],
						["3.0",me.data['comprehensan_t_content']['3.0'] ? me.data['comprehensan_t_content']['3.0']:0],
						["3.5", me.data['comprehensan_t_content']['3.5'] ? me.data['comprehensan_t_content']['3.5']:0],
						["4.0",me.data['comprehensan_t_content']['4.0'] ? me.data['comprehensan_t_content']['4.0']:0],
						["4.5", me.data['comprehensan_t_content']['4.5'] ? me.data['comprehensan_t_content']['4.5']:0],
						["5.0",me.data['comprehensan_t_content']['5.0'] ? me.data['comprehensan_t_content']['5.0']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart3 = c3.generate({
	        bindto:'#advancement_opportunities',
	        data: {
				columns:[
						["0.5", me.data['advancement_opportunities']['0.5'] ? me.data['advancement_opportunities']['0.5']:0],
						["1.0", me.data['advancement_opportunities']['1.0'] ? me.data['advancement_opportunities']['1.0']:0],
						["1.5", me.data['advancement_opportunities']['1.5'] ? me.data['advancement_opportunities']['1.5']:0],
						["2.0",me.data['advancement_opportunities']['2.0'] ? me.data['advancement_opportunities']['2.0']:0],
						["2.5",me.data['advancement_opportunities']['2.5'] ? me.data['advancement_opportunities']['2.5']:0],
						["3.0",me.data['advancement_opportunities']['3.0'] ? me.data['advancement_opportunities']['3.0']:0],
						["3.5",me.data['advancement_opportunities']['3.5'] ? me.data['advancement_opportunities']['3.5']:0],
						["4.0",me.data['advancement_opportunities']['4.0'] ? me.data['advancement_opportunities']['4.0']:0],
						["4.5",me.data['advancement_opportunities']['4.5'] ? me.data['advancement_opportunities']['4.5']:0],
						["5.0",me.data['advancement_opportunities']['5.0'] ? me.data['advancement_opportunities']['5.0']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart4 = c3.generate({
	        bindto:'#training_satisfaction_chart',
	        data: {
				columns: [
						["0.5", me.data["how_satisfied"]["0.5"] ? me.data["how_satisfied"]["0.5"]: 0],
						["1.0", me.data["how_satisfied"]["1.0"] ? me.data["how_satisfied"]["1.0"]: 0],
						["1.5", me.data["how_satisfied"]["1.5"] ? me.data["how_satisfied"]["1.5"]: 0],
						["2.0", me.data["how_satisfied"]["2.0"] ? me.data["how_satisfied"]["2.0"]:0],
						["2.5", me.data["how_satisfied"]["2.5"] ? me.data["how_satisfied"]["2.5"]: 0],
						["3.0", me.data["how_satisfied"]["3.0"] ? me.data["how_satisfied"]["3.0"]:0],
						["3.5", me.data["how_satisfied"]["3.5"] ? me.data["how_satisfied"]["3.5"]: 0],
						["4.0", me.data["how_satisfied"]["4.0"] ? me.data["how_satisfied"]["4.0"]:0],
						["4.5", me.data["how_satisfied"]["4.5"] ? me.data["how_satisfied"]["4.5"]: 0],
						["5.0", me.data["how_satisfied"]["5.0"] ? me.data["how_satisfied"]["5.0"]:0]

				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart5 = c3.generate({
	        bindto:'#main_goal',
	        data: {
				columns:[
						[__("Solution of a specific problem"), me.data['main_goal']['Solution of a specific problem'] ? me.data['main_goal']['Solution of a specific problem']:0],
						[__("Preparation for the use of a new product or software upgrade"),me.data['main_goal']['Preparation for the use of a new product or software upgrade'] ? me.data['main_goal']['Preparation for the use of a new product or software upgrade']:0],
						[__("Building new skills and new knowledge (not related to new software)"),me.data['main_goal']['Building new skills and new knowledge (not related to new software)'] ? me.data['main_goal']['Building new skills and new knowledge (not related to new software)']:0],
						[__("Preparation for a certification test"),me.data['main_goal']['Preparation for a certification test'] ? me.data['main_goal']['Preparation for a certification test']:0],
						[__("Better understanding of a product before buying new software"),me.data['main_goal']['Better understanding of a product before buying new software'] ? me.data['main_goal']['Better understanding of a product before buying new software']:0],
						[__("Preparing for a career change"),me.data['main_goal']['Preparing for a career change'] ? me.data['main_goal']['Preparing for a career change']:0],
						[__("Other"),me.data['main_goal']['Other'] ? me.data['main_goal']['Other']:0],
				],
				type : 'pie',
	        },
      	});
		var chart6 = c3.generate({
	        bindto:'#quality',
	        data: {
				columns:[
						["0.5", me.data['quality_training_room']['0.5'] ? me.data['quality_training_room']['0.5']:0],
						["1.0", me.data['quality_training_room']['1.0'] ? me.data['quality_training_room']['1.0']:0],
						["1.5", me.data['quality_training_room']['1.5'] ? me.data['quality_training_room']['1.5']:0],
						["2.0",me.data['quality_training_room']['2.0'] ? me.data['quality_training_room']['2.0']:0],
						["2.5", me.data['quality_training_room']['2.5'] ? me.data['quality_training_room']['2.5']:0],
						["3.0",me.data['quality_training_room']['3.0'] ? me.data['quality_training_room']['3.0']:0],
						["3.5", me.data['quality_training_room']['3.5'] ? me.data['quality_training_room']['3.5']:0],
						["4.0",me.data['quality_training_room']['4.0'] ? me.data['quality_training_room']['4.0']:0],
						["4.5", me.data['quality_training_room']['4.5'] ? me.data['quality_training_room']['4.5']:0],
						["5.0",me.data['quality_training_room']['5.0'] ? me.data['quality_training_room']['5.0']:0]
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
	}
})