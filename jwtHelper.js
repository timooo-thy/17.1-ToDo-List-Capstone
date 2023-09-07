import jwt from "jsonwebtoken";
import { config } from 'dotenv';
config();

const SECRET = process.env.JWT_SECRET;

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET, {
    expiresIn: '1h',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
