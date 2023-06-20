export default function createResponse(data: string, statusCode: number) {
  return {
    statusCode,
    body: JSON.stringify(
      {
        message: data,
      },
      null,
      2,
    ),
  };
}
