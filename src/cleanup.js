import fs from "fs";

export function deleteFiles() {
  try {
    fs.rmSync("./users.json");
    console.log("Temporary files deleted successfully.");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
}
