import jwt from 'jsonwebtoken';

export const authStaff = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'Lab Technician' && decoded.role !== 'Receptionist') {
            return res.status(403).json({ message: 'Access denied. Staff only.' });
        }

        req.staff = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 