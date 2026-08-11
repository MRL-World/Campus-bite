const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    mealId: String,
    name: String,
    category: String,
    price: Number,
    quantity: Number
  }],
  addons: [{ name: String, price: Number, quantity: Number }],
  packagePlan: { type: String, default: 'Single Order' },
  pickupDate: { type: Date, required: true },
  pickupSlot: { type: String, required: true },
  note: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
