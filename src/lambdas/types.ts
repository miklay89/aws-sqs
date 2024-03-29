// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from "aws-lambda";

export type Body = {
  userId: string;
  shopId: string;
  query: string;
};

export interface TypedRequest extends APIGatewayEvent {
  body: string;
}
