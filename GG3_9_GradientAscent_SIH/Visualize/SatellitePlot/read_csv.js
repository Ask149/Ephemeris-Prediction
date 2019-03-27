$(document).ready(function() {
	$.ajax({
		type: "GET",
		url: "2.txt",
		dataType: "text",
		success: function(data) {processData(data);}
	});
});

var axs = [];
var ecc = [];
var inc = [];
var bog = [];
var sog = [];
var man = [];
function processData(allText) {
	var allTextLines = allText.split(/\r\n|\n/);
	var headers = allTextLines[0].split(',');
	var lines = [];	
	for (var i=1; i<allTextLines.length; i++) {
		var data = allTextLines[i].split(',');
		if (data.length == headers.length) {
			var tarr = [];
			var flag = false;
			for (var j=0; j<headers.length; j++) {
				if(headers[j]=="prn" && data[j]==2)	{
					flag = true;
				}
				if(flag==true)
				{
					tarr.push(headers[j]+":"+data[j]);
					if(headers[j]=="sqrt_semi_major_axis"){
						axs.push(data[j]);
					}
					else if(headers[j]=="essentricity"){
						ecc.push(data[j]);
					}
					else if(headers[j]=="inclination"){
						inc.push(data[j]);
					}
					else if(headers[j]=="OMEGA"){
						bog.push(data[j]);
					}
					else if(headers[j]=="omega"){
						sog.push(data[j]);
					}
					else if(headers[j]=="mean_anomaly"){
						man.push(data[j]);
					}
				}
			}
			if(flag)
			{
				lines.push(tarr);
			}
		}
	}
	console.log(lines);
	for(var i=0;i<axs.length;i++){
		console.log(axs[i]+" "+ecc[i]+" "+inc[i]+" "+bog[i]+" "+sog[i]+" "+man[i]);
	}
}