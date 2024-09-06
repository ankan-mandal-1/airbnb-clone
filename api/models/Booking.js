const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Place"
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    numberOfGuests: {
        type: String,
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

const BookingModel = mongoose.model("Booking", bookingSchema);

module.exports = BookingModel;