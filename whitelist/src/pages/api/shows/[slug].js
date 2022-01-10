import { apiHandler } from "../../../services/api.handler";
import { getShow } from "../../../services/show.service";

/**
 * /api/shows/:slug
 */
const handleGet = async (req, res) => {
  const { slug } = req.query;
  const data = await getShow(slug);
  return res.json(data);
};

export default apiHandler({
  get: handleGet,
});
