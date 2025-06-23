import mongoose from 'mongoose'

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Lab Technician', 'Receptionist']
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    nic: {
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Staff = mongoose.model('Staff', staffSchema)

export default Staff 