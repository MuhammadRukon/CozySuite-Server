const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
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
    const roomCollection = client.db("roomDB").collection("rooms");
    const bookingCollection = client.db("roomDB").collection("booking");
    app.get("/", (req, res) => {
      res.send("server root route");
    });

    //get all data
    app.get("/rooms", async (req, res) => {
      try {
        const result = await roomCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });
    // get specific room data
    app.get("/rooms/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await roomCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log({ meesage: error });
      }
    });

    //update specific room data
    app.patch("/rooms/:id", async (req, res) => {
      const roomId = req.params.id;
      const updateSeat = req.body;
      const filter = { _id: new ObjectId(roomId) };
      const option = { upsert: false };
      const updateInfo = {
        $set: {
          availability: updateSeat.availability,
        },
      };
      const result = await roomCollection.updateOne(filter, updateInfo, option);
      res.send(result);
    });

    // add booking
    app.post("/booking", async (req, res) => {
      try {
        const book = req.body;
        const result = await bookingCollection.insertOne(book);
        res.send(result);
      } catch (error) {
        console.log({ meesage: error });
      }
    });

    //get all booking data
    app.get("/booking", async (req, res) => {
      try {
        const result = await bookingCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });

    // get specific bookings
    app.get("/booking/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });
    // get single booking
    app.get("/mybookings/update/:id", async (req, res) => {
      try {
        const bookingId = req.params.id;
        const query = { _id: new ObjectId(bookingId) };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });
    // update booking date
    app.patch("/mybookings/update/:id", async (req, res) => {
      const bookingId = req.params.id;
      const updateDate = req.body;
      const filter = { _id: new ObjectId(bookingId) };
      const option = { upsert: false };
      const updateData = {
        $set: {
          bookingDate: updateDate.date,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateData,
        option
      );
      res.send(result);
      console.log(result);
    });
    // delete a booking
    app.delete("/booking/:id", async (req, res) => {
      try {
        const bookingId = req.params.id;
        const query = { _id: new ObjectId(bookingId) };
        const result = await bookingCollection.deleteOne(query);
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
