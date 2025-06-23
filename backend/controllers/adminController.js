import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import testModel from '../models/testModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import Prescription from '../models/prescriptionModel.js'
import Patient from '../models/patientModel.js'
import mongoose from 'mongoose'
//import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { Readable } from 'stream';
import fs from 'fs';
import Staff from '../models/staffModel.js'

// api for adding test
const addTest = async (req, res) => {
    try {
        const {name, code, password, category, extra, about, fees, conditions} = req.body
        const imageFile = req.file

        // checking for all data to add test
        if(!name || !category ||  !about || !fees || !extra || !conditions ){
            return res.json({success: false, message: "Missing Details"})
        }

        // validating code
        if(!validator.isEmail(code)){
            return res.json({success: false, message: "Please enter a valid code"})
        }

      /* // validating password
        if(password.length < 8){
            return res.json({success: false, message: "Please enter a strong password"})
        }  */

        // hashing test password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt) 

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
        const imageUrl = imageUpload.secure_url

        const testData = {
            name,
            code,
            image:imageUrl,
            password:hashedPassword,
            category,
            extra,
            about,
            fees,
            conditions:JSON.parse(conditions),
            date:Date.now()
        }

        const newTest = new testModel(testData)
        await newTest.save()

        res.json({success:true, message:"Test Added"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api for the admin login
const loginAdmin = async (req, res) => {
    try {

        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success:true, token})

        } else {
            res.json({success:false, message:"Invalid Credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to get all tests list for admin panel
const allTests = async (req, res) => {
    try {
        const tests = await testModel.find({}).select('-password')
    res.json({success:true, tests})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to get all appointments list
const appointmentsAdmin = async (req, res)=> {

    try {

        const appointments = await appointmentModel.find({})
        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to cancel appointment cancellation
const appointmentCancel = async(req,res) => {
    try {

        const {appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        // releasing test slot
        const {testId, slotDate, slotTime} = appointmentData

        const testData = await testModel.findById(testId)

        let slots_booked = testData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e!== slotTime)

        await testModel.findByIdAndUpdate(testId,{slots_booked})

        res.json({success:true, message:"Appointment Cancelled"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const tests = await testModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            tests: tests.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success:true, dashData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

 /*// api to mark appointment completed
const appointmentComplete = async () => {
    try {
        const {appointmentId, testId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData && appointmentData.testId === testId)
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
} */

// api to mark appointment as completed
 const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

        res.json({ success: true, message: "Appointment Completed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const deleteTest = async (req, res) => {
    try {
      const { testId } = req.body;  // Get the test ID from the request body
  
      // Check if the test ID is provided
      if (!testId) {
        return res.status(400).json({ success: false, message: "Test ID is required" });
      }
  
      // Attempt to delete the test by its ID
      const test = await testModel.findByIdAndDelete(testId);
  
      // Check if the test was found and deleted
      if (!test) {
        return res.status(404).json({ success: false, message: "Test not found" });
      }
  
      // Return a success response
      return res.json({ success: true, message: "Test Deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  


// Controller function to get all prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    // Fetch all prescriptions from the database
    const prescriptions = await Prescription.find();

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
    });
  }
};


 const deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params; // Get the prescription ID from the request params

    // Find and delete the prescription
    const deletedPrescription = await Prescription.findByIdAndDelete(prescriptionId);

    if (!deletedPrescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    return res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


const addPatient = async (req, res) => {
    try {
        const { Rname, Rnic, Rage, Rgender, Remail, Raddress, Rmobile } = req.body;

        if (!Rnic) {
            return res.status(400).json({ message: "NIC is required." });
        }

        const existingPatient = await Patient.findOne({ Rnic: Rnic });
        if (existingPatient) {
            return res.status(400).json({ message: "A patient with this NIC already exists." });
        }

        const newPatient = new Patient({
            Rname,
            Rnic,
            Rage,
            Rgender,
            Remail,
            Raddress,
            Rmobile
        });

        await newPatient.save();

        res.status(201).json({success:true, message: "Patient added successfully!", patient: newPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message: "Error adding patient", error: error.message });
    }
};


// Controller function to get all patients
 const getAllPatients = async (req, res) => {
    try {
        // Fetch all patients from the database
        const patients = await Patient.find();

        // Check if there are no patients
        if (patients.length === 0) {
            return res.status(404).json({ message: "No patients found." });
        }

        // Send a success response with the patients data
        res.status(200).json({success:true, message: "Patients retrieved successfully", patients });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({success:false, message: "Error retrieving patients", error: error.message });
    }
};


// Controller function to edit patient data
 const editPatient = async (req, res) => {
    try {
        const { Rname, Rnic, Rage, Rgender, Remail, Raddress, Rmobile } = req.body;
        const { id } = req.params;  // Assuming you're using the patient's unique ID as a parameter in the URL

        // Find the patient by ID (or you can use NIC if preferred)
        const patient = await Patient.findById(id);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Update the patient's information
        patient.Rname = Rname || patient.Rname;
        patient.Rnic = Rnic || patient.Rnic;  // Usually NIC is unique, you may want to avoid changing it
        patient.Rage = Rage || patient.Rage;
        patient.Rgender = Rgender || patient.Rgender;
        patient.Remail = Remail || patient.Remail;
        patient.Raddress = Raddress || patient.Raddress;
        patient.Rmobile = Rmobile || patient.Rmobile;

        // Save the updated patient
        await patient.save();

        // Send a success response
        res.status(200).json({success:true, message: "Patient updated successfully", patient });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({success:false, message: "Error updating patient", error: error.message });
    }
};



// Controller function to delete a patient
 const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;  // Getting the patient ID from the URL parameter

        // Find and delete the patient by ID
        const patient = await Patient.findByIdAndDelete(id);

        if (!patient) {
            return res.status(404).json({success:false, message: "Patient not found" });
        }

        // Send a success response
        res.status(200).json({success:true, message: "Patient deleted successfully" });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({success:false, message: "Error deleting patient", error: error.message });
    }
};


// Controller function to get a single patient by ID
const getPatientById = async (req, res) => {
    const { id } = req.params;
  
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({success:false, message: "Invalid patient ID format" });
    }
  
    try {
      // Query the patient by ID
      const patient = await Patient.findById(id);
  
      // If patient is not found
      if (!patient) {
        return res.status(404).json({success:false, message: "Patient not found" });
      }
  
      // Return the patient data
      res.status(200).json({ success:true, message: "Patient retrieved successfully", patient });
    } catch (error) {
      // Log and handle errors (could include things like database connection issues)
      console.error(error);
      res.status(500).json({ success:false, message: "Error retrieving patient", error: error.message });
    }
  };

  const downloadPatientsReport = async (req, res) => {
    try {
      const patients = await Patient.find().lean();
  
      if (!patients.length) {
        return res.status(404).json({ success: false, message: "No patients to generate report." });
      }
  
      // Format data
      const data = patients.map(patient => ({
        Name: patient.Rname,
        NIC: patient.Rnic,
        Age: patient.Rage,
        Gender: patient.Rgender,
        Email: patient.Remail,
        Address: patient.Raddress,
        Mobile: patient.Rmobile,
      }));
  
      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
  
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  
      // Set headers
      res.setHeader("Content-Disposition", "attachment; filename=patients_report.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  
      // Send buffer
      return res.send(buffer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Error generating report", error: error.message });
    }
  }; 

  // Inside adminController.js
/*import PDFDocument from 'pdfkit';
import fs from 'fs';

 const generatePatientReport = async (req, res) => {
  try {
    const { name, nic, age, gender, email, address, mobile } = req.body;

    const doc = new PDFDocument();

    // Set headers for browser to download the file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${name}_report.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(18).text('Patient Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`NIC: ${nic}`);
    doc.text(`Age: ${age}`);
    doc.text(`Gender: ${gender}`);
    doc.text(`Email: ${email}`);
    doc.text(`Address: ${address}`);
    doc.text(`Mobile: ${mobile}`);

    doc.end(); // Finalize the PDF
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};
*/


 const generatePrescriptionReport = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=prescription_${id}.pdf`,
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    // Title
    doc.fontSize(18).text('Prescription Report', { align: 'center' }).moveDown();

    // Patient Info
    doc.fontSize(12).text(`Name: ${prescription.patientName}`);
    doc.text(`Email: ${prescription.patientEmail}`);
    doc.text(`Phone: ${prescription.patientPhone}`);
    doc.text(`Address: ${prescription.patientAddress}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleString()}`).moveDown();

    // Add image if exists
    if (prescription.prescriptionImage) {
      const imageUrl = prescription.prescriptionImage;
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
    } else {
      doc.text('No prescription image available.');
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};

// Staff Management Controllers

// Add new staff member
const addStaff = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, nic, dateOfBirth } = req.body

        // Validate required fields
        if (!name || !email || !password || !role || !phone || !address || !nic || !dateOfBirth) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        // Check if staff with same email or NIC already exists
        const existingStaff = await Staff.findOne({ $or: [{ email }, { nic }] })
        if (existingStaff) {
            return res.status(400).json({ success: false, message: "Staff member with this email or NIC already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new staff member
        const newStaff = new Staff({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            address,
            nic,
            dateOfBirth
        })

        await newStaff.save()

        res.status(201).json({ success: true, message: "Staff member added successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get all staff members
const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find().select('-password')
        res.json({ success: true, staff })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Delete staff member
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params

        const staff = await Staff.findByIdAndDelete(id)
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" })
        }

        res.json({ success: true, message: "Staff member deleted successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export {addTest, loginAdmin, allTests, 
    appointmentsAdmin, appointmentCancel, adminDashboard, completeAppointment, 
    deleteTest, 
    deletePrescription, 
    addPatient, getAllPatients, editPatient, deletePatient, getPatientById, downloadPatientsReport, generatePrescriptionReport, addStaff, getAllStaff, deleteStaff}