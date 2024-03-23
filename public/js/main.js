// Initialize Mapbox
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // map style to be used
    center: [-74.44875, 40.49926], // starting position [lng, lat]
    zoom: 13 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl()); // Adds zoom in/out and rotation controls to the map

map.on('load', function() {
    console.log('Mapbox map loaded successfully');
    loadMarkers(); // Load markers when the map is loaded
});

map.on('error', function(e) {
    console.error('Mapbox map failed to load:', e.error);
});

// Function to create a form popup
function createFormPopup(lat, lng) {
    const popupContent = document.createElement('div');
    popupContent.innerHTML = `
        <form id="markerForm">
            <label for="message">Message:</label>
            <input type="text" id="message" name="message" required>
            <label for="songSearch">Search for a song:</label>
            <input type="text" id="songSearch" name="songSearch" required>
            <div id="songSearchResults"></div>
            <button type="submit">Submit</button>
        </form>
    `;
    return popupContent;
}

map.on('click', function (e) {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    
    // Create a popup form
    const popup = new mapboxgl.Popup()
        .setLngLat([lng, lat])
        .setDOMContent(createFormPopup(lat, lng))
        .addTo(map);

    document.getElementById('markerForm').addEventListener('submit', function(event) {
        event.preventDefault();
        // Gather form data and handle marker creation
        const message = document.getElementById('message').value;
        const songSearch = document.getElementById('songSearch').value;
        console.log(`Message: ${message}, Song Search: ${songSearch}, Latitude: ${lat}, Longitude: ${lng}`);
        searchSpotifySong(songSearch); // Search Spotify when the form is submitted
    });
});

function searchSpotifySong(songSearchQuery) {
    axios.get(`/api/searchSpotify?query=${encodeURIComponent(songSearchQuery)}`)
        .then(function (response) {
            const searchResults = response.data;
            displaySongSearchResults(searchResults);
        })
        .catch(function (error) {
            console.error('Error searching for song:', error);
        });
}

function displaySongSearchResults(searchResults) {
    const resultsContainer = document.getElementById('songSearchResults');
    resultsContainer.innerHTML = ''; // Clear previous results
    searchResults.forEach(function(song) {
        const songElement = document.createElement('div');
        songElement.textContent = `${song.artist} - ${song.title}`;
        songElement.onclick = function() {
            console.log(`Selected song: ${song.id}`);
            // Implement logic to handle song selection and populate form with selected song details
            document.getElementById('songSearch').value = `${song.artist} - ${song.title}`;
            // Store selected song details for submission
            document.getElementById('markerForm').dataset.songId = song.id;
            document.getElementById('markerForm').dataset.songTitle = song.title;
            document.getElementById('markerForm').dataset.songArtist = song.artist;
        };
        resultsContainer.appendChild(songElement);
    });
}

function submitMarkerData(lat, lng, message, songDetails) {
    axios.post('/api/markers', {
        latitude: lat,
        longitude: lng,
        message: message,
        songDetails: {
            songId: songDetails.songId,
            title: songDetails.songTitle,
            artist: songDetails.songArtist
        }
    })
    .then(function (response) {
        console.log('Marker submitted successfully:', response.data);
        loadMarkers(); // Reload markers to display the new one
    })
    .catch(function (error) {
        console.error('Error submitting marker:', error.response.data);
    });
}

function loadMarkers() {
  axios.get('/api/markers')
    .then(function (response) {
      const markers = response.data;
      markers.forEach(function(marker) {
        // Create a popup for each marker
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>Message</h3><p>${marker.message}</p>` +
          `<h4>Song</h4><p>${marker.songDetails.artist} - ${marker.songDetails.title}</p>` +
          `<button onclick="reportMarker('${marker._id}')">Report</button>` // Corrected line for report button
        );

        // Add a marker to the map
        new mapboxgl.Marker()
          .setLngLat([marker.longitude, marker.latitude])
          .setPopup(popup) // sets a popup on this marker
          .addTo(map);
      });
    })
    .catch(function (error) {
      console.error('Error loading markers:', error);
    });
}

function reportMarker(markerId) {
  axios.post('/api/reportMarker', { markerId: markerId })
    .then(function(response) {
      console.log('Marker reported successfully:', response.data);
      alert('Marker has been reported.');
    })
    .catch(function(error) {
      console.error('Error reporting marker:', error);
    });
}