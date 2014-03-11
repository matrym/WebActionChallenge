var ChartDetails = Backbone.View.extend({

	/* Render as template if handlebars (or hogan, mustache, etc.) is used
	template: Handlebars.compile(),
	*/

	initialize: function  () {
		// Bind a re-render on emitted change event
		this.listenTo(this.model, "change", this.chartRender);
	},

	render: function () {

		/* 
		Chart doesn't require a handlebars template, so skipping:
		this.$el.html(this.template(this.model.attributes));
		*/

		// Paint the basic nvd3 elements
		var basicHtml = '<div id="chart">' +
							'<svg id="svgChart"></svg>' +
						'</div>';
		this.$el.html(basicHtml);

		console.log('render console log');
		// Generate nvd3 charts within the painted svg etc.
		/*
		console.log('test');
		console.log(this);
		console.log(this.$el.html());
		*/

		// Conditionally run JS per chart
		var data = this.model.attributes;

		// Execute the nvd3 js rendering
		this.chartRender(data);



		return this;
	}
});