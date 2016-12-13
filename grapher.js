'use strict'

var brandColors = {
	Seagate:"#aa0000",
	Toshiba:"#00aa00",
	'Western Digital':"#0000aa",
	Hitachi:"#6600aa"
};

google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(drawChart);

var brandEnable = {
	Seagate:true,
	Toshiba:true,
	'Western Digital':true,
	Hitachi:true
};

var chart;

var brandArrays = {};

for(var brand in brandData){
	var brandObj = brandData[brand];
	brandArrays[brand] = [];
	for(var model in brandObj){
		var modelObj = brandObj[model];
		modelObj.model = model;
		brandArrays[brand].push(modelObj);
	}
}

brandData = brandArrays;

for(var brand in brandArrays){
	var array = brandArrays[brand];
	array.sort(function(a,b){
		if(Number(a.capacity)<Number(b.capacity))
			return -1;
		else return 1;
	});
}

function drawChart(){
	document.querySelector("#columnchart_values").clearChart;
	var data = new google.visualization.DataTable();
	data.addColumn('string','Model');
	data.addColumn('number','Average lifetime (years)');
	data.addColumn({type: 'string', role: 'style'});
	data.addColumn({type:'string',role:'tooltip',p:{html:true}});
	data.addColumn('number','truncated lifetime')

	//var dataArray = [['Model','Average lifetime (years)',{role:'style'}]];
	var dataArray = [];
	for(var brand in brandData){
		if(!brandEnable[brand])
			continue;
		var cleanedData = brandData[brand];
		var color;
		for(var b in brandColors){
			if(brand == b){
				color = brandColors[b];
				break;
			}
		}
		for(var index in cleanedData){
			var modelData = cleanedData[index];
			var model = modelData.model;
			var lifetime = (modelData.failHours/8760)/modelData.failures;
			var capacity = (modelData.capacity>=1e12)? Number(Math.floor(10*modelData.capacity/1e12)/10)+"TB" : Number(Math.floor(10*modelData.capacity/1e9)/10)+"GB";
			if(modelData.failHours && modelData.failures>0)//modelData.failureRate>0 && modelData.driveDays>100 && modelData.failureRate<100)
				dataArray.push([model,lifetime,color,"<div style='font-family:Arial;'><h4 >"+brand+" - "+ model+"</h4> Capacity: "+capacity+"<br><br>Click to google</div>",Math.floor(10*lifetime)/10]);
		}
	}
	data.addRows(dataArray);
	//var data = google.visualization.arrayToDataTable(dataArray);
	var view = new google.visualization.DataView(data);
	view.setColumns([0, 1, 2,
	      { sourceColumn: 4,
	        type: "number",
	        role: "annotation" },
	        3]);

	var options = {
		title: "Hard drive lifetime in years by model",
		width: .985* Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: .9*Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		bar: {groupWidth: "90%"},
		legend: { position: "none" },
		vAxis:{title:'Average lifetime (years)'},
		hAxis:{title:'Model',textStyle:{fontSize:14}},
		tooltip:{isHtml:true}
	};
	//var options = {};
	chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
	google.visualization.events.addListener(chart, 'select', selectHandler);
	chart.draw(view, options);

	function selectHandler(){
		var selection = chart.getSelection()[0];
		window.open('https://google.com/search?q='+data.getValue(selection.row,0));
	}
}

function filterToggle(b){
	brandEnable[b] = !brandEnable[b];
	drawChart();
}