frappe.pages['training_satisfaction'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Feed Back Training Satisfaction',
		single_column: true
	});
	wrapper.training_satisfaction = new training_satisfaction(wrapper)
	frappe.breadcrumbs.add("Switsol");
}

training_satisfaction = Class.extend({
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
					var __html = frappe.render_template("common_feedback_chart",{"flag":""})
					me.page.html(__html)
					me.set_chart();
				}
			}
		})		
	},
	set_chart: function(){
		var me = this;
		var chart1 = c3.generate({
	        bindto:'#training_satisfaction_chart',
	        data: {
				columns: [
					["Very satisfied", me.data["Very satisfied"] ? me.data["Very satisfied"]: 0],
					["To some extent satisfied", me.data["To some extent satisfied"] ? me.data["To some extent satisfied"]:0],
					["Rather dissatisfied", me.data["Rather dissatisfied"] ? me.data["Rather dissatisfied"]:0],
					["Very dissatisfied", me.data["Very dissatisfied"] ? me.data["Very dissatisfied"]:0]
				],
				type : 'pie',
	        },
      	});
      	console.log(chart1,"chart1")
      	console.log($('#main_goal'),"t_s_charts")
		var chart2 = c3.generate({
	        bindto:'#main_goal',
	        data: {
				columns:[
						["Solution of a specific problem", me.data['Solution of a specific problem'] ? me.data['Solution of a specific problem']:0],
						["Preparation for the use of a new product or software upgrade",me.data['Preparation for the use of a new product or software upgrade'] ? me.data['Preparation for the use of a new product or software upgrade']:0],
						["Building new skills and new knowledge (not related to new software)",me.data['Building new skills and new knowledge (not related to new software)'] ? me.data['Building new skills and new knowledge (not related to new software)']:0],
						["Preparation for a certification test",me.data['Preparation for a certification test'] ? me.data['Preparation for a certification test']:0],
						["Better understanding of a product before buying new software",me.data['Better understanding of a product before buying new software'] ? me.data['Better understanding of a product before buying new software']:0],
						["Preparing for a career change",me.data['Preparing for a career change'] ? me.data['Preparing for a career change']:0],
				],
				type : 'pie',
	        },
      	});
      	console.log(chart2,"chart2")
		var chart2 = c3.generate({
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
	        },
      	});
	}
})