import mongoose from "mongoose";

const testSchema = new mongoose.Schema({

    name: {type: String, required:true},
    code: {type: String, unique:true},
    password: {type: String},
    image: {type: String, required:true},
    category: {type: String, required:true},
    extra: {type: String, required:true},
    about: {type: String, required:true},
    available: {type: Boolean, default:true},
    fees: {type: Number, required:true},
    conditions: {type: Object, required:true},
    date: {type: Number, required:true},
    slots_booked: {type: Object, default:{}},

}, {minimize:false})

const testModel = mongoose.model.test ||  mongoose.model('test', testSchema)

export default testModel