import express from "express";
import { PrismaClient } from "./generated/prisma";
import { authRoutes, projectRoutes, taskRoutes, userRoutes } from "./routes";
import YAML from "yamljs";
import path from "path";
import swaggerUi from "swagger-ui-express";

const PORT = process.env.PORT || 3000;

export const prisma = new PrismaClient();
const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

app.get("/ping", async (req, res) => {
  res.status(200).send("pong");
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
