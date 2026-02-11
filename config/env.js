import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, ".env");

const result = dotenv.config({ path: envPath });
if (result.error) throw result.error;

export {};
