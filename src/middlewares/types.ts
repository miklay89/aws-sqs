// eslint-disable-next-line import/no-unresolved
import { APIGatewayEvent } from "aws-lambda";

export type Body = {
  userId: string | null | undefined;
  shopId: string | null | undefined;
  query: string | null | undefined;
};

export interface TypedRequest extends APIGatewayEvent {
  body: string;
}
