const mongoose = require('mongoose');

const gcblevelSchema = new mongoose.Schema({
  userId: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
});

module.exports = mongoose.model('GCBLevel', gcblevelSchema);