import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        const token = req.headers['token']
        if(!token){
            return res.json({success:false, message:"Not Authorized Login Again"})
        }
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = token_decode.id
        next()
        
    } catch (error) {
        console.log("JWT Error:", error.message)
        res.json({success:false, message: "Authentication failed. Please login again."})
    }
}

export default authUser