import admin from "firebase-admin";
import fs from "fs";

const importApp = admin.initializeApp(
  {
    credential: admin.credential.cert("./credentials-import.json"),
  },
  "import",
);

const importAuth = admin.auth(importApp);

// Helper function to chunk users into batches of 1000
const chunkUsers = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

export async function importUsers() {
  try {
    const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
    const userChunks = chunkUsers(users, 999);

    for (let i = 0; i < userChunks.length; i++) {
      const chunk = userChunks[i];
      const result = await importAuth.importUsers(chunk, {
        hash: {
          algorithm: process.env.ALGORITHM,
          key: Buffer.from(process.env.KEY, "base64"),
          saltSeparator: Buffer.from(process.env.SALT_SEPARATOR, "base64"),
          rounds: parseInt(process.env.HASH_ROUNDS, 10),
          memoryCost: parseInt(process.env.MEMORY_COST, 10),
        },
      });

      if (result.errors.length > 0) {
        console.error(`Errors in batch ${i + 1}:`, result.errors);
      } else {
        console.log(`Successfully imported batch ${i + 1} of users.`);
      }
    }
    console.log("All user data imported successfully.");
  } catch (error) {
    console.error("Error importing users:", error);
  }
}
