import { apiHandler } from "../../../services/api.handler";
import { getShows, setShow } from "../../../services/show.service";

/**
 * /api/shows
 * /api/shows?owner_id=<owner_id>
 */
const handleGet = async (req, res) => {
  const condition = req.query;
  const data = await getShows(condition);
  return res.json(data);
};

/**
 * /api/shows
 * { id, owner_id, meta_data }
 * **/
const handlePost = async (req, res) => {
  const company = await setShow(req.body);
  return res.json(company);
};

export default apiHandler({
  get: handleGet,
  post: handlePost,
});
