import express from "express";
import {
  deleteUser,
  getUser,
  getUserProfile,
  getUserProjects,
  getUsers,
  getUserTasks,
  updateUser,
} from "../controllers/user-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", authMiddleware, getUserProfile);
router.get("/:id", authMiddleware, getUser);
router.patch("/", authMiddleware, updateUser);
router.delete("/", authMiddleware, deleteUser);
router.get("/:id/projects", authMiddleware, getUserProjects);
router.get("/:id/tasks", authMiddleware, getUserTasks);

export default router;
