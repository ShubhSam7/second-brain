import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config";

export const auth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers['authorization'];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

        // Remove 'Bearer ' prefix if present
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        const decoded = jwt.verify(actualToken, JWT_SECRET) as { id: string };

        //@ts-ignore
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
