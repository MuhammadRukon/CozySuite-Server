const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cozysuite-15955.web.app",
      "https://cozysuite-15955.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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

//middle ware
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
  });
  next();
};

async function run() {
  try {
    // await client.connect();
    const roomCollection = client.db("roomDB").collection("rooms");
    const bookingCollection = client.db("roomDB").collection("booking");

    app.get("/", (req, res) => {
      res.send("server root route");
    });

    // jwt
    app.post("/auth/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: "true" });
    });

    //create cookie
    app.post("/logout", async (req, res) => {
      // api is not hitting while logout function rather in side useEffect when currentUser = undefined hence req.body in undefied
      const user = req.body;

      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
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
    //update review data of specific room data
    app.put("/rooms/:id", async (req, res) => {
      const roomId = req.params.id;
      const reviewData = req.body;
      const filter = { _id: new ObjectId(roomId) };
      const review = {
        $push: {
          reviews: reviewData,
        },
      };
      const result = await roomCollection.updateOne(filter, review);
      console.log(result);
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
    app.get("/booking", verifyToken, async (req, res) => {
      try {
        const result = await bookingCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });

    // get specific bookings
    app.get("/booking/:email", verifyToken, async (req, res) => {
      try {
        if (req.user?.email !== req.params?.email) {
          return res.status(403).send({ message: "forbidden access" });
        }
        const email = req.params.email;
        const query = { email: email };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log({ message: error });
      }
    });
    // get single booking
    app.get("/mybookings/update/:id", verifyToken, async (req, res) => {
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
    app.patch("/mybookings/update/:id", verifyToken, async (req, res) => {
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
