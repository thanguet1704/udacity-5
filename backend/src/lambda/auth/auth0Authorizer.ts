import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { verify, decode } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
import { Jwt } from "../../auth/Jwt";
import { JwtPayload } from "../../auth/JwtPayload";
import axios from "axios";
const logger = createLogger("auth");

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User authorized", jwtToken);
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("Failed to authorize user", { error: e.message });
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  try {
    const res = await axios.get(
      "https://dev-bm46w28g5dtuqqgq.us.auth0.com/.well-known/jwks.json"
    );
    const keys = res.data.keys;
    const key = keys.find((k) => k.kid === jwt.header.kid);
    if (!key) {
      logger.error("Key not found", { keyId: jwt.header.kid });
      throw new Error("Key not found");
    }
    const pem = key.x5c[0];
    const cert = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----`;

    const verifiedToken = verify(token, cert) as JwtPayload;
    return verifiedToken;
  } catch (error) {
    logger.error("Failed to verify token", { error });
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("Authentication header not found");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
