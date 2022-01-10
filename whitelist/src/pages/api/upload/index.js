import { apiHandler } from "../../../services/api.handler";
import { uploadImageToFirebaseStorage } from "../../../services/upload.service";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * /api/shows
 * /api/shows?owner_id=<owner_id>
 */
const handleGet = async (req, res) => {
  return res.json({});
};

/**
 * /api/upload
 * **/
const handlePost = async (req, res) => {
  const urls = await uploadImageToFirebaseStorage(req, "shows");
  return res.json({
    url: urls[0],
  });
};

export default apiHandler({
  get: handleGet,
  post: handlePost,
});
