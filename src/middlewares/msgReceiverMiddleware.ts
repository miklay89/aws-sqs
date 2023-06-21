// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { Client } from "pg";
import dbConfig from "../libs/db";
import createResponse from "../helpers/createResponse";
import shopIdChecker from "../helpers/shopIdChecker";
import { Body, TypedRequest } from "./types";

export const msgReceiverMiddleware = (): middy.MiddlewareObj<
  TypedRequest,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    TypedRequest,
    APIGatewayProxyResult
  > = async (request) => {
    const messageBody: Body = JSON.parse(request.event.body);
    const { userId, shopId, query } = messageBody;

    // validating body
    if (!userId) {
      return createResponse("userId is required.", 400);
    }
    if (!shopId) {
      return createResponse("shopId is required.", 400);
    }
    if (!query) {
      return createResponse("query is required.", 400);
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
    const result = await client.query<{ count: number }>(queryString);
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

  const after: middy.MiddlewareFn<TypedRequest, APIGatewayProxyResult> = async (
    request,
  ) => {
    const messageBody: Body = JSON.parse(request.event.body);
    const { shopId } = messageBody;
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
