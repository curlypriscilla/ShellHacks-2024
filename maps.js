let map, directionsService, directionsRenderer;

// Initialize and add the map
async function initMap() {
  // Default to Florida in case geolocation fails
  const floridaCenter = { lat: 27.9944024, lng: -81.7602544 };
  
  // Initialize the map, centered in Florida by default
  map = new google.maps.Map(document.getElementById("map"), {
    center: floridaCenter,
    zoom: 6, // Default zoom level for Florida
  });

  // Load the Places library using the new importLibrary function
  const { PlacesService } = await google.maps.importLibrary("places");

  // Initialize Directions Service and Renderer
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Check if the browser supports geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Center the map on the user's location
        map.setCenter(userLocation);
        map.setZoom(10);  // Adjust zoom level to focus on the user's area

        // Add a marker at the user's location
        const marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
        });

        // Create a circle around the user's location with a radius of 50 miles (~80467 meters)
        const circle = new google.maps.Circle({
          map: map,
          radius: 80467, // 50 miles in meters
          fillColor: '#AA0000',
          strokeColor: '#AA0000',
          fillOpacity: 0.2,
          strokeOpacity: 0.5,
        });
        circle.bindTo('center', marker, 'position');

        // Find nearby shelters and show the escape route
        findNearbyShelters(userLocation, PlacesService);
      },
      function () {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }
}
async function findNearbyShelters(userLocation, PlacesService) {
  // Create an instance of PlacesService correctly
  const service = new google.maps.places.PlacesService(map);

  const request = {
    location: userLocation,
    radius: '50000', // 50 km radius (can adjust for larger searches)
    keyword: 'senior high','shelter':'university' // Search term for shelter locations
  };

  service.nearbySearch(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i], userLocation);
      }
    } else {
      console.log('No nearby shelters found');
    }
  });
}

function createMarker(place, userLocation) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
  });

  // Create an InfoWindow to display shelter name and route info
  const infowindow = new google.maps.InfoWindow();

  // When the user clicks on the marker, show the InfoWindow and calculate route
  google.maps.event.addListener(marker, 'click', function () {
    // Show shelter name in the InfoWindow initially
    infowindow.setContent(`<strong>${place.name}</strong><br>Calculating route...`);
    infowindow.open(map, marker);

    // Draw the route and update the InfoWindow with travel time and distance
    showEscapeRouteToShelter(userLocation, place.geometry.location, infowindow, place.name, marker);
  });
}

  function showEscapeRouteToShelter(userLocation, destination, infowindow, placeName, marker) {
    let destinationLatLng;
  
    // Check if destination is a google.maps.LatLng object or LatLngLiteral
    if (typeof destination.lat === 'function' && typeof destination.lng === 'function') {
      // If it's a google.maps.LatLng object, use .lat() and .lng() methods
      destinationLatLng = {
        lat: destination.lat(),
        lng: destination.lng(),
      };
    } else {
      // Otherwise, assume it's already a LatLngLiteral
      destinationLatLng = {
        lat: destination.lat,
        lng: destination.lng,
      };
    }
  
    const request = {
      origin: userLocation,
      destination: destinationLatLng, // Ensure it's in the correct LatLngLiteral format
      travelMode: 'DRIVING',
    };
  
    directionsService.route(request, function (result, status) {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
  
        // Get the duration (time it takes) and distance from the first leg of the route
        const route = result.routes[0];
        const leg = route.legs[0]; // Assume there's only one leg, as it's a direct route
  
        // Extract travel time and distance
        const travelTime = leg.duration.text;
        const travelDistance = leg.distance.text;
  
        // Ensure infowindow is still valid before setting content
        if (!infowindow) {
          console.error('Error: InfoWindow is undefined when setting content.');
          return;
        }
  
        // Update the InfoWindow with the travel time and distance
        infowindow.setContent(`
          <strong>${placeName}</strong><br>
          Estimated travel time: ${travelTime}<br>
          Distance: ${travelDistance}
        `);
        infowindow.open(map, marker);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

function handleLocationError(browserHasGeolocation, pos) {
  alert(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
}