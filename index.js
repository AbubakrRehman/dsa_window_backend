
const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');

const app = express();

// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: "maddison53@ethereal.email",
//         pass: "jn7jnAPss4f63QBp6D",
//     },
// });

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use("/static", express.static(path.join(__dirname, 'public')));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// CORS options to allow requests from frontend running on port 5500
const corsOptions = {
    origin: ['http://localhost:3000','http://localhost:3001'], // Allow only requests from this origin
    methods: 'GET,POST, PUT, DELETE', // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow only these headers
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

const authRoute = require("./routes/authRoute.js");
const topicsRoute = require("./routes/topicsRoute.js");
const usersRoute = require("./routes/usersRoute.js");
const filesRoute = require("./routes/filesRoute.js");
const errorMiddleware = require('./middlewares/errorMiddleware.js');

app.use("/api/auth", authRoute);
app.use("/api/topics", topicsRoute);
app.use("/api/users", usersRoute);
app.use("/api/files", filesRoute);

app.get("/api/practice", (req, res, next) => {
    res.render("index", { token: "abc" })
})

app.get("*", (req, res, next) => {
    res.send("page not found")
})

app.use(errorMiddleware);

app.listen(8090, () => console.log("connected !!!!"))