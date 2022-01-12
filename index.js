const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const ObjectId = require("mongodb").ObjectId;



app.use(cors());
app.use(express.json());
app.use(fileUpload());
//pass: zV7zkMCvWxn0wgH1
// name: unique
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qp9ql.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });
client.connect((err) => {
  const database = client.db("unique");
  const productsCollection = database.collection("products");
  const addCartCollection = database.collection("addcart");
  const reviewsCollection = database.collection("reviews");
  const usersCollection = database.collection("users");
  const ordersCollection = database.collection("orders");
  // perform actions on the collection object
  console.log("database connected");

  //POST API for  new products
  app.post("/products", async (req, res) => {
    const title = req.body.title;
    const Categories = req.body.Categories;
    const description = req.body.description;
    const price = req.body.price;
    const image = req.files.image;

    const imageData = image.data;
    const encodedData = imageData.toString("base64");
    const imgBuffer = Buffer.from(encodedData, "base64");
    const data = {
      title,
     
      price,
      description,
   
      Categories,
      image: imgBuffer,
    };
    const result = await productsCollection.insertOne(data);
    res.json(result);
  });

  // get all products
  app.get("/products", async (req, res) => {
    const allProducts = await productsCollection.find({}).toArray();
    res.send(allProducts);
  });

  //Get API for certain product by id
  app.get("/products/:id", async (req, res) => {
    console.log(req.params.id);
    const productDetails = await productsCollection.findOne({
      _id: ObjectId(req.params.id),
    });
    res.send(productDetails);
  });

  //Delete API- delete products
  app.delete("/products/:id", async (req, res) => {
    const deletedProducts = await productsCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(deletedProducts);
  });

  //POST API- all users siging with email
  app.post("/users", async (req, res) => {
    const users = await usersCollection.insertOne(req.body);
    res.json(users);
  });

  //PUT API -user
  app.put("/users", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  });
  //Update user role
  app.put("/users/admin", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json(result);
  });
  app.get("/users/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === "admin") {
      isAdmin = true;
    }
    res.json({ admin: isAdmin });
  });

  //POST API for Products order
  app.post("/orders", async (req, res) => {
    const orders = await ordersCollection.insertOne(req.body);
    res.json(orders);
  });

  //GET API-orders
  app.get("/orders", async (req, res) => {
    const orders = await ordersCollection.find({}).toArray();
    res.send(orders);
  });
  app.get("/orders/:email", async (req, res) => {
    console.log(req.params.email);
    const result = await ordersCollection
      .find({
        user_email: req.params.email,
      })
      .toArray();
    res.send(result);
  });
  //Delete API- delete order
  app.delete("/orders/:id", async (req, res) => {
    const deletedOrder = await ordersCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(deletedOrder);
  });

  //Update order status api
  app.put("/orders/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const updateStatus = req.body;
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        status: updateStatus,
      },
    };
    const result = await ordersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
  });
 
 

  //POST API for Products order
 

  app.get("/addcart", async (req, res) => {
    const result = addCartCollection.find({});
    const addCart = await result.toArray();
    res.send(addCart);
  });
  //POST API for Products add to cart
  app.post("/addcart", async (req, res) => {
    const addCart = await addCartCollection.insertOne(req.body);
    res.json(addCart);
  });

  app.delete("/addcart/:id", async (req, res) => {
    const deletedaddcart = await addCartCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(deletedaddcart);
  });

  app.get("/reviews", async (req, res) => {
    const result = reviewsCollection.find({});
    const reviews = await result.toArray();
    res.send(reviews);
  });

  //POST API for user review
  app.post("/reviews", async (req, res) => {
    const reviews = await reviewsCollection.insertOne(req.body);
    res.json(reviews);
  });

  app.delete("/reviews/:id", async (req, res) => {
    const deletedreviews = await reviewsCollection.deleteOne({
      _id: ObjectId(req.params.id),
    });
    res.json(deletedreviews);
  });

  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello Examiners!");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
