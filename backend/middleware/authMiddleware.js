const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from Authorization Header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get User
        req.user = await User.findById(decoded.id).select("-password");

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};

// Role Based Authorization
const authorize = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize
};