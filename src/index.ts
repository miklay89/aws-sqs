import msgReceiver from "./lambdas/msgReceiver";
import queueMsgHandler from "./lambdas/queueMsgHandler";

// receive messages from shop
export const messageReceiverHandler = msgReceiver;
// compute message from queue
export const queueMessageHandler = queueMsgHandler;
