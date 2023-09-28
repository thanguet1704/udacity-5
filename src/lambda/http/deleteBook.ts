import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { cors, httpErrorHandler } from "middy/middlewares";
import * as middy from "middy";
import { deleteBook } from "../../logic/books";
import { getUserId } from "../utils";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;
    const userId = getUserId(event);
    await deleteBook(userId, bookId);
    return {
      statusCode: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({}),
    };
  }
);
handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
