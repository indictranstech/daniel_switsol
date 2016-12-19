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
	},
	seminar_course_change:function(){
		console.log("seminar_course_change")
		var me =this;
		$(me.page).find(".seminar_course").change(function(){
			console.log("change 11212")
			me.get_column_data();
		})
	},
	/*onload:function(){
		var me = this;
		console.log("inside onload")
		if(!frappe.route_options){
			me.get_column_data();
		}
	},*/
	refresh: function() {
		console.log("refresh")
		var me = this;
		console.log(frappe.route_options,"frappe.route_options")
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
					console.log(r.message,"dddddddddddddddd")
					me.data = r.message;
					var __html = frappe.render_template("feed_back_summary",{"data":r.message})
					$(me.page).find(".pie-chart").empty();
					me.page.find(".pie-chart").append(__html)
					me.set_chart();
				}
			}
		})		
	},
	set_chart: function(){
		var me = this;
		//console.log(me.data['total_of_leader'],"total_of_leader")
		me.color_codes = {
            		1: '#8B0000',
            		2: '#FF0000',
            		3: '#FFA500',
            		4: '#A52A2A',
            		5: '#EE82EE',
            		6: '#800080', 
            		7: '#90EE90',
            		8: '#008000',
            		9: '#0000FF',
        		}
		var chart1 = c3.generate({
	        bindto:'#total_of_leader',
	        data: {
				columns:[
						["1", me.data['total_of_leader']['1'] ? me.data['total_of_leader']['1']:0],
						["2",me.data['total_of_leader']['2'] ? me.data['total_of_leader']['2']:0],
						["3",me.data['total_of_leader']['3'] ? me.data['total_of_leader']['3']:0],
						["4",me.data['total_of_leader']['4'] ? me.data['total_of_leader']['4']:0],
						["5",me.data['total_of_leader']['5'] ? me.data['total_of_leader']['5']:0],
						["6",me.data['total_of_leader']['6'] ? me.data['total_of_leader']['6']:0],
						["7",me.data['total_of_leader']['7'] ? me.data['total_of_leader']['7']:0],
						["8",me.data['total_of_leader']['8'] ? me.data['total_of_leader']['8']:0],
						["9",me.data['total_of_leader']['9'] ? me.data['total_of_leader']['9']:0],
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
						["1", me.data['comprehensan_t_content']['1'] ? me.data['comprehensan_t_content']['1']:0],
						["2",me.data['comprehensan_t_content']['2'] ? me.data['comprehensan_t_content']['2']:0],
						["3",me.data['comprehensan_t_content']['3'] ? me.data['comprehensan_t_content']['3']:0],
						["4",me.data['comprehensan_t_content']['4'] ? me.data['comprehensan_t_content']['4']:0],
						["5",me.data['comprehensan_t_content']['5'] ? me.data['comprehensan_t_content']['5']:0],
						["6",me.data['comprehensan_t_content']['6'] ? me.data['comprehensan_t_content']['6']:0],
						["7",me.data['comprehensan_t_content']['7'] ? me.data['comprehensan_t_content']['7']:0],
						["8",me.data['comprehensan_t_content']['8'] ? me.data['comprehensan_t_content']['8']:0],
						["9",me.data['comprehensan_t_content']['9'] ? me.data['comprehensan_t_content']['9']:0],
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
		var chart2 = c3.generate({
			//bindto:d3.select('#training_satisfaction_charts'),
	        bindto:'#advancement_opportunities',
	        data: {
				columns:[
						["1", me.data['advancement_opportunities']['1'] ? me.data['advancement_opportunities']['1']:0],
						["2",me.data['advancement_opportunities']['2'] ? me.data['advancement_opportunities']['2']:0],
						["3",me.data['advancement_opportunities']['3'] ? me.data['advancement_opportunities']['3']:0],
						["4",me.data['advancement_opportunities']['4'] ? me.data['advancement_opportunities']['4']:0],
						["5",me.data['advancement_opportunities']['5'] ? me.data['advancement_opportunities']['5']:0],
						["6",me.data['advancement_opportunities']['6'] ? me.data['advancement_opportunities']['6']:0],
						["7",me.data['advancement_opportunities']['7'] ? me.data['advancement_opportunities']['7']:0],
						["8",me.data['advancement_opportunities']['8'] ? me.data['advancement_opportunities']['8']:0],
						["9",me.data['advancement_opportunities']['9'] ? me.data['advancement_opportunities']['9']:0],
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
					[__("Very satisfied"), me.data["how_satisfied"]["Very satisfied"] ? me.data["how_satisfied"]["Very satisfied"]: 0],
					[__("To some extent satisfied"), me.data["how_satisfied"]["To some extent satisfied"] ? me.data["how_satisfied"]["To some extent satisfied"]:0],
					[__("Rather dissatisfied"), me.data["how_satisfied"]["Rather dissatisfied"] ? me.data["how_satisfied"]["Rather dissatisfied"]:0],
					[__("Very dissatisfied"), me.data["how_satisfied"]["Very dissatisfied"] ? me.data["how_satisfied"]["Very dissatisfied"]:0]
				],
				type : 'pie',
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
			//bindto:d3.select('#training_satisfaction_charts'),
	        bindto:'#quality',
	        data: {
				columns:[
						["1", me.data['quality_training_room']['1'] ? me.data['quality_training_room']['1']:0],
						["2",me.data['quality_training_room']['2'] ? me.data['quality_training_room']['2']:0],
						["3",me.data['quality_training_room']['3'] ? me.data['quality_training_room']['3']:0],
						["4",me.data['quality_training_room']['4'] ? me.data['quality_training_room']['4']:0],
						["5",me.data['quality_training_room']['5'] ? me.data['quality_training_room']['5']:0],
						["6",me.data['quality_training_room']['6'] ? me.data['quality_training_room']['6']:0],
						["7",me.data['quality_training_room']['7'] ? me.data['quality_training_room']['7']:0],
						["8",me.data['quality_training_room']['8'] ? me.data['quality_training_room']['8']:0],
						["9",me.data['quality_training_room']['9'] ? me.data['quality_training_room']['9']:0],
				],
				type : 'pie',
				colors: me.color_codes,
        		labels: true
	        },
      	});
	}
})