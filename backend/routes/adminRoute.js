import express from 'express'
import { addTest, loginAdmin, allTests, appointmentsAdmin, appointmentCancel, adminDashboard, completeAppointment, deleteTest, getAllPrescriptions, deletePrescription, addPatient, getAllPatients, editPatient, deletePatient, getPatientById, downloadPatientsReport, generatePrescriptionReport, addStaff, getAllStaff, deleteStaff } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { changeAvailability } from '../controllers/testController.js'

const adminRouter = express.Router()

adminRouter.post('/add-test', authAdmin, upload.single('image'), addTest)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-tests', authAdmin, allTests)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
adminRouter.post('/complete-appointment', authAdmin, completeAppointment);
adminRouter.post('/delete-test', authAdmin, deleteTest)
adminRouter.get('/prescriptions', authAdmin, getAllPrescriptions);
adminRouter.delete('/prescriptions/:prescriptionId', authAdmin, deletePrescription);
adminRouter.post('/add-patient', authAdmin, addPatient)
adminRouter.get('/all-patient', authAdmin, getAllPatients)
adminRouter.put("/edit-patient/:id", authAdmin, editPatient)
adminRouter.delete("/delete-patient/:id", authAdmin, deletePatient)
adminRouter.get("/patient/:id", authAdmin, getPatientById);
adminRouter.get('/report/patients', authAdmin, downloadPatientsReport);
adminRouter.get('/report/prescriptions/:id', authAdmin, generatePrescriptionReport);

// Staff Management Routes
adminRouter.post('/staff', authAdmin, addStaff);
adminRouter.get('/staff', authAdmin, getAllStaff);
adminRouter.delete('/staff/:id', authAdmin, deleteStaff);

export default adminRouter
