const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // ไม่มี Authorization Header
        if (!authHeader) {
            return res.status(401).json({
                message: "Access token required",
            });
        }

        // ต้องอยู่ในรูปแบบ Bearer TOKEN
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid authorization format",
            });
        }

        const token = parts[1];

        // ตรวจสอบ JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // เก็บข้อมูลจาก JWT ไว้ใน req.user
        req.user = decoded;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = authenticateToken;