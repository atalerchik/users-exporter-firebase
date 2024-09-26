import admin from "firebase-admin";
import fs from "fs";

const exportApp = admin.initializeApp(
  {
    credential: admin.credential.cert("./credentials.json"),
  },
  "export",
);

const exportAuth = admin.auth(exportApp);

async function exportUsers() {
  try {
    let users: any = [];
    let result;
    let nextPageToken;

    do {
      result = await exportAuth.listUsers(1000, nextPageToken);
      users = users.concat(result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    const userData = users
      .filter((user) => user.uid && user.phoneNumber)
      .map((user) => ({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
      }));

    fs.writeFileSync("users.json", JSON.stringify(userData, null, 2));
    console.log("User data exported successfully.");
  } catch (error) {
    console.error("Error exporting users:", error);
  }
}

async function importUsers() {
  const importApp = admin.initializeApp(
    {
      credential: admin.credential.cert("./credentials-import.json"),
    },
    "import",
  );

  const importAuth = admin.auth(importApp);
  try {
    const users = JSON.parse(fs.readFileSync("users.json", "utf8"));

    await importAuth.importUsers(users, {
      hash: {
        algorithm: process.env.ALGORITHM,
        key: Buffer.from(process.env.KEY, "base64"),
        saltSeparator: Buffer.from(process.env.SALT_SEPARATOR, "base64"),
        rounds: process.env.HASH_ROUNDS,
        memoryCost: process.env.MEMORY_COST,
      },
    });
    console.log("User data imported successfully.");
  } catch (error) {
    console.error("Error importing users:", error);
  }
}

async function deleteAllUsers(nextPageToken?: string) {
  try {
    const result = await importAuth.listUsers(1000, nextPageToken);

    const uids = result.users.map((userRecord) => userRecord.uid);

    if (uids.length > 0) {
      await importAuth.deleteUsers(uids);
      console.log(`Successfully deleted ${uids.length} users.`);
    }

    if (result.pageToken) {
      await deleteAllUsers(result.pageToken);
    } else {
      console.log("All users deleted.");
    }
  } catch (error) {
    console.error("Error deleting users:", error);
  }
}

async function deleteFiles() {
  fs.rmSync("./users.json");
}

async function run() {
  await exportUsers();
  // await deleteAllUsers();
  await importUsers();
  await deleteFiles();
}

run().catch(console.error);
