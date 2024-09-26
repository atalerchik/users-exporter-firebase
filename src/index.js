import { exportUsers } from "./exportUsers.js";
import { importUsers } from "./importUsers.js";
import { deleteFiles } from "./cleanup.js";

async function run() {
  try {
    console.log("Starting user export...");
    await exportUsers();

    console.log("Starting user import...");
    await importUsers();

    console.log("Cleaning up temporary files...");
    deleteFiles();

    console.log("Process completed successfully.");
  } catch (error) {
    console.error("An error occurred during the process:", error);
  }
}

run();
