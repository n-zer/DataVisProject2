'use script'
google.charts.load("current", {packages:['corechart']});
document.querySelector("#files").addEventListener('change', function(e){
	var modelFailures = {};
	var modelDays = {};
	var modelData = {};
	var files = e.target.files;
	var fileCount = 0;

	//clear info div
	var myNode = document.getElementById("info");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	//append diagnostic text
	var countNode = document.createElement("p");
	countNode.innerHTML = "Parsing "+files.length+" files";
	myNode.appendChild(countNode);

	//iterate through files
	for(var c = 0, f; f = files[c]; c++){
		//create reader
		var fr = new FileReader();

		//set onload handler
		fr.onload = parseFile;

		//load the file
		fr.readAsText(f);		
	}

	//function to parse an individual file
	function parseFile(e){
		var text = e.target.result;

		//split text on new lines
		var lineSplit = text.split("\n");

		//iterate through all lines (first line is headings, so skip it)
		for(var n = 1;n<lineSplit.length;n++)
		{
			//split line on commas
			var commasplit = lineSplit[n].split(",");

			//get data from line
			//SMART 9 raw = 20
			var serialNumber = commasplit[1];
			var modelNumber = commasplit[2];
			var failure = commasplit[4];

			//add defaults if this is the first time we've seen this model
			if(isNaN(modelDays[modelNumber]))
			{
				modelDays[modelNumber] = 0;
				modelFailures[modelNumber] = 0;
			}

			//increment day counter for this model
			modelDays[modelNumber]++;

			//if the drive failed, increment failure counter
			if(failure == 1)
				modelFailures[modelNumber]++;
		}

		//increment file counter
		fileCount++;

		//if file counter equals total file count we've processed all files
		if(fileCount==files.length){
			//remove diagnostic text
			myNode.removeChild(myNode.firstChild);
			var data = new google.visualization.DataTable();
			data.addColumn('string','Models');
			data.addColumn('number','Failure Rates');
			//iterate through all models
			for(var key in modelDays)
			{
				//add diagnostic text for each model
				var node = document.createElement("p");
				node.innerHTML = key+ " Days: "+modelDays[key] +((modelFailures[key])? " Failures: "+modelFailures[key] : "");
				myNode.appendChild(node);


				//failures*100*365/driveDays
				modelData[key] = modelFailures[key]*100*365/modelDays[key];
				if(modelDays[key] > 45 && modelData[key]>0 && modelData[key] <100)
					data.addRow([key,(modelFailures[key]/(modelDays[key]/365))*100]);
				/*modelData[key] = {
					failureRate: modelFailures[key]*100*365/modelDays[key],
					failures: modelFailures[key],
					driveDayrs:modelDays[key]
				};*/
				
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
		}
	}
});