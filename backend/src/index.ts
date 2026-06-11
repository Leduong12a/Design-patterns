import express from "express";
import { Express } from "express";
import cors from "cors";

const app: Express = express();
const port: number = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  console.log(req.method, req.url);
  res.send("Hello from Design Pattern Backend!");
});

app.listen(port, () => {
  console.log(`kết nối thành công đến http://localhost:${port}/`);
});