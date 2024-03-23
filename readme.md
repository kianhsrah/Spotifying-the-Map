# Spotifying the Map

Spotifying the Map is a web-based application that merges the joy of music with the discovery of new locations. Users can anonymously place markers on a global map, each marker containing a message and a song from Spotify, creating a unique way to share and discover music and sentiments across the globe.

## Overview

The application's backend is constructed with the Node.js/Express framework, leveraging MongoDB for database management and Mongoose ORM for data modeling. The frontend is developed using Vanilla JS for interactivity and Bootstrap for styling. Integration with Mapbox provides the interactive map functionality, while the Spotify Web API enables song search and attachment to markers.

## Features

- **Interactive Map Display**: Users navigate a global map to explore or zoom into locations.
- **Marker Placement**: Click or tap to place markers on the map.
- **Message Association**: Users can attach messages to their markers.
- **Spotify Song Search and Attachment**: Search for and attach a Spotify song to a marker.
- **Marker Interaction**: View messages and song details by interacting with markers.
- **Moderation**: Report inappropriate markers, messages, or songs.

## Getting started

### Requirements

- Node.js
- MongoDB
- A Spotify Developer account for API credentials

### Quickstart

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up your `.env` file based on `.env.example`.
4. Run the server with `npm start`.

### License

Copyright (c) 2024.