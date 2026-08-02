import type { Response } from "express";

import prisma from "../../prisma/client.ts";

import type { AuthRequest } from "../middleware/authenticate.ts";

import type {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  GetAnnouncementsQuery,
} from "../validators/announcements.validator.ts";


// CREATE ANNOUNCEMENT

export async function createAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data = req.body as CreateAnnouncementDto;

    const announcement =
      await prisma.announcement.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          authorId: req.user!.id,
        },
      });


    return res.status(201).json(announcement);


  } catch (error) {

    console.error(
      "CREATE ANNOUNCEMENT ERROR:",
      error,
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

    const announcements =
      await prisma.announcement.findMany({
        where: {
          ...(search && {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }),

          ...(category && {
            category,
          }),
        },

        include: {
          author: {
            select: {
              id: true,
              username: true,
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
        where: {
          ...(search && {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }),

          ...(category && {
            category,
          }),
        },
      });

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      announcements,
    });

  } catch (error) {

    console.error(
      "GET ANNOUNCEMENTS ERROR:",
      error,
    );

    return res.status(500).json({
        error: "Internal server error",
        message:
            error instanceof Error
                ? error.message
                : error,
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

    console.error(
      "GET ANNOUNCEMENT ERROR:",
      error,
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


    const updatedAnnouncement =
      await prisma.announcement.update({
        where: {
          id,
        },

        data,
      });


    return res.json(updatedAnnouncement);


  } catch (error) {

    console.error(
      "UPDATE ANNOUNCEMENT ERROR:",
      error,
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


    return res.json({
      message: "Announcement deleted",
    });


  } catch (error) {
    console.error(
      "DELETE ANNOUNCEMENT ERROR:",
      error,
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}