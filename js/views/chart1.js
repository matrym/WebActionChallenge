/* 

I really didn't have a chance to get to this chart.

Aside from updating on an interval, this file is otherwise
stock nvd3 js template.


*/


var Chart1 = ChartDetails.extend({

	chartRender: function () {

		var test_data = stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
		//var test_data = stream_layers(3,1,.1).map(function(data, i) { //for testing single data point
		  return {
		    key: 'Stream' + i,
		    values: data
		  };
		});

		console.log('td',test_data);

		var negative_test_data = new d3.range(0,3).map(function(d,i) { return {
		  key: 'Stream' + i,
		  values: new d3.range(0,11).map( function(f,j) {
		    return { 
		             y: 10 + Math.random()*100 * (Math.floor(Math.random()*100)%2 ? 1 : -1),
		             x: j
		           }
		  })
		  };  
		});
		console.log('neg data');
		console.log(negative_test_data);

		var negative_test_data2 = function(){
			return new d3.range(0,3).map(function(d,i) { return {
			  key: 'Stream' + i,
			  values: new d3.range(0,11).map( function(f,j) {
			    return { 
			             y: 10 + Math.random()*100 * (Math.floor(Math.random()*100)%2 ? 1 : -1),
			             x: j
			           }
			  })
			  };  
			});
		}

		var chart;
		nv.addGraph(function() {
		    chart = nv.models.multiBarChart()
		      .barColor(d3.scale.category20().range())
		      .margin({bottom: 100})
		      .transitionDuration(300)
		      .delay(0)
		      .rotateLabels(45)
		      .groupSpacing(0.1)
		      ;

		    chart.multibar
		      .hideable(true);

		    chart.reduceXTicks(false).staggerLabels(true);

		    chart.xAxis
		        .axisLabel("Current Index")
		        .showMaxMin(true)
		        .tickFormat(d3.format(',.6f'));

		    chart.yAxis
		        .tickFormat(d3.format(',.1f'));

		    d3.select('#chart svg')
		        .datum(negative_test_data)
		       .call(chart);

		    nv.utils.windowResize(chart.update);

		    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

		    return chart;
		});

		/* Inspired by Lee Byron's test data generator. */
		function stream_layers(n, m, o) {
		  if (arguments.length < 3) o = 0;
		  function bump(a) {
		    var x = 1 / (.1 + Math.random()),
		        y = 2 * Math.random() - .5,
		        z = 10 / (.1 + Math.random());
		    for (var i = 0; i < m; i++) {
		      var w = (i / m - y) * z;
		      a[i] += x * Math.exp(-w * w);
		    }
		  }
		  return d3.range(n).map(function() {
		      var a = [], i;
		      for (i = 0; i < m; i++) a[i] = o + o * Math.random();
		      for (i = 0; i < 5; i++) bump(a);
		      return a.map(stream_index);
		    });
		}

		/* Another layer generator using gamma distributions. */
		function stream_waves(n, m) {
		  return d3.range(n).map(function(i) {
		    return d3.range(m).map(function(j) {
		        var x = 20 * j / m - i / 3;
		        return 2 * x * Math.exp(-.5 * x);
		      }).map(stream_index);
		    });
		}

		function stream_index(d, i) {
		  return {x: i, y: Math.max(0, d)};
		}


		// Clear out intervals from other charts
		if (typeof chartUpdateInt !== "undefined"){
			clearInterval(chartUpdateInt);
		}

		// Add data to the chart on an interval
		window.chartUpdateInt = setInterval(function(){
			d3.select('#svgChart')
			  .datum(negative_test_data2)
//			  .datum(remapDataForChart(curData, true, false))
			  .transition().duration(1000)
			  .call(chart);
		}, 1000);

	}
});