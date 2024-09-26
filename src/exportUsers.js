import admin from "firebase-admin";
import fs from "fs";

const exportApp = admin.initializeApp(
  {
    credential: admin.credential.cert("./credentials.json"),
  },
  "export",
);

const exportAuth = admin.auth(exportApp);

export async function exportUsers() {
  try {
    let users = [];
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
