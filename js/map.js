//Array of places around bengaluru
var Locations = [
		{ name: 'M Chinnaswamy Stadium',
		  position: {lat: 12.979678, lng: 77.599607},
		  id: '4b9f5637f964a5203f1d37e3'
		},

		{ name: 'Iskon',
		  position: {lat: 13.009826, lng: 77.550275},
		  id: '4cb899214352a1cd3a0487f5'
		},

		{ name: 'Wonderla',
		  position: {lat: 12.834272, lng: 77.401044},
		  id: '4b9c8656f964a5203d6e36e3'
		},

		{ name: 'Orion Mall',
		  position: {lat: 13.011264, lng: 77.558918},
		  id: '4f1869c7e4b0ebf9e4ae9134'
		},

		{ name: 'Bannerghatta National Park',
		  position: {lat: 12.800934, lng: 77.577668},
		  id: '4bf7af228d30d13a3163ff17'
		},
		{ name: 'Bangalore Palace',
		  position: {lat: 12.998691, lng: 77.592009},
		  id: '4d81ae5bbaf9a35db0569b21'
		},
		{ name : 'Lumbini Gardens',
		  position : { lat : 13.043405 , lng : 77.609656 },
		  id : '53945f24498eb27aa26ad35c'
		}
];

//Declared map and infoWindow variables
	function contentString(location) {
		"use strict";
		return ('<div id="content">'+ '<div id="siteNotice">'+ '</div>'+ '<h1 id="firstHeading" class="firstHeading">' + location.title + '</h1>'+ '<div id="bodyContent">'+ '<p>' + location.formattedAddress[0] + '<br>' + location.formattedAddress[1] + '<br>' + location.formattedAddress[2] + '<br>' + '</div>'+ '</div>');
	}

var map;

var currentInfoWindow;

//Bengaluru latitude and longitude is defined to set as initial co-ordinate
	function initMap() {
	"use strict";
		map = new google.maps.Map(document.getElementById("map"), {
			center: {lat: 12.971599, lng: 77.594563},
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false
		});
	}

//view model behaviour
function ViewModel() {
	"use strict";

	//Declared "this" as touristPlace variable so that the same instance of "this" can be used in multiple functions dtouristPlacestream
	var touristPlace = this;
	touristPlace.markers = [];

	//Copies the values of Locations and stores them in an observable array for knockout listview implementation
	touristPlace.Locations = ko.observableArray(Locations);

	//Adds new markers at each location in the touristPlace.Locations Array
	touristPlace.Locations().forEach(function(location) {
		var marker = new google.maps.Marker({
			position: location.position,
			map: map,
			title: location.title,
			URL: location.shortUrl,
			animation: google.maps.Animation.DROP
		});

		location.marker = marker;

		marker.setVisible(true);

	//Pushes each marker into the markers array
		touristPlace.markers.push(marker);

			/*client id and client secret for foursquare api*/
				var CLIENT_ID_Foursquare = '?client_id=5OUTO5QNCMOEEZCO5ZYUPAJLGY1EFZE05TJOOE51NQRFPVEP';
				var CLIENT_SECRET_Foursquare = '&client_secret=3UJVCMA43UXLZP1Y4Z34EMUM5CXOFQPLDQTRUFPRXZNVBQXH';

	/*Foursquare api ajax request*/
						$.ajax({
								type: "GET",
								dataType: 'json',
								cache: false,
								url: 'https://api.foursquare.com/v2/venues/' + location.id + CLIENT_ID_Foursquare + CLIENT_SECRET_Foursquare + '&v=20130815',
								async: true,
								success: function(data) {
										console.log(data.response);
										console.log(data.response.venue.name);
										console.log(data.response.venue.location.formattedAddress);
					//Map info windows to each Location in the markers array
								var infoWindow = new google.maps.InfoWindow({
										content: contentString({title: data.response.venue.name, formattedAddress: data.response.venue.location.formattedAddress})
												});

								location.infoWindow = infoWindow;

								location.marker.addListener('click', function () {
										if (currentInfoWindow !== undefined) {
												currentInfoWindow.close();
										}
										currentInfoWindow = location.infoWindow;
										location.infoWindow.open(map, this);
										// location.infoWindow.setContent(contentString(location));
										location.marker.setAnimation(google.maps.Animation.BOUNCE); //Markers will bounce when clicked
										setTimeout(function () {
												location.marker.setAnimation(null);
										}, 1500); //Change value to null after 1.5 seconds and stop markers from bouncing
								});

										/*callback function if succes - Will add the rating received from foursquare to the content of the info window*/
										if (!data.response) {
												data.response = 'No rating in foursquare';
										}
								},
								error: function(data) {
										/*callback function if error - an alert will be activaded to notify the user of the error*/
										alert("Could not load data from foursquare.");
								}
						});
	});

	//Click on Location in list view
	touristPlace.listViewClick = function(location) {
		if (location.name) {
			map.setZoom(15); //Zoom map view
			map.panTo(location.position); // Pans the map view to selected marker when list view Location is clicked
			location.marker.setAnimation(google.maps.Animation.BOUNCE); // Bounces marker when list view Location is clicked
			 if (currentInfoWindow !== undefined) {
								currentInfoWindow.close();
						}
						currentInfoWindow = location.infoWindow;
						currentInfoWindow.open(map, location.marker); // Opens an info window on correct marker when list Location is clicked
		}
		setTimeout(function() {
			location.marker.setAnimation(null); // End animation on marker after 1.5 seconds
		}, 1500);
	};

	// Stores user input
	touristPlace.query = ko.observable('');

//Filter through observableArray and filter results using knockouts utils.arrayFilter();
touristPlace.search = ko.computed(function () {
	return ko.utils.arrayFilter(touristPlace.Locations(), function (listResult) {
	var result = listResult.name.toLowerCase().indexOf(touristPlace.query().toLowerCase());

//If-else statement used to display markers only if they meet search criteria in search bar
	if (result === -1) {
		listResult.marker.setVisible(false);
		} else {
		listResult.marker.setVisible(true);
		}
		return result >= 0;
		});
	});
}