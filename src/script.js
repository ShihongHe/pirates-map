// Initialize map
var map;

//Function to check if field is empty
var isEmpty    = function(x) { return x === ""; }

//Function to check if field is number
var isNumber   = function(x) { return ! isNaN(x-0); } 

//If field is invalid it is passed here
var invalid    = function(x) { x.style.backgroundColor = '#FFFF7E'; error = true; }

//If field is valid, passed here, changes field back to white in case of form resubmit
var valid      = function(x) { x.style.backgroundColor = "White"; }


// // Create empty arrays to store tweets and data containing hurricanes
// var tweetData = new Array();
// var hurricane= new Array();

// Create an empty list to store markers
var markers=[];

// Create an empty base map dictionary
var basemaps={};
// Create an empty marker dictionary
var overlayMaps={};

// Create an empty var choroplethmaps dictionary
var choroplethmaps={}

// Initialising the layer controller
var LayersControl;

// Initialising the rectangular marker
var rectangleLayer;


var numberPirates;
var info ;

var layerDictionary = {};



// main function
function initialise(){
	//Create the map object and set the centre point and zoom level 
	map = L.map('map').setView([36.00, 45.00], 2);

	// Set minimum zoom level to prevent grey edges
	map.setMinZoom(2);

	L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:'Map data ©OpenStreetMap contributors, CC-BY-SA, Imagery ©CloudMade',
			maxZoom: 18	,
			layers: 'OpenStreetMap'
		}).addTo(map);
	

	
	
	for (var i = 0; i < list.length; i++){
		var title = list[i][0];
  		var value = list[i][1];
  		var colorlist = list[i][2];
		addBasemap(title,value,colorlist);
		layerDictionary[title]={ 'func': Control, 
								'params': [title,value,colorlist] }
	}
	
	// addBasemap('Number of Pirates','output1_number');
	basemaps['Number of Pirates'].addTo(map);

	Control(list[0][0], list[0][1], list[0][2])


	// 绑定事件
	map.on('baselayerchange', function (eventLayer) {
	// 获取底图图层名称
		var layerName = eventLayer.name;
		// 获取对应的控制函数及参数
		var layerInfo = layerDictionary[layerName];
		if (layerInfo) {
		  // 如果控制函数及参数存在，则调用对应的控制函数
		  layerInfo.func.apply(null, layerInfo.params);
		}
	  });
	  
	

   

	attackData = new Array();

	//AJAX request to server; accepts a URL to which the request is sent 
	//and a callback function to execute if the request is successful.
	$.getJSON("fetchDataAttack.php", function(results){ 
		
		//Populate tweetData with results
		for (var i = 0; i < results.length; i++ ){
			
			attackData.push ({
				id: results[i].id, 
				lat: results[i].lat, 
				lon: results[i].lon,
				distance: results[i].distance,
				country: results[i].country,
				region: results[i].region,
				body:'<p>Region: '+results[i].region+'</p><p>Country: '+results[i].country+'</p><p>Shore Distance: '+results[i].distance+'</p>'
			}); 
		}
		

		//plot markers with attackData
		plotTweets(attackData,'Nearest Country','icon/target.png','marker'); 
		

		pirateData = new Array();
		//AJAX request to server; accepts a URL to which the request is sent 
		//and a callback function to execute if the request is successful.
		$.getJSON('fetchData.php',function(results){ 
			//Populate pirateData with results
			for (var i = 0; i < results.length; i++ ){
		
				pirateData.push ({
					id: results[i].id, 
					lat: results[i].lat, 
					lon: results[i].lon,
					vessel_type: results[i].vessel_type,
					vessel_status: results[i].vessel_status,
					attack_type: results[i].attack_type,
					description: results[i].description,
					body:'<p>Vessel Type: '+results[i].vessel_type+'</p><p>Vessel status: '+results[i].vessel_status+'</p><p>Attack Type: '+results[i].attack_type+'</p><p>Attack Description: '+results[i].description+'</p>'
				}); 
			}

			//remove the last generated Control
			map.removeControl(LayersControl);

			//plot markers with hurricane
			plotTweets(pirateData,'Pirate','icon/fire.png','pirate'); 
		});
	
	});
	
	

	
	

}

// plot markers
function plotTweets(data,name,url,ico) {
	var markerClusterGroup = L.markerClusterGroup({
		showCoverageOnHover: false,
		iconCreateFunction: function (cluster) {
			var childCount = cluster.getChildCount();
			var iconUrl;
			

			
			if (childCount < 20) {
				iconUrl = 'icon/'+ico+'1.png';
				
			} else if (childCount < 100) {
				iconUrl = 'icon/'+ico+'2.png';
				
			} else if(childCount < 300){
				iconUrl = 'icon/'+ico+'3.png';
				
			}else {
				iconUrl = 'icon/'+ico+'4.png'; 
				

				
		  	}
			
			var icon = L.divIcon({
				html: '<div class="cluster-marker" style=" position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);"><span style="position: absolute; left: 50%; transform: translate(-50%, -50%);font-weight: bold;font-size: 10px;color:black">'+ childCount + '</span><img src="' + iconUrl + '" /></div>',
				className: 'marker-cluster-ico'
			  });
			return icon;
		  }
	});
	for (var key in overlayMaps) {

		// Filter out tweets and hurricanes that do not equal
		if (key !== "Nearest Country" && key !== "Pirate") {
			//remove the last generated Control
			map.removeLayer(overlayMaps[key]);
			// delete overlayMaps,only tweets and hurricane remain
			delete overlayMaps[key];
		}
		else{
			// Close overlayMaps
			overlayMaps[key].removeFrom(map);
		}
	}

	markers=[];
   	//Loop through tweetData to create marker at each location 
   	for (var i = 0; i < data.length; i++) { 
      	var markerLocation = new L.LatLng(data[i].lat, data[i].lon);
      	var marker = new L.Marker(markerLocation);
		marker.setIcon(L.icon({
			iconUrl:url,
			iconSize: [38, 38],
		}))
      	// map.addLayer(marker);

		//marker storage to markers
      	markers.push(marker.bindPopup(data[i].body));
		markerClusterGroup.addLayer(marker);
		
   	}

	// add to overlayMaps
	// var markerlay=L.layerGroup(markers);

	// console.log(markerCluster);
	overlayMaps[name] = markerClusterGroup;
	// overlayMaps[name] = markerlay;
	
	
	// Open current overlayMaps
	LayersControl=L.control.layers(basemaps, overlayMaps,{collapsed: false}).addTo(map);
	overlayMaps[name].addTo(map);
} 




function addBasemap(title,value,colorlist){
	var Pirates=L.geoJson(statesData,{
		style: function (feature) {
			return style(feature, value,colorlist);
		},
		onEachFeature: onEachFeature
	});
	basemaps[title]=Pirates;
	
}


function style(feature,name,colorlist) {
	return {
		fillColor: getColor(feature.properties[name],colorlist),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
		};
};



function getColor(d,color) {
	return  d > color[6] ? '#b10026' :
			d > color[5] ? '#e31a1c' :
			d > color[4] ? '#fc4e2a' :
			d > color[3] ? '#fd8d3c' :
			d > color[2] ? '#feb24c' :
			d > color[1] ? '#fed976' :
			d == color[0] ? '#ffffcc' :
			   				'#ffeda0';
		
}


function Control(title,value,colorlist){
	var toClean = document.getElementsByClassName('info ');
	var toClean1 = document.getElementsByClassName('legend');
	while (toClean[0]||toClean1[0]) {
    	toClean[0].parentNode.removeChild(toClean[0]);
		toClean1[0].parentNode.removeChild(toClean1[0]);
	}
	info = L.control();
	info.setPosition('topleft');
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		
		this.update();
		
		return this._div;
	};
	
	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
		this._div.innerHTML = '<h4>'+title+'</h4>' +  (props ?
			'<b>' + props.name + '</b><br />' + props[value] 
			: 'Hover over a country');
	};
	
	info.addTo(map);
	var legend = L.control({position: 'bottomleft'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		var grades = colorlist.slice();
		if (value==='number'){
			grades.splice(1, 0, 1);
		}
		else{
			grades.splice(1, 0, 0);
		}
		
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			if (i===0){
				div.innerHTML +='<i style="background:' + getColor(grades[0],colorlist) + '"></i> '+colorlist[0]+ '<br>';
			}
			else{
				div.innerHTML +=
				'<i style="background:' + getColor(grades[i] + 0.01,colorlist) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
			};
			
		}
	
		return div;
	};
	
	legend.addTo(map);


}
	

function highlightFeature(e) {
    var layer = e.target
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
	info.update(layer.feature.properties);
}

function resetHighlight(e) {
	var layer = e.target
	if (layer) {
        layer.setStyle({
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        });
		info.update();
	}
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


//Search by condition
function search_marker(){
	var searchby = document.getElementById("searchby").value;
	// Determine search criteria
	if (searchby != "location") {
		search(searchby);
    } 
	// Determine search criteria
	else if (searchby === "location") {
		// Read data stored in html
		var longitude  =document.getElementById("longitude").value;
		var latitude  =document.getElementById("latitude").value;
		var radius  =document.getElementById("radius").value;
		// Determine if it is empty
		if (longitude&&latitude&&radius){
			// Close rectangular marker
			if (rectangleLayer) {
				map.removeLayer(rectangleLayer);
			  }
			
			//Generating rectangles from circles
			circleLayer =  L.circle([latitude, longitude], {
				radius: radius*1000
			}).addTo(map);
			var bounds = circleLayer.getBounds();
			var sw_lat = bounds.getSouth();
			var ne_lat = bounds.getNorth();
			var sw_lng = bounds.getWest();
			var ne_lng = bounds.getEast();
			
			// remove circle
			map.removeLayer(circleLayer);
			rectangleLayer = L.rectangle(
				[[sw_lat, sw_lng], [ne_lat, ne_lng]], 
				{ color: 'red', 
				weight: 2,
				fillOpacity: 0, } 
			);
			

			rectangleLayer.addTo(map);
			Data = new Array();


			//AJAX request to server; accepts a URL to which the request is sent 
			//and a callback function to execute if the request is successful.
			$.getJSON('searchCir.php',{
				sw_lat: sw_lat,
				ne_lat: ne_lat,
				sw_lng: sw_lng,
				ne_lng: ne_lng
			}, function(results){ 
				//Populate Data with results
				for (var i = 0; i < results.length; i++ ){
					Data.push ({
						id: results[i].id, 
						lat: results[i].lat, 
						lon: results[i].lon,
						vessel_type: results[i].vessel_type,
						vessel_status: results[i].vessel_status,
						attack_type: results[i].attack_type,
						description: results[i].description,
						body:'<p>Vessel Type: '+results[i].vessel_type+'</p><p>Vessel status: '+results[i].vessel_status+'</p><p>Attack Type: '+results[i].attack_type+'</p><p>Attack Description: '+results[i].description+'</p>'
					}); 
				}
		
				// console.log(Data);
				//remove the last generated Control
				map.removeControl(LayersControl);

				// Generate a random number for the image used to generate the marker
				var digit=Math.round(Math.random()*4);
				//plot markers with Data
				plotTweets(Data,'circle','icon/'+digit+'.png');
				
				// Zoom to searchable marker
				var southWest = L.latLng(sw_lat, sw_lng);
				var northEast = L.latLng(ne_lat, ne_lng );
				var bounds = L.latLngBounds(southWest, northEast);
				map.fitBounds(bounds);

				var num = Data.length
				// Determine if found
				if (num){
					document.getElementById("tips").innerHTML=("Find "+num);
					
				}
				else{
					document.getElementById("tips").innerHTML=("Not found");
					
				}
				
	
			});

		}
		else{
			alert("Please enter all!");
		}
		 
    }

}

function search(searchby){
	// Close rectangular marker
	if (rectangleLayer) {
		map.removeLayer(rectangleLayer);
	}
	// Read data stored in html
	var timef  =document.getElementById("timef").value;
	var timet  =document.getElementById("timet").value;
	var search  =document.getElementById(searchby).value;
	// Determine if it is empty
	if (search){
		Data = new Array();
		//AJAX request to server; accepts a URL to which the request is sent 
		//and a callback function to execute if the request is successful.
		$.getJSON('search.php',{
			searchby:searchby,
			timef:timef,
			timet:timet,
			textBody:search,
		},function(results){ 
			//Populate tweetData with results
			for (var i = 0; i < results.length; i++ ){
				Data.push ({
					id: results[i].id, 
					lat: results[i].lat, 
					lon: results[i].lon,
					vessel_type: results[i].vessel_type,
					vessel_status: results[i].vessel_status,
					attack_type: results[i].attack_type,
					description: results[i].description,
					body:'<p>Vessel Type: '+results[i].vessel_type+'</p><p>Vessel status: '+results[i].vessel_status+'</p><p>Attack Type: '+results[i].attack_type+'</p><p>Attack Description: '+results[i].description+'</p>'
				}); 
			}

		//remove the last generated Control
		map.removeControl(LayersControl);
		// console.log(Data);



		// Generate a random number for the image used to generate the marker
		var digit=Math.round(Math.random()*4);
		
		//plot markers with Data
		plotTweets(Data,search ,'icon/'+digit+'.png','bomb');
		var num = Data.length
		// Determine if found
		if (num){
			document.getElementById("tips").innerHTML=("Find "+num);
			
		}
		else{
			document.getElementById("tips").innerHTML=("Not found");
			
		}
		
		//delete overlayMaps[textBody];
		});
	}
	else{
		alert("Please enter all!");
	}
}


// Show hidden textFieldsDiv and locationFieldsDiv respectively
function showHideFields() {
    var selectedValue = document.getElementById("searchby").value;
    var regionFieldsDiv = document.getElementById("regionFields");
    var attackFieldsDiv = document.getElementById("attackFields");
	var statusFieldsDiv = document.getElementById("statusFields");
	var locationFieldsDiv = document.getElementById("locationFields");
	
    if (selectedValue === "attacksearch") {
        attackFieldsDiv.style.display = "block";
        locationFieldsDiv.style.display = "none";
		statusFieldsDiv.style.display = "none";
		regionFieldsDiv.style.display = "none";
    } 
	else if (selectedValue === "location") {
        attackFieldsDiv.style.display = "none";
        locationFieldsDiv.style.display = "block";
		statusFieldsDiv.style.display = "none";
		regionFieldsDiv.style.display = "none";
    }
	else if (selectedValue === "regionsearch") {
        attackFieldsDiv.style.display = "none";
        locationFieldsDiv.style.display = "none";
		statusFieldsDiv.style.display = "none";
		regionFieldsDiv.style.display = "block";
    }else if (selectedValue === "statussearch") {
        attackFieldsDiv.style.display = "none";
        locationFieldsDiv.style.display = "none";
		statusFieldsDiv.style.display = "block";
		regionFieldsDiv.style.display = "none";
    }
}


function validate()	{

	error 	 	 	= false; 
	var allboxes = document.getElementsByClassName('boxes');
	var username = document.getElementById('user'); 
	var password = document.getElementById('password');
	
	// var date	 	 = document.getElementById('date');
	// var time	 	 = document.getElementById('time');
	var lat	 	 = document.getElementById('lat');
	var lon	 	 = document.getElementById('lon');

	// var attackType	 	 = document.getElementById('attackType');
	// var vesselType	 	 = document.getElementById('vesselType');
	// var vesselStatus	 	 = document.getElementById('vesselStatus');

	// var textBody		 = document.getElementById('textBody');
	// var country	 = document.getElementById('country');
	// var region	 = document.getElementById('region');
	var shoreLat	 	 = document.getElementById('shoreLat');
	var shoreLon	 	 = document.getElementById('shoreLon');

	//Clear yellow highlighting in case form is resubmitted 
	for (var i=0;i<allboxes.length;i++) {
		valid(allboxes[i]); 
	}
	
	//Loop through all fields to check if empty 
	for (var i=0;i<allboxes.length;i++) { 
		if	(isEmpty(allboxes[i].value))	{
			invalid(allboxes[i]); 
		}
	} 
	
	//Validate latitude field and shore latitude
	if (!isNumber(lat.value) || isEmpty(lat.value))	{
		invalid(lat);
	}
	
	if (!isNumber(shoreLat.value) || isEmpty(shoreLat.value))	{
		invalid(shoreLat);
	}


	//Validate longitude field and shore latitude
	if (!isNumber(lon.value) || isEmpty(lon.value))	{
		invalid(lon);
	}

	if (!isNumber(shoreLon.value) || isEmpty(shoreLon.value))	{
		invalid(shoreLon);
	}
	
	
	//If error, return false and alert user
	if (error) { 
		alert("Please check the form for highlighted errors and resubmit");
		return false; 
	} 
	
	//Submit form if there are no errors. 
	else 	{
		return true; 
	} 
}	
	
