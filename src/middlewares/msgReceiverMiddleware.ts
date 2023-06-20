// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { Client } from "pg";
import dbConfig from "../libs/db";
import createResponse from "../helpers/createResponse";
import shopIdChecker from "../helpers/shopIdChecker";

export const msgReceiverMiddleware = (): middy.MiddlewareObj<
  APIGatewayEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    APIGatewayEvent,
    APIGatewayProxyResult
  > = async (request) => {
    const { userId, shopId, query } = JSON.parse(request.event.body!);

    // validating body
    if (!userId || !shopId || !query) {
      return createResponse(
        "userId, shopId, query fields in body is required.",
        400,
      );
    }

    // checking shop_id
    if (!shopIdChecker(shopId)) {
      return createResponse("Error: shopId is invalid", 400);
    }

    // checking api usage
    const queryString = `Select count from ${process.env.DB_API_USAGE_TABLE} where shopId='${shopId}'`;
    const client = new Client(dbConfig);
    await client
      .connect()
      .catch((err) => console.log("Error connection - ", err.message));
    const result = await client.query(queryString);
    client.end();

    const apiUsageCount = +result.rows[0].count;
    const apiUsageLimit = process.env.API_USAGE_COUNT as string;
    if (apiUsageCount >= +apiUsageLimit) {
      return createResponse(
        `You have used all API calls in this month, you use API endpoint ${apiUsageCount} times.`,
        400,
      );
    }
    // eslint-disable-next-line consistent-return, no-useless-return
    return;
  };

  const after: middy.MiddlewareFn<
    APIGatewayEvent,
    APIGatewayProxyResult
  > = async (request) => {
    const { shopId } = JSON.parse(request.event.body!);
    const client = new Client(dbConfig);
    await client
      .connect()
      .catch((err) => console.log("Error connection - ", err.message));
    const apiUsageQueryString = `UPDATE ${process.env.DB_API_USAGE_TABLE} SET count = count + 1 WHERE shopId='${shopId}'`;
    await client.query(apiUsageQueryString);
    client.end();
    // eslint-disable-next-line consistent-return, no-useless-return
    return;
  };

  return {
    before,
    after,
  };
};

export default msgReceiverMiddleware;