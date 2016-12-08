frappe.pages['feed_back_summary'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Feed Back Summary',
		single_column: true
	});
	wrapper.feed_back_summary = new feed_back_summary(wrapper)
	frappe.breadcrumbs.add("Switsol");
}


feed_back_summary = Class.extend({
	init: function(wrapper) {
		var me = this;
		//this.onload();
		this.wrapper_page = wrapper.page;
		this.page = $(wrapper).find('.layout-main-section');
		this.wrapper = $(wrapper).find('.page-content');
		this.set_fields();
	},
	set_fields:function(){
		var me = this;
		/*me.training_satisfaction = frappe.ui.form.make_control({
			parent: me.page.find(".training_satisfaction"),
			df: {
			fieldtype: "Select",
			options: ["Very satisfied","To some extent satisfied","Rather dissatisfied","Very dissatisfied"],
			label:"Training Satisfaction",
			fieldname: "training_satisfaction",
			placeholder: __("Training Satisfaction")
			},
			render_input: true
		});
		me.training_satisfaction.refresh();*/
		me.get_column_data();
	},
	get_column_data:function(){
		var me =this;
		frappe.call({
			method: "switsol.switsol.page.training_satisfaction.training_satisfaction.get_data",
			/*args: {
				"training_satisfaction":me.training_satisfaction.$input.val(),
			},*/
			callback: function(r) {
				if (r.message){
					console.log(r.message)
					me.data = r.message;
					var __html = frappe.render_template("common_feedback_chart",{"flag":"feed_back_summary"})
					console.log(__html,"__html")
					me.page.html(__html)
					me.set_chart();
				}
			}
		})		
	},
	set_chart: function(){
		var me = this;
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
	        },
      	});
      	console.log(chart1,"chart1")
      	console.log($('#main_goal'),"t_s_charts")
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
	        },
      	});
      	console.log(chart2,"chart2")
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
	        },
      	});
	}
})