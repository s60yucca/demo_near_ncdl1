import "./db/firestore";
import { getStorage } from "firebase-admin/storage";
import formidable from "formidable";
import fs from "fs";

const parseFile = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });
};

export const uploadImageToFirebaseStorage = async (req, folder) => {
  const { files } = await parseFile(req);
  const { file } = files;
  const { originalFilename } = file;
  const fileNameParts = originalFilename.split(".");
  const ext = fileNameParts.pop();

  if (!["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) {
    throw "Invalid image format";
  }
  const newFileName = fileNameParts.join(".") + "_" + Math.random().toString(36).substring(2, 9);
  const path = `${folder}/${newFileName}.${ext}`;

  console.log(`Uploading image to ${path}`);

  const fileData = fs.readFileSync(file.filepath);
  const task = getStorage().bucket().file(path);
  await task.save(fileData);
  return getStorage().bucket().file(path).getSignedUrl({ action: "read", expires: "03-09-2491" });
};
