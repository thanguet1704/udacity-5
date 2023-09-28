import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { cors } from "middy/middlewares";
import * as middy from "middy";
import { getBooksForUser } from "../../logic/books";
import { getUserId } from "../utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const books = await getBooksForUser(userId);
    return {
      statusCode: 200,
      body: JSON.stringify(books),
    };
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
