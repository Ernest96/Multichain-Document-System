import express from "express";
import { getStudents } from "../services/students.service.js";

const studentsRouter = express.Router();

studentsRouter.get("/", (req, res) => {
  const data = getStudents();
  res.json({
    ...data,
    count: data.students.length
  });
});

export default studentsRouter;