import express from "express";
import {
  createProject,
  updateProject,
  deleteProject,
  addUserToProject,
  deleteUserFromProject,
  editUserRoleInProject,
  getProject,
  getProjects,
} from "../controllers/project-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getProjectTasks } from "../controllers/task-controller";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);
router.get("/", authMiddleware, getProjects);
router.get("/:id", authMiddleware, getProject);
router.post("/:id/users", authMiddleware, addUserToProject);
router.delete(
  "/:projectId/users/:userId",
  authMiddleware,
  deleteUserFromProject
);
router.patch(
  "/:projectId/users/:userId/role",
  authMiddleware,
  editUserRoleInProject
);
router.get("/:id/tasks", authMiddleware, getProjectTasks);

export default router;
