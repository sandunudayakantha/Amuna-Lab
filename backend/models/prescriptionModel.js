import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: {type: String,required: true, trim: true,},
    patientEmail: {type: String,required: true,trim: true,lowercase: true,},
    patientPhone: {type: String,required: true,trim: true,},
    patientAddress: {type: String,required: true,trim: true,},
    prescriptionImage: {type: String,required: true,},
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
