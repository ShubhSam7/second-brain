import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { jwt_SECRET } from "./config"

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']
    const decoded = jwt.verify(token as string, jwt_SECRET)
    if(decoded){
        //@ts-ignore
        req.userId = decoded.id
        next()
    }
    else{
        res.status(403).json({
            message: 'You are not logged in'
        })
    }
};
