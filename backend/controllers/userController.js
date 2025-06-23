import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import testModel from '../models/testModel.js'
import appointmentModel from '../models/appointmentModel.js'
import Stripe from 'stripe';
import Prescription from "../models/prescriptionModel.js";


// api to register user
const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.json({success:false, message:"Missing Details"})
        }

        // validating email
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Enter a valid email"})
        }

        // validating password
        if(password.length < 8){
            return res.json({success:false, message:"Enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true, token})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api for user login
const loginUser = async (req, res) => {

    try {

        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:"User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            res.json({success:false, message:"Invalid Credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to get user profile data
const getProfile = async (req, res) => {
     try {

        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true, userData})

        
     } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
     }
}

// api to update user profile
const updateProfile = async (req, res) => {
  try {
      const userId = req.userId;
      const { name, phone, address, dob, gender } = req.body;
      const imageFile = req.file;

      if (!name || !phone || !dob || !gender) {
          return res.json({ success: false, message: "Data Missing" });
      }

      await userModel.findByIdAndUpdate(userId, {
          name,
          phone,
          address: JSON.parse(address),
          dob,
          gender,
      });

      if (imageFile) {
          // Upload image to cloudinary
          const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
          const imageURL = imageUpload.secure_url;

          await userModel.findByIdAndUpdate(userId, { image: imageURL });

          // Send response and stop here
          return res.json({ success: true, message: "Profile Updated" });
      }

      // Only one res.json if no image
      res.json({ success: true, message: "Profile Updated" });

  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
}



// api to book appointment
const bookAppointment = async (req, res) => {

    try {

      const userId = req.userId
         /* const testId = req.testId
        const slotDate = req.body
        const slotTime = req.body */
        const {  testId, slotDate, slotTime } = req.body;

        const testData = await testModel.findById(testId).select('-password')
       

        //console.log(testData)
    
        if(!testData.available){
            return res.json({success:false, message:"Test not available"})
        }
        
        let slots_booked = testData.slots_booked

        // checking for slots availability
    if(slots_booked[slotDate]){
        if(slots_booked[slotDate].includes(slotTime)){
            return res.json({success:false, message:"Slot not available"})
        } else {
            slots_booked[slotDate].push(slotTime)
        }
    } else {
        slots_booked[slotDate] = []
        slots_booked[slotDate].push(slotTime)
    }

    const userData = await userModel.findById(userId).select('-password')

    delete testData.slots_booked
     /* // For an object with test objects as properties
Object.keys(testData).forEach(testKey => {
    delete testData[testKey].slots_booked;
  }); */

  const appointmentData = {
    userId,
    testId,
    userData,
    testData,
    amount:testData.fees,
    slotTime,
    slotDate,
    date:Date.now()
  }

  const newAppointment = new appointmentModel(appointmentData)
  await newAppointment.save()

  // save new slots data in test data
  await testModel.findByIdAndUpdate(testId,{slots_booked})

  res.json({success:true, message:"Appointment Booked"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to get user appointments for frontend my appointment page
const listAppointment = async (req, res) => {

    try {
        const userId = req.userId
        const appointments = await appointmentModel.find({userId})

        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// api to cancel the appointment
const cancelAppointment = async(req,res) => {
    try {

        console.log("userId:", req.userId);
    console.log("body:", req.body);

        //const {userId, appointmentId} = req.body
        //const {appointmentId} = req.body
        const userId = req.userId
        const {appointmentId} = req.body

         // Make sure userId and appointmentId are provided
         if (!userId || !appointmentId) {
            return res.status(400).json({ success: false, message: "Missing user or appointment ID" });
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        
if (!appointmentData) {
    return res.status(404).json({ success: false, message: "Appointment not found" });
  }

        // verify appointment user
        if(appointmentData.userId.toString() !== userId){
            return res.json({success:false, message:"Unauthorized Action"})
        }

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

// DELETE Appointment API
const deleteAppointment = async (req, res) => {
    try {
      const userId = req.userId;
      const { appointmentId } = req.body;
  
      // Validate required fields
      if (!userId || !appointmentId) {
        return res.status(400).json({ success: false, message: "Missing user or appointment ID" });
      }
  
      // Fetch the appointment
      const appointmentData = await appointmentModel.findById(appointmentId);
      if (!appointmentData) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }
  
      // Check if the appointment belongs to the user
      if (appointmentData.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized Action" });
      }
  
      // Release slot from test data if not already cancelled
      const { testId, slotDate, slotTime } = appointmentData;
      const testData = await testModel.findById(testId);
  
      if (testData && testData.slots_booked?.[slotDate]) {
        testData.slots_booked[slotDate] = testData.slots_booked[slotDate].filter(e => e !== slotTime);
        if (testData.slots_booked[slotDate].length === 0) {
          delete testData.slots_booked[slotDate]; // Clean up empty date
        }
  
        await testModel.findByIdAndUpdate(testId, { slots_booked: testData.slots_booked });
      }
  
      // Delete the appointment
      await appointmentModel.findByIdAndDelete(appointmentId);
  
      return res.json({ success: true, message: "Appointment Deleted" });
    } catch (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };


//payment

/*
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Medical Lab Test Appointment',
          },
          unit_amount: amount * 100, // Convert dollars to cents
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/payment-success?appointmentId=${appointmentId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
      metadata: {
        appointmentId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const appointmentId = session.metadata.appointmentId;

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      payment: true
    });
  }

  res.status(200).send('Webhook received');
};

*/

// controllers/prescriptionController.js


 const uploadPrescription = async (req, res) => {
  try {
    // Assuming you're getting the prescription info from the request body
    const { patientName, patientEmail, patientAddress, patientPhone } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "prescriptions" // Optional: specify a folder in Cloudinary
    });

    // Get the URL of the uploaded image
    const imageUrl = result.secure_url;

    // Save prescription to the database (you can modify the fields as needed)
    const newPrescription = new Prescription({
      patientName,
      patientPhone,
      patientEmail,
      patientAddress,
      prescriptionImage:imageUrl,
    });

    await newPrescription.save();

    // Send back the prescription with the image URL
    res.json({ success: true, message: "Prescription uploaded successfully", data: newPrescription });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error uploading prescription" });
  }
};





export {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, deleteAppointment, uploadPrescription }