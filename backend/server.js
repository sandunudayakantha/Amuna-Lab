import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import testRouter from './routes/testRoute.js'
import userRouter from './routes/userRoutes.js'
import userCRUDRouter from './routes/userCRUDRoutes.js'
import inventoryRouter from './routes/inventoryRoutes.js'
import testTemplateRoutes from "./routes/testTemplate.routes.js";
import testReportRoutes from "./routes/testReport.route.js";
import reportRoutes from "./routes/reports.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from './routes/payment.routes.js';
import aiAnalysisRoutes from './routes/aiAnalysisRoutes.js';
import staffRouter from './routes/staffRoute.js';
import receptionistRouter from './routes/receptionistRoute.js';

// app config
const app = express()
const port = process.env.PORT || 5002

// middleware
app.use(express.json())
app.use(cors())

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// api endpoints
app.use('/api/admin', adminRouter) // localhost:5002/api/admin/add-test
app.use('/api/test', testRouter) // get tests to frontend
app.use('/api/user', userRouter) // user register and login
app.use('/api/users', userCRUDRouter) // user CRUD operations
app.use('/api/inventory', inventoryRouter) // inventory management
app.use('/api/invoices', invoiceRoutes) // invoice management
app.use('/api/testTemplates', testTemplateRoutes) // test templates management
app.use("/api/testReports", testReportRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai-analysis", aiAnalysisRoutes); // Mount AI analysis routes with prefix
app.use("/api/staff", staffRouter); // Staff authentication and management
app.use('/api/receptionist', receptionistRouter);

app.get('/', (req, res)=>{
    res.send('API WORKING')
})

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
