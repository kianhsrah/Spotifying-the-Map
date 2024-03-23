const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const Marker = require('../models/Marker'); // Ensure Marker model is imported
const router = express.Router();

// Set up Spotify Web API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID, // INPUT_REQUIRED {Spotify Client ID}
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET, // INPUT_REQUIRED {Spotify Client Secret}
});

// Retrieve an access token
spotifyApi.clientCredentialsGrant().then(
    function(data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
        console.error('Something went wrong when retrieving an access token', err);
    }
);

router.get('/searchSpotify', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).send('Query parameter is required');
    }
    try {
        const data = await spotifyApi.searchTracks(query);
        const tracks = data.body.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(', ')
        }));
        res.json(tracks);
    } catch (error) {
        console.error('Error searching Spotify tracks:', error);
        console.error(error.stack);
        res.status(500).send('Error searching for songs');
    }
});

// POST endpoint for creating a new marker
router.post('/markers', async (req, res) => {
    try {
        const { latitude, longitude, message, songDetails } = req.body;
        // Validate the input
        if (!latitude || !longitude || !songDetails || !songDetails.songId || !songDetails.title || !songDetails.artist) {
            console.error('Missing required marker fields');
            return res.status(400).send('Missing required marker fields');
        }
        
        // Create and save the new marker
        const newMarker = new Marker({
            latitude,
            longitude,
            message,
            songDetails
        });
        await newMarker.save();
        
        console.log(`Marker created successfully with ID: ${newMarker._id}`);
        res.status(201).json({ success: true, message: 'Marker created successfully', markerId: newMarker._id });
    } catch (error) {
        console.error('Error creating marker:', error);
        console.error(error.stack);
        res.status(500).send('Error creating marker');
    }
});

// GET endpoint for retrieving all markers
router.get('/markers', async (req, res) => {
  try {
    // Retrieve all markers, selecting only the necessary fields
    const markers = await Marker.find({}, 'latitude longitude message songDetails -_id').exec();
    if (!markers) {
      return res.status(404).json({ message: 'No markers found' });
    }
    console.log(`Retrieved ${markers.length} markers`);
    res.json(markers);
  } catch (error) {
    console.error('Error retrieving markers:', error);
    console.error(error.stack);
    res.status(500).send('Error retrieving markers');
  }
});

// POST endpoint for reporting a marker
router.post('/reportMarker', async (req, res) => {
  const { markerId } = req.body;
  try {
    const marker = await Marker.findByIdAndUpdate(markerId, { $set: { reported: true } }, { new: true });
    if (!marker) {
      console.log(`Marker with ID: ${markerId} not found for reporting.`);
      return res.status(404).send('Marker not found');
    }
    console.log(`Marker with ID: ${markerId} reported successfully.`);
    res.json({ success: true, message: 'Marker reported successfully', markerId: markerId });
  } catch (error) {
    console.error('Error reporting marker:', error);
    console.error(error.stack);
    res.status(500).send('Error reporting marker');
  }
});

// GET endpoint for retrieving reported markers
router.get('/reportedMarkers', async (req, res) => {
  try {
    const reportedMarkers = await Marker.find({ reported: true }).exec();
    if (!reportedMarkers) {
      return res.status(404).json({ message: 'No reported markers found' });
    }
    res.json(reportedMarkers);
  } catch (error) {
    console.error('Error retrieving reported markers:', error);
    console.error(error.stack);
    res.status(500).send('Error retrieving reported markers');
  }
});

// POST endpoint for approving a reported marker
router.post('/approveMarker', async (req, res) => {
  const { markerId } = req.body;
  try {
    await Marker.findByIdAndUpdate(markerId, { $set: { reported: false } });
    res.json({ success: true, message: 'Marker approved successfully' });
  } catch (error) {
    console.error('Error approving marker:', error);
    console.error(error.stack);
    res.status(500).send('Error approving marker');
  }
});

// POST endpoint for removing a reported marker
router.post('/removeMarker', async (req, res) => {
  const { markerId } = req.body;
  try {
    await Marker.findByIdAndRemove(markerId);
    res.json({ success: true, message: 'Marker removed successfully' });
  } catch (error) {
    console.error('Error removing marker:', error);
    console.error(error.stack);
    res.status(500).send('Error removing marker');
  }
});

module.exports = router;