import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/token";
import { prisma } from "../../lib/prisma";
import logger from "../../logger/logger";

export const getRepositories = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const repositories = await prisma.repository.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ repositories });
  } catch (error) {
    logger.error(`Error in getRepositories API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRepository = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;

  try {
    const repository = await prisma.repository.findUnique({
      where: { id, userId: req.user.id },
    });

    if (!repository) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    res.status(200).json({ repository });
  } catch (error) {
    logger.error(`Error in getRepository API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createRepository = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { name, description, url } = req.body;

    if (!name) {
      res.status(400).json({ error: "Repository name is required" });
      return;
    }

    const newRepository = await prisma.repository.create({
      data: {
        name,
        description: description || "",
        url: url || "",
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Repository created successfully",
      repository: newRepository,
    });
  } catch (error) {
    logger.error(`Error in createRepository API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateRepository = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;
  const body = req.body;

  try {
    const repository = await prisma.repository.findUnique({
      where: { id, userId: req.user.id },
    });

    if (!repository) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const updatedRepository = await prisma.repository.update({
      where: { id },
      data: body,
    });

    res.status(200).json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    logger.error(`Error in updateRepository API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteRepository = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;

  try {
    const repository = await prisma.repository.findUnique({
      where: { id, userId: req.user.id },
    });

    if (!repository) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    await prisma.repository.delete({ where: { id } });

    res.status(200).json({ message: "Repository deleted successfully" });
  } catch (error) {
    logger.error(`Error in deleteRepository API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
