import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      iat: number;
      exp: number;
    };

    if (!decoded) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      res.status(401).json({ error: "Token expired" });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};
