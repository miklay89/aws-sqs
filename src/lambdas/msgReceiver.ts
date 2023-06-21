// eslint-disable-next-line import/no-unresolved
import { Handler } from "aws-lambda";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import middy from "@middy/core";
import sqsClient from "../libs/sqs";
import createResponse from "../helpers/createResponse";
import msgReceiverMiddleware from "../middlewares/msgReceiverMiddleware";
import { Body, TypedRequest } from "./types";

const queueUrl = process.env.queueUrl as string;

const handler: Handler = async (event: TypedRequest) => {
  try {
    const messageBody: Body = JSON.parse(event.body);

    // send valid request to queue
    const params = {
      DelaySeconds: 0,
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: queueUrl,
    };
    const command = new SendMessageCommand(params);

    await sqsClient.send(command);

    return createResponse("success", 200);
  } catch (error) {
    console.log("Error in sending message to queue is - ", error);
    return createResponse(JSON.stringify(error as object), 500);
  }
};

const validatedHandler = middy(handler).use(msgReceiverMiddleware());

export default validatedHandler;
