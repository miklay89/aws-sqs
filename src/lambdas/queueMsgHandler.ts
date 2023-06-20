// eslint-disable-next-line import/no-unresolved
import { Handler, SQSEvent, SQSRecord } from "aws-lambda";
import { Client } from "pg";
import dbConfig from "../libs/db";
import { Body } from "./types";

async function handleRecord(record: SQSRecord) {
  const body: Body = JSON.parse(record.body);
  const { userId, shopId, query } = body;
  const queryString = `INSERT INTO ${process.env.DB_SHOP_QUERY_TABLE} (userId, shopId, query) VALUES ('${userId}', '${shopId}', '${query}')`;

  const client = new Client(dbConfig);
  await client
    .connect()
    .then(() => client.query(queryString))
    .catch((err) => console.log("Client submiting query error - ", err.message))
    .finally(() => {
      client.end();
    });
}

const handler: Handler = async (event: SQSEvent) => {
  const promise: any[] = [];
  event.Records.forEach((record) => {
    promise.push(handleRecord(record));
  });

  await Promise.all(promise).catch((err) => console.log(err));
};

export default handler;
