const mongoose = require('mongoose');

const songDetailsSchema = new mongoose.Schema({
  songId: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, required: true }
});

const markerSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: props => `${props.value} is not a valid latitude value!`
    },
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: props => `${props.value} is not a valid longitude value!`
    },
    min: -180,
    max: 180
  },
  message: { type: String },
  songDetails: {
    type: songDetailsSchema,
    required: true
  },
  reported: { type: Boolean, required: true, default: false }
});

markerSchema.pre('save', function(next) {
  console.log(`Saving marker with coordinates: Latitude ${this.latitude}, Longitude ${this.longitude}`);
  next();
});

markerSchema.post('save', function(doc, next) {
  console.log(`Marker saved with ID: ${doc._id}`);
  next();
});

markerSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving marker: ${error.message}`, error.stack);
    next(error);
  } else {
    next();
  }
});

const Marker = mongoose.model('Marker', markerSchema);

module.exports = Marker;