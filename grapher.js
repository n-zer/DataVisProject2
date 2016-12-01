'use strict'

google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(function(){
	var data = new google.visualization.DataTable();
	data.addColumn('string','Models');
	data.addColumn('number','Failure Rates');

	for(var model in cleanedData){
		if(cleanedData[model]>0 && cleanedData[model] <100)
			data.addRow([model,cleanedData[model]]);
	}
	var view = new google.visualization.DataView(data);
	view.setColumns([0, 1,
	      { calc: "stringify",
	        sourceColumn: 1,
	        type: "string",
	        role: "annotation" }]);

	var options = {
		title: "Failure Rate of Popular Harddrive brands",
		width: 600,
		height: 400,
		bar: {groupWidth: "95%"},
		legend: { position: "none" },
		series: {
			0: {axis: 'brand'},
			1: {axis: 'failureRate'}
		},
		axes: {
			x: {
				brand: {label: 'Brand'}
			},
			y: {
				failurRate: {label: 'RoF'}
			}
		}
	};
	//var options = {};
	var chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
	chart.draw(view, options);
});