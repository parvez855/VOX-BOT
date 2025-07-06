const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  joinPhrase: String,
  leavePhrase: String,
  language: { type: String, default: 'bn' }
});

module.exports = mongoose.model('User', userSchema);
