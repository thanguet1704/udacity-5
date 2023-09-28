import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";

import { createLogger } from "../../utils/logger";

const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
const s3 = new XAWS.S3({
  signatureVersion: "v4",
});

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { BookAccess } from "../../dataAccess/inventoryDB";
import { getUserId } from "../utils";

const bookAccess = new BookAccess();
const logger = createLogger("generateUploadUrl");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId;

    const userId = getUserId(event);

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: bookId,
      Expires: urlExpiration,
    });
    logger.info("Generating upload URL:", {
      bookId,
      uploadUrl,
    });

    await bookAccess.saveImgUrl(userId, bookId, bucketName);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl,
      }),
    };
  }
);
handler.use(
  cors({
    credentials: true,
  })
);
