import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    Rname: {type: String, required: true},
    Rnic: {type: String, required: true, unique: true},
    Rage: {type: String, required: true},
    Rgender: {type: String, required: true},
    Remail: {type: String, required: true},
    Raddress: {type: String, required: true},
    Rmobile:{type:String, required:true}
})


const Patient = mongoose.model('Patient', patientSchema);

export default Patient;