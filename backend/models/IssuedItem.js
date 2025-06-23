import mongoose from "mongoose";

const IssuedItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemCode: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  issuedTo: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['issued', 'returned'],
    default: 'issued'
  }
}, {
  timestamps: true
});

const IssuedItem = mongoose.model("IssuedItem", IssuedItemSchema);

export default IssuedItem; 