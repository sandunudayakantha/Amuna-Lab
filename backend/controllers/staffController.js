import Staff from '../models/staffModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Staff Login
export const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if staff exists
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, staff.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: staff._id, role: staff.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const { password: _, ...staffWithoutPassword } = staff.toObject();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            staff: staffWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Staff Profile
export const getStaffProfile = async (req, res) => {
    try {
        const staff = await Staff.findById(req.staff.id).select('-password');
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.status(200).json({ success: true, staff });
    } catch (error) {
        console.error('Get staff profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateStaffProfile = async (req, res) => {
    try {
        const { name, email, phone, address, nic, dateOfBirth } = req.body;
        const staffId = req.staff._id;

        // Check if email is being updated and if it's already taken
        if (email) {
            const existingStaff = await Staff.findOne({ email, _id: { $ne: staffId } });
            if (existingStaff) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already in use' 
                });
            }
        }

        // Check if NIC is being updated and if it's already taken
        if (nic) {
            const existingStaff = await Staff.findOne({ nic, _id: { $ne: staffId } });
            if (existingStaff) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'NIC already in use' 
                });
            }
        }

        // Update staff profile
        const updatedStaff = await Staff.findByIdAndUpdate(
            staffId,
            {
                name,
                email,
                phone,
                address,
                nic,
                dateOfBirth
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedStaff) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            staff: updatedStaff
        });
    } catch (error) {
        console.error('Error updating staff profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile',
            error: error.message 
        });
    }
}; 