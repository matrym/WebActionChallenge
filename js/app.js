var AppRouter = Backbone.Router.extend({
    routes: {
        "": "list",
        "charts/:item": "chartView"
    },

    initialize: function() {
        this.chartModel = new Chart();
        this.chartView = null;
    },

    list: function() {
        $('#app').html("Please select a chart to begin.");
    },

    chartView: function(item) {


        // Destroy previous chartViews
        if (this.chartView !== null){
            this.chartView.remove();
        }


        // $('#app').html(this.chartView.render().el);
        if (item == "chart1") {
          this.chartView = new Chart1({model: this.chartModel});
        }
        else if (item == "chart2") {
          this.chartView = new Chart2({model: this.chartModel});
        }
        else if (item == "chart3") {
          this.chartView = new Chart3({model: this.chartModel});
        }

        $("#app").html(this.chartView.render().el);
        this.chartModel.set('id', item);

        // Fetch data
        this.chartModel.fetch();

    }
});

var app = new AppRouter();

$(function() {
    Backbone.history.start();
});