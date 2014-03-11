var Chart2 = ChartDetails.extend({

	chartRender: function () {

		// Block pre-model data retrieval executions (hacky fix)
		if (typeof this.model.get("response") == "undefined"){
			return false;
		}

		var serverResponse = this.model.get("response");

		// Keep a running tally of the data time we're using
		var intTime = serverResponse.serverTime;

		// Keep a running reference of the data we're updating
		var curData = serverResponse.data;

		// Get dataForChart values to create map
		var dataForChart = remapDataForChart(curData, false, false);

		// Function to remap data to conform to graph expectations
		function remapDataForChart(baseData, genNew, removeFirst){

		  // Update time state by 1s if we're generating new data here
		  if (typeof genNew !== "undefined" && genNew){
		    intTime += 1000;
		    var curTime = intTime;
		  }

		  // Reformatted data for chart generation
		  var dataForChart = [];

		  // Avoid shifting (etc) arrs mid-loop, so use this clone instead
		  var baseDataClone = $.extend(true, {}, baseData);

		  // Each data
		  $.each(baseData, function(i,v){

		    // If we want to generate a new data point
		    if (typeof genNew !== "undefined" && genNew){

		      // To generate "random" data within the same realm as
		      // existing data, let's key off the first data point
		      var dataBasis = {};

		      // If we want to remove the first data point in the series
		      if ((typeof removeFirst !== "undefined" && removeFirst) || baseDataClone[i].subData.length > 5){
		        // Pull first object out and use it for new
		        // dataBasis = baseDataClone[i].subData.shift(0);

		        // The above would be preferable, but nvd3 lacks key binding to data,
		        // and as a consequence, data jumps all over the place. Thus, in order
		        // to deliver something basic, I won't remove the first item in array. 
		        dataBasis = $.extend(true, {}, baseDataClone[i].subData[0]);
		      }
		      else {
		        // Create duplicate of, not reference to, object
		        dataBasis = $.extend(true, {}, baseDataClone[i].subData[0]);
		      }

		      // Loop over each value in dataBasis and update the values accordingly
		      $.each(dataBasis, function(key,val){
		        if (key == "date"){
		          // For simplicity, we'll just update time by 1s each call
		          dataBasis[key] = curTime;
		        }
		        else {
		          // mutate the value by +50% / -20%, force int, and increase by 5 (growth looks pretty)
		          dataBasis[key] = parseInt(val * Math.random() * (1.5 - .8) + .8) + 5;
		        }
		      });

		      // Add the newly generated item to the end of the array
		      baseDataClone[i].subData.push(dataBasis);

		    }

		    // Create obj to push into dataForChart
		    var dataObj = {
		      key: baseDataClone[i].key,
		      values: []
		    };

		    // Create data array of y/x axis data for this category
		    $.each(baseDataClone[i].subData, function(ind,val){

		      // Put y/x axis data into our category obj
		      dataObj.values.push({shape:"circle", x: val.imps, y: val.clicks, size: val.sales, date:val.date});

		    });

		    // Put compiled obj into our chart obj
		    dataForChart.push(dataObj);
		  });

		  // Update our global memory of cur data
		  curData = baseDataClone;

		  // Return the data to be sent to the chart
		  return dataForChart;
		}




		//Format A
		var chart;
		nv.addGraph(function() {
		  chart = nv.models.scatterChart()
		                .showDistX(true)
		                .showDistY(true)
		                .useVoronoi(true)
		                .color(d3.scale.category10().range())
		                .transitionDuration(300)
		                ;

		  chart.xAxis.tickFormat(d3.format('.02f'));
		  chart.yAxis.tickFormat(d3.format('.02f'));
		  chart.tooltipContent(function(key) {
		      return '<h2>' + key + '</h2>';
		  });

		  d3.select('#chart svg')
		  	  .datum(dataForChart)
		//      .data(dataForChart, function(d) { console.log('testx'); console.log(d); return d.date; })
		      .call(chart);

		  nv.utils.windowResize(chart.update);

		  chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

		  return chart;
		});

		// Clear out intervals from other charts
		if (typeof chartUpdateInt !== "undefined"){
			clearInterval(chartUpdateInt);
		}

		// Add data to the chart on an interval
		window.chartUpdateInt = setInterval(function(){

			var dataRemap = remapDataForChart(curData, true, false);

			d3.select('#chart svg')
			  	  .datum(remapDataForChart(curData, true, false))
			  	  /* It turns out that NVD3 doesn't accept giving keys
			  	  	 to data, which is what would give motion constancy
			  	  	 with a changing array length.  With more time, I'd
			  	  	 probably do this in d3 */
			//      .data(dataRemap, function(d) {console.log(d);  return d.date; })
			      .call(chart);
		}, 1000);


	}
});