'use script'

document.querySelector("#files").addEventListener('change', function(e){
	var modelFailures = {};
	var files = e.target.files;

	for(var c = 1, f; f = files[c]; c++){
		var fr = new FileReader();

		fr.onload = function(e){
			var text = e.target.result;
			var lineSplit = text.split("\n");

			for(var n = 0;n<lineSplit.length;n++)
			{
				var commasplit = lineSplit[n].split(",");
				//SMART 9 raw = 20
				//serial number = 1
				//model = 2
				//failure = 4
			}
		};

		fr.readAsText(f);
	}
});