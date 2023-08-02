const express = require("express");
const mysql = require("mysql");
const app = express();
const PORT = 3000;

/**
 *
 * sets the EJS as view engine so we can use EJS to inject our data
 *
 * we apply public folder in the midleware of express server so we
 * can use the css files with our EJS
 *
 * we also apply the json format to our express server such that
 * JSON format data can be sent between our client and server
 * */
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

/**
 *
 * setting connection parameters to the mysql database
 * */
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  database: "gym",
  password: "",
});

// home page route
app.get("/", (req, res) => {
  res.render("Home", req.query);
});

// create customer route
app.get("/createCustomer", (req, res) => {
  res.render("CreateCustomer", req.query);
});

// create bookings route
app.get("/createBooking", (req, res) => {
  connection.query(
    "select name, customer_id from customers",
    function (error, results, fields) {
      if (error) throw error;
      res.render("CreateBookings", { customers: results });
    }
  );
});

// view customers route
app.get("/customers", (req, res) => {
  connection.query(
    "select * from customers",
    function (error, results, fields) {
      if (error) throw error;
      res.render("ViewCustomers", { customers: results });
    }
  );
});

// view bookings route
app.get("/bookings", (req, res) => {
  connection.query(
    `select * from bookings b
    inner join customers c on c.customer_id=b.customer_id`,
    function (error, results, fields) {
      if (error) throw error;
      res.render("ViewBookings", { bookings: results });
    }
  );
});

// manage bookings route
app.get("/manageBookings", (req, res) => {
  connection.query(
    `select * from bookings b
    inner join customers c on c.customer_id=b.customer_id`,
    function (error, results, fields) {
      if (error) throw error;
      res.render("ManageBookings", { bookings: results });
    }
  );
});

// manage guest passes route
app.get("/guestPasses", (req, res) => {
  connection.query(
    `select * from customers`,
    function (error, results, fields) {
      if (error) throw error;
      res.render("GuestPasses", { customers: results });
    }
  );
});

// backend route that handles the POST request for new customers
app.post("/api/createCustomer", (req, res) => {
  const data = req.body;
  connection.query(
    `call createCustomer('${data.name}', '${data.address}', '${data.membershipStatus}', ${data.guestPasses})`,
    function (error, results, fields) {
      if (error)
        res.status(500).send({ description: "Some unknown error occurred" });
      res
        .status(200)
        .send({ description: "Successfully entered a new customer" });
    }
  );
});

// backend route that handles the POST request for creating new bookings in database
app.post("/api/createBooking", (req, res) => {
  const data = req.body;
  connection.query(
    `call createBooking('${data.date}', '${data.time}', '${data.customer_id}', '${data.activity_type}')`,
    function (error, results, fields) {
      if (error)
        res.status(500).send({ description: "Some unknown error occurred" });
      res
        .status(200)
        .send({ description: "Successfully created a new booking" });
    }
  );
});

// backend route that handles the POST request for deleting bookings
app.post("/api/deleteBooking", (req, res) => {
  const data = req.body;
  connection.query(
    `delete from bookings where booking_number='${data.id}'`,
    function (error, results, fields) {
      if (error)
        res.status(500).send({ description: "Some unknown error occurred" });
      res
        .status(200)
        .send({ description: "Successfully deleted the booking" });
    }
  );
});

// backend route that handles the POST request for using guest passes
app.post("/api/useGuestPass", (req, res) => {
  const data = req.body;
  connection.query(
    `update customers set guest_passes=${data.guest_passes} where customer_id='${data.customer_id}'`,
    function (error, results, fields) {
      if (error)
        res.status(500).send({ description: "Some unknown error occurred" });
      res
        .status(200)
        .send({ description: "Successfully deleted the booking" });
    }
  );
});

/**
 *
 *
 * starts the server at @const PORT {3000}
 * also creates connection with mysql database
 *  */
app.listen(PORT, () => {
  connection.connect();
  console.log(`Listening at port: ${PORT}`);
});
