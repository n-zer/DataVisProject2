'use strict'
google.charts.load("current", {packages:['corechart']});
document.querySelector("#files").addEventListener('change', function(e){
	var modelFailures = {};
	var modelDays = {};
	var modelData = {};
	var modelBrands = {};
	var modelFailHours = {};
	var modelCapacity = {};
	var fileList = e.target.files;
	var fileCount = 0;

	//clear info div
	var myNode = document.getElementById("info");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	//append diagnostic text
	var countNode = document.createElement("p");
	countNode.innerHTML = "Parsing "+fileList.length+" files";
	myNode.appendChild(countNode);

	//iterate through files
	loadFile(fileList,0);

	//function to parse an individual file

	function loadFile(files, index){
		//create reader
		var fr = new FileReader();

		//set onload handler
		fr.onload = function parseFile(e){
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
				var capacity = commasplit[3];
				var serialNumber = commasplit[1];
				var modelNumber = commasplit[2];
				var failure = commasplit[4];

				var brand;

				if(/^[Tt][Oo][Ss][Hh][Ii][Bb][Aa].*/.test(modelNumber)){
					brand = "Toshiba";
				}
				else if(/^[Ww][Dd][Cc].*/.test(modelNumber) || /^[Hh][Gg][Ss][Tt].*/.test(modelNumber)){
					brand = "Western Digital"
				}
				else if(/^[Ss][Tt].*/.test(modelNumber)){
					brand = "Seagate";
				}
				else if(/^[Hh][Ii][Tt][Aa][Cc][Hh][Ii].*/.test(modelNumber)){
					brand = "Hitachi";
				}

				//add defaults if this is the first time we've seen this model
				if(isNaN(modelDays[modelNumber]))
				{
					modelDays[modelNumber] = 0;
					modelFailures[modelNumber] = 0;
				}

				modelBrands[modelNumber] = brand;

				modelCapacity[modelNumber] = capacity;

				//increment day counter for this model
				modelDays[modelNumber]++;

				//if the drive failed, increment failure counter
				if(failure == 1){
					modelFailures[modelNumber]++;
					if(!modelFailHours[modelNumber])
						modelFailHours[modelNumber] = 0;
					modelFailHours[modelNumber]+=Number(commasplit[20]);
				}
			}

			if(index<files.length-1)
				loadFile(files, index+1);
			else
				printInfo();
		}

		

		//load the file
		fr.readAsText(files[index]);
	}

	function printInfo(){
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

			if(!modelData[modelBrands[key]])
				modelData[modelBrands[key]] = {};
			//failures*100*365/driveDays
			//modelData[key] = modelFailures[key]*100*365/modelDays[key];
			//if(modelDays[key] > 45 && modelData[key]>0 && modelData[key] <100)
			//	data.addRow([key,(modelFailures[key]/(modelDays[key]/365))*100]);
			modelData[modelBrands[key]][key] = {
				//brand:modelBrands[key],
				capacity:modelCapacity[key],
				failureRate: modelFailures[key]*100*365/modelDays[key],
				failures: modelFailures[key],
				driveDays:modelDays[key],
				failHours:modelFailHours[key]
			};
			
		}
		console.log(JSON.stringify(modelData));
	}

});

