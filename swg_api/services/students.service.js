import fs from "fs";
import path from "path";

// data source can be changed to MongoDb for example

const DATA_PATH = path.join(process.cwd(), "data", "students.json");

export function getStudents() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}