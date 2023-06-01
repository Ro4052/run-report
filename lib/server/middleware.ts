import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

export const runStravaCorsMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse
) =>
  new Promise<void>((resolve, reject) => {
    const cors = Cors({
      origin: "https://www.strava.com",
      methods: ["POST"],
    });

    cors(req, res, (error) => {
      if (error) {
        return reject(error);
      }

      return resolve();
    });
  });
