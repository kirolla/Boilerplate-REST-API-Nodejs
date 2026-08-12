import { Router } from "express";

import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.ts";

import { authenticate } from "../middleware/authenticate.ts";

import { validate } from "../middleware/validate.ts";

import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementsSchema,
} from "../validators/announcements.validator.ts";

import { upload } from "../middleware/upload.ts";

const router = Router();


// GET ALL ANNOUNCEMENTS

router.get(
  "/",
  validate(getAnnouncementsSchema, "query"),
  getAnnouncements,
);


// GET ONE ANNOUNCEMENT

router.get(
  "/:id",
  getAnnouncementById,
);


// CREATE ANNOUNCEMENT

router.post(
  "/",
  authenticate,
  upload.single("image"),
  validate(createAnnouncementSchema),
  createAnnouncement,
);


// UPDATE ANNOUNCEMENT

router.patch(
  "/:id",
  authenticate,
  upload.single("image"),
  validate(updateAnnouncementSchema),
  updateAnnouncement,
);


// DELETE ANNOUNCEMENT

router.delete(
  "/:id",
  authenticate,
  deleteAnnouncement,
);


export default router;