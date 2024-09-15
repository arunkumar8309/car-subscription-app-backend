const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  carType: {
    type: String,
    enum: ['Hatchback', 'Sedan', 'CSUV', 'SUV'],
    required: true
  },
  planType: {
    type: String,
    enum: ['Daily', 'Alternate'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    enum: ['6-8 AM', '8-10 AM', '10-12 AM'],
    required: true
  },
  services: [
    {
      date: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        enum: ['Interior Cleaning', 'Exterior Cleaning', 'Off Day'],
        required: true
      }
    }
  ]
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
