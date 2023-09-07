import express from 'express';
import { verifyToken } from './jwtHelper';

export const authenticate = (req, res, next) => {
    const token = req.cookies.token; // Assuming you store token in a cookie

    if (!token) {
        return res.status(403).send("Token is required.");
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.id; // store user id in the request object for future use
        next();
    } catch (error) {
        res.status(401).send("Invalid token.");
    }
};