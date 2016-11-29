'use script'

document.querySelector("#files").addEventListener('change', function(e){
	var modelFailures = {};
	var modelDays = {};
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

			//iterate through all models
			for(var key in modelDays)
			{
				//add diagnostic text for each model
				var node = document.createElement("p");
				node.innerHTML = key+ " Days: "+modelDays[key] +((modelFailures[key])? " Failures: "+modelFailures[key] : "");
				myNode.appendChild(node);
			}
		}
	}
});