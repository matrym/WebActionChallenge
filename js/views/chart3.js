var Chart3 = ChartDetails.extend({

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
		      if ((typeof removeFirst !== "undefined" && removeFirst) || baseDataClone[i].subData.length > 30){
		        // Pull first object out and use it for new
		        dataBasis = baseDataClone[i].subData.shift(0);
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
		      dataObj.values.push([val.date, val.sales]);

		    });

		    // Put compiled obj into our chart obj
		    dataForChart.push(dataObj);
		  });

		  // Update our global memory of cur data
		  curData = baseDataClone;

		  // Return the data to be sent to the chart
		  return dataForChart;
		}

		console.log('dataForChart');
		console.log(dataForChart);


		/*
		.map(function(series) {
		  series.values = series.values.map(function(d) {
		    return { x: d[0], y: d[1] }
		  });
		  return series;
		});
		*/

		//an example of harmonizing colors between visualizations
		//observe that Consumer Discretionary and Consumer Staples have
		//been flipped in the second chart
		var colors = d3.scale.category20();
		keyColor = function(d, i) {return colors(d.key)};

		var chart;
		curGraph = nv.addGraph(function() {
		  chart = nv.models.stackedAreaChart()
		               // .width(600).height(500)
		                .useInteractiveGuideline(true)
		                .x(function(d) { return d[0] })
		                .y(function(d) { return d[1] })
		                .color(keyColor)
		                .transitionDuration(300);
		                //.clipEdge(true);

		// chart.stacked.scatter.clipVoronoi(false);

		  chart.xAxis
		      .tickFormat(function(d) { return d3.time.format('%M:%S')(new Date(d)) });

		  chart.yAxis
		      .tickFormat(d3.format(',.2f'));

		  d3.select('#svgChart')
		      .datum(dataForChart)
		//    .datum(histcatexplong)
		    .transition().duration(1000)
		    .call(chart)
		    // .transition().duration(0)
		    .each('start', function() {
		        setTimeout(function() {
		            d3.selectAll('#svgChart *').each(function() {
		//              console.log('start',this.__transition__, this)
		              // while(this.__transition__)
		              if(this.__transition__)
		                this.__transition__.duration = 1;
		            })
		          }, 0)
		      })
		    // .each('end', function() {
		    //         d3.selectAll('#chart1 *').each(function() {
		    //           console.log('end', this.__transition__, this)
		    //           // while(this.__transition__)
		    //           if(this.__transition__)
		    //             this.__transition__.duration = 1;
		    //         })});

		  nv.utils.windowResize(chart.update);

		  chart.dispatch.on('stateChange', function(e) { 
		    /*
		    // Store toggles to ensure datum updates include only the correct items
		    window.graphState = e;
		    */
		    nv.log('New State:', JSON.stringify(e)); 
		  });

		  return chart;
		});

		console.log('curGraph');
		console.log(curGraph);

		// Clear out intervals from other charts
		if (typeof chartUpdateInt !== "undefined"){
			clearInterval(chartUpdateInt);
		}

		// Add data to the chart on an interval
		window.chartUpdateInt = setInterval(function(){
		  d3.select('#svgChart')
		      .datum(remapDataForChart(curData, true, false))
		      .transition().duration(1000)
		      .call(chart);
		}, 1000);

	}
});