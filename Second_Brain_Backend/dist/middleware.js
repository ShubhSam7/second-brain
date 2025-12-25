import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
export const auth = (req, res, next) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "No token provided",
            });
            return;
        }
        // Remove 'Bearer ' prefix if present
        const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        const decoded = jwt.verify(actualToken, JWT_SECRET);
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
