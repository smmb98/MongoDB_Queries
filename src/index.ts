import { MongoClient } from "mongodb";
import express from "express";
import { json } from "body-parser";
const app = express();

const client = new MongoClient(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  try {
    await client.connect();

    console.log("Connected to Mongo Database.", "\n");

    const db = client.db("test");
    const transactionsModel = db.collection("Transactions");
    const customersModel = db.collection("Customers");

    // For creating COLLECTIONS in the database
    transactionsModel.countDocuments(async (err, count) => {
      if (count === 0) {
        await transactionsModel.insertOne({ test: "test" });
        await transactionsModel.deleteOne({});
      }
    });
    customersModel.countDocuments(async (err, count) => {
      if (count === 0) {
        await customersModel.insertOne({ test: "test" });
        await customersModel.deleteOne({});
      }
    });
    //

    app.use(json());

    app.post("/api/customer", async (req, res) => {
      const { username } = req.body;

      const result = await customersModel.findOne({ username: username });

      if (result) {
        res.send(result);
      } else {
        res.send({ message: `${username} does not exist` });
      }
    });

    app.post("/api/transactions", async (req, res) => {
      const { account_id } = req.body;

      const data = await transactionsModel.findOne({ account_id: account_id });
      if (data) {
        let total_amount_bought = 0;
        data.transactions.forEach((element) => {
          if (element.transaction_code === "buy") {
            total_amount_bought++;
          }
        });

        const payload = {
          total_amount_sold: data.transaction_count - total_amount_bought,
          total_amount_bought: total_amount_bought,
        };
        res.send(payload);
      } else {
        res.send({ message: `${account_id} does not exist` });
      }
    });
  } catch (err) {
    console.log(err);
  }
}
app.listen(process.env.PORT, () => {
  console.log("Server listening on http://localhost:" + process.env.PORT);
});

main();
