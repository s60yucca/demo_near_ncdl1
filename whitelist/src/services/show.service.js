import "./db/firestore";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { snapshotToArray } from "./api.handler";

const db = getFirestore(),
  COLLECTION_NAME = "shows",
  companyRef = db.collection(COLLECTION_NAME);

export const getShow = async (show_id) => {
  const doc = await companyRef.doc(show_id).get();
  if (!doc.exists) {
    throw "The show does not exist";
  }
  return { ...doc.data(), show_id: doc.id };
};

export const getShows = (condition) => {
  // Get all companies
  if (Object.keys(condition).length === 0) {
    return companyRef.get().then(snapshotToArray);
  }
  // Get all companies by condition

  let docsRef = companyRef;
  for (const key in condition) {
    docsRef = docsRef.where(key, "==", condition[key]);
  }
  return docsRef.get().then(snapshotToArray);
};

export const setShow = async ({ show_id, owner_id, ...metadata }) => {
  if (!show_id) {
    throw "Show must have id";
  }
  if (!owner_id) {
    throw "Show must have owner_id";
  }
  const doc = { show_id, owner_id, ...metadata, createdAt: Timestamp.now() };
  await companyRef.doc(show_id).set(doc);
  doc.show_id = show_id;
  return doc;
};
