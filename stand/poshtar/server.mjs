// Заглушка провайдера «Поштар»: приймає листи з ключем акаунта й рахує їх. Назовні нічого не надсилає.
import { createServer } from "node:http";

const API_KEY = process.env.POSHTAR_API_KEY;
const ACCOUNT_FROM = "noreply@staging.zoshyt.example";

let delivered = [];

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  const reply = (status, body) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  };

  if (request.method === "POST" && request.url === "/v1/messages") {
    if (request.headers.authorization !== `Bearer ${API_KEY}`) {
      return reply(401, { error: "INVALID_API_KEY" });
    }
    const mail = JSON.parse(await readBody(request));
    delivered.push({ from: mail.from || ACCOUNT_FROM, to: mail.to, subject: mail.subject });
    console.log(`Доставлено: ${mail.to}`);
    return reply(202, { status: "delivered" });
  }

  if (request.method === "GET" && request.url === "/v1/sent") {
    return reply(200, { count: delivered.length, last: delivered.slice(-3) });
  }

  if (request.method === "DELETE" && request.url === "/v1/sent") {
    delivered = [];
    return reply(200, { count: 0 });
  }

  return reply(404, { error: "NOT_FOUND" });
});

server.listen(4010, "0.0.0.0", () => console.log("Поштар слухає порт 4010"));
