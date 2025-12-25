import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "shubh7124";
export const PORT = process.env.PORT || 3000;
