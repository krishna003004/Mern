const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  userId: { type: Number, ref: 'User', required: true },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String
  },
  date: {
    type: Date
  }
});

module.exports = mongoose.model('Session', sessionSchema);