import Appointment from '../models/appointmentModel.js';
import Invoice from '../models/invoiceModel.js';

// Get today's appointments count
export const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await Appointment.countDocuments({
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        res.json({ success: true, count });
    } catch (error) {
        console.error('Error fetching today appointments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get pending invoices count
export const getPendingInvoices = async (req, res) => {
    try {
        const count = await Invoice.countDocuments({ status: 'pending' });
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error fetching pending invoices:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get total revenue
export const getTotalRevenue = async (req, res) => {
    try {
        const result = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const amount = result.length > 0 ? result[0].total : 0;
        res.json({ success: true, amount });
    } catch (error) {
        console.error('Error fetching total revenue:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
    try {
        const activities = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('patientName doctorName service createdAt')
            .lean();

        const formattedActivities = activities.map(activity => ({
            description: `${activity.service} with Dr. ${activity.doctorName}`,
            patientName: activity.patientName,
            timestamp: new Date(activity.createdAt).toLocaleString()
        }));

        res.json({ success: true, activities: formattedActivities });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            date: { $gte: today }
        })
        .sort({ date: 1 })
        .limit(5)
        .select('patientName doctorName service date time')
        .lean();

        const formattedAppointments = appointments.map(appointment => ({
            doctorName: appointment.doctorName,
            service: appointment.service,
            patientName: appointment.patientName,
            time: new Date(appointment.date).toLocaleDateString() + ' ' + appointment.time
        }));

        res.json({ success: true, appointments: formattedAppointments });
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}; 