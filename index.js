const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
require("dotenv").config();
app.use(cors());
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    // get specific data
    app.get("/rooms/details/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await roomDB.find(query).toArray();
      console.log(result);
      res.send(result);
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
