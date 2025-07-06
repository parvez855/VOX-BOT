const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' },
  joinPhrase: { type: String, default: null },
  leavePhrase: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);
