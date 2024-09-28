var map;

// Initialize and add the map
function initMap() {
  // Default to Florida in case geolocation fails
  const floridaCenter = { lat: 27.9944024, lng: -81.7602544 };
  
  // Initialize the map, centered in Florida by default
  map = new google.maps.Map(document.getElementById("map"), {
    center: floridaCenter,
    zoom: 6, // Default zoom level for Florida
  });

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

function handleLocationError(browserHasGeolocation, pos) {
  alert(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
}
function findNearbyShelters(userLocation) {
    const request = {
      location: userLocation,
      radius: '50000', // 50 km radius (can adjust for larger searches)
      keyword: 'emergency shelter', // Search term for shelter locations
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
      } else {
        console.log('No nearby shelters found');
      }
    });
  }
  function createMarker(place) {
    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
    });

    // Show shelter info when the marker is clicked
    google.maps.event.addListener(marker, 'click', function () {
      const infowindow = new google.maps.InfoWindow({
        content: place.name,
      });
      infowindow.open(map, marker);
    });
  }
  function showEscapeRoute(userLocation) {
    const destination = { lat: 27.950575, lng: -82.457178 }; // Example shelter location (Tampa, Florida)

    const request = {
      origin: userLocation,
      destination: destination, // You can dynamically find the closest shelter here
      travelMode: 'DRIVING',
    };

    directionsService.route(request, function (result, status) {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
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