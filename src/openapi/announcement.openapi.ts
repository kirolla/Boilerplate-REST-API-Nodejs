import { z } from "zod";

import { registry } from "./registry.ts";


// GET ALL ANNOUNCEMENTS

registry.registerPath({
  method: "get",
  path: "/announcements",
  summary: "Get announcements",
  description:
    "Get list of announcements with pagination, search and sorting",

  request: {
    query: z.object({
      page: z.coerce
        .number()
        .int()
        .positive()
        .optional(),

      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(100)
        .optional(),

      search: z.string().optional(),

      category: z.string().optional(),

      sortBy: z.enum([
        "createdAt",
        "price",
        "title",
      ]).optional(),

      order: z.enum([
        "asc",
        "desc",
      ]).optional(),
    }),
  },

  responses: {
    200: {
      description: "Announcements list",
    },
  },
});


// GET ONE ANNOUNCEMENT

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  summary: "Get announcement by id",

  request: {
    params: z.object({
      id: z.string(),
    }),
  },

  responses: {
    200: {
      description: "Announcement found",
    },

    404: {
      description: "Announcement not found",
    },
  },
});


// CREATE ANNOUNCEMENT

registry.registerPath({
  method: "post",
  path: "/announcements",
  summary: "Create announcement",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string(),

            description: z.string(),

            price: z.number(),

            category: z.string(),
          }),
        },
      },
    },
  },

  responses: {
    201: {
      description: "Announcement created",
    },

    401: {
      description: "Unauthorized",
    },
  },
});


// UPDATE ANNOUNCEMENT

registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  summary: "Update announcement",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: z.object({
      id: z.string(),
    }),

    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().optional(),

            description: z.string().optional(),

            price: z.number().optional(),

            category: z.string().optional(),
          }),
        },
      },
    },
  },

  responses: {
    200: {
      description: "Announcement updated",
    },

    403: {
      description: "Not owner",
    },
  },
});


// DELETE ANNOUNCEMENT

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  summary: "Delete announcement",

  security: [
    {
      bearerAuth: [],
    },
  ],

  request: {
    params: z.object({
      id: z.string(),
    }),
  },

  responses: {
    200: {
      description: "Announcement deleted",
    },

    403: {
      description: "Not owner",
    },
  },
});