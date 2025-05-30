import { Request, Response } from "express";
import logger from "../../logger/logger";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/config";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email, and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({ error: "User doesn't exists" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.name,
    };

    const token = jwt.sign(payload, config.jwtsecret, {
      expiresIn: "30d",
    });

    res.status(201).json({ message: "User logged in successfully", token });
  } catch (error) {
    logger.error(`Error in register API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
