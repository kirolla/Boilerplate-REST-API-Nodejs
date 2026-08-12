import type { Response } from "express";
import fs from "node:fs/promises";

import { v2 as cloudinary } from "cloudinary";

import prisma from "../../prisma/client.ts";

import type { AuthRequest } from "../middleware/authenticate.ts";

import type {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  GetAnnouncementsQuery,
} from "../validators/announcements.validator.ts";

import logger from "../logger.ts";


// CLOUDINARY CONFIGURATION

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// CREATE ANNOUNCEMENT

export async function createAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  let localFilePath: string | undefined;

  try {
    const data = req.body as CreateAnnouncementDto;

    const file = req.file;

    if (file) {
      localFilePath = file.path;
    }

    let imageUrl: string | undefined;

    // Upload image to Cloudinary
    if (file) {
      const result = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "announcements",
        },
      );

      imageUrl = result.secure_url;

      logger.info(
        {
          userId: req.user?.id,
          imageUrl,
        },
        "Announcement photo uploaded",
      );

      // Delete temporary local file
      await fs.unlink(file.path);

      localFilePath = undefined;
    }

    const announcement =
      await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl,
          authorId: req.user!.id,
        },

        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
            },
          },
        },
      });

    logger.info(
      {
        userId: req.user?.id,
        announcementId: announcement.id,
      },
      "Announcement created",
    );

    return res.status(201).json(announcement);

  } catch (error) {

    // If Cloudinary upload failed, remove temporary file
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    logger.error(
      {
        error,
        userId: req.user?.id,
      },
      "CREATE ANNOUNCEMENT ERROR",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


// GET ALL ANNOUNCEMENTS

export async function getAnnouncements(
  req: AuthRequest,
  res: Response,
) {
  try {
    const {
      page,
      limit,
      search,
      category,
      sortBy,
      order,
    } = req.validatedQuery as GetAnnouncementsQuery;

    const where = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),

      ...(category && {
        category,
      }),
    };

    const announcements =
      await prisma.announcement.findMany({
        where,

        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
            },
          },
        },

        orderBy: {
          [sortBy]: order,
        },

        skip: (page - 1) * limit,

        take: limit,
      });

    const total =
      await prisma.announcement.count({
        where,
      });

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      announcements,
    });

  } catch (error) {

    logger.error(
      { error },
      "GET ANNOUNCEMENTS ERROR",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


// GET ONE ANNOUNCEMENT

export async function getAnnouncementById(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    const announcement =
      await prisma.announcement.findUnique({
        where: {
          id,
        },

        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
            },
          },
        },
      });

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    return res.json(announcement);

  } catch (error) {

    logger.error(
      { error },
      "GET ANNOUNCEMENT ERROR",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


// UPDATE ANNOUNCEMENT

export async function updateAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  let localFilePath: string | undefined;

  try {
    const id = Number(req.params.id);

    const data =
      req.body as UpdateAnnouncementDto;

    const announcement =
      await prisma.announcement.findUnique({
        where: {
          id,
        },
      });

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    if (announcement.authorId !== req.user!.id) {
      return res.status(403).json({
        error: "You can update only your announcements",
      });
    }

    const file = req.file;

    let imageUrl = announcement.imageUrl;

    // Upload new image if provided
    if (file) {
      localFilePath = file.path;

      const result = await cloudinary.uploader.upload(
        file.path,
        {
          folder: "announcements",
        },
      );

      imageUrl = result.secure_url;

      logger.info(
        {
          userId: req.user?.id,
          announcementId: id,
          imageUrl,
        },
        "Announcement photo uploaded",
      );

      // Delete temporary file
      await fs.unlink(file.path);

      localFilePath = undefined;
    }

    const updatedAnnouncement =
      await prisma.announcement.update({
        where: {
          id,
        },

        data: {
          ...data,
          ...(file && {
            imageUrl,
          }),
        },

        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
            },
          },
        },
      });

    logger.info(
      {
        userId: req.user?.id,
        announcementId: id,
      },
      "Announcement updated",
    );

    return res.json(updatedAnnouncement);

  } catch (error) {

    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }

    logger.error(
      {
        error,
        userId: req.user?.id,
      },
      "UPDATE ANNOUNCEMENT ERROR",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


// DELETE ANNOUNCEMENT

export async function deleteAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    const announcement =
      await prisma.announcement.findUnique({
        where: {
          id,
        },
      });

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    if (announcement.authorId !== req.user!.id) {
      return res.status(403).json({
        error: "You can delete only your announcements",
      });
    }

    await prisma.announcement.delete({
      where: {
        id,
      },
    });

    logger.info(
      {
        userId: req.user?.id,
        announcementId: id,
      },
      "Announcement deleted",
    );

    return res.json({
      message: "Announcement deleted",
    });

  } catch (error) {

    logger.error(
      { error },
      "DELETE ANNOUNCEMENT ERROR",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}