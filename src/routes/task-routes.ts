import express from "express";
import {
  assignTaskToUser,
  createTask,
  deleteTask,
  getTask,
  updateTask,
} from "../controllers/task-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.post("/", authMiddleware, createTask);
router.get("/:id", authMiddleware, getTask);
router.patch("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);
router.patch("/:id/assign-to", authMiddleware, assignTaskToUser);

export default router;
