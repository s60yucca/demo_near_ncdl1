function errorHandler(err, res) {
  if (typeof err === "string") {
    // custom application error
    const is404 = err.toLowerCase().endsWith("Not found");
    const statusCode = is404 ? 404 : 400;
    return res.status(statusCode).json({ statusCode, message: err });
  }

  if (err.name === "UnauthorizedError") {
    // jwt authentication error
    return res.status(401).json({ statusCode: 401, message: "Invalid Token" });
  }

  // default to 500 server error
  console.error(err);
  return res.status(500).json({ statusCode: 500, message: err.message });
}

export function apiHandler(handler) {
  return async (req, res) => {
    const method = req.method.toLowerCase();

    // check handler supports HTTP method
    if (!handler[method])
      return res.status(405).json({
        statusCode: 405,
        message: `Method ${method.toUpperCase()} not supported`,
      });

    try {
      // global middleware

      // route handler
      await handler[method](req, res);
    } catch (err) {
      // global error handler
      errorHandler(err, res);
    }
  };
}

export function snapshotToArray(snapshot) {
  const returnArr = [];

  snapshot.forEach((childSnapshot) => {
    const id = childSnapshot.id;
    const data = childSnapshot.data();
    returnArr.push({ id, ...data });
  });

  return returnArr;
}
