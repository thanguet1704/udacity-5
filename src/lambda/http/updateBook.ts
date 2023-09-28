import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, httpErrorHandler } from "middy/middlewares";

import { UpdateBookRequest } from "../../requests/UpdateBookRequest";
import { getUserId } from "../utils";
import { updateBook } from "../../logic/books";
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;
    const updatedItem: UpdateBookRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    const book = await updateBook(userId, bookId, updatedItem);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(book),
    };
  }
);
handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
  })
);
