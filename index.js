const express = require("express");
const app = express();
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.wgk6h9w.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const roomDB = client.db("roomDB").collection("rooms");
    app.get("/", (req, res) => {
      res.send("server root route");
    });

    //get all data
    app.get("/rooms", async (req, res) => {
      try {
        const result = await roomDB.find().toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server running");
});
