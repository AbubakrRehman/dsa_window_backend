
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true}));

// CORS options to allow requests from frontend running on port 5500
const corsOptions = {
    origin: 'http://localhost:3000', // Allow only requests from this origin
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


app.use(errorMiddleware);

app.listen(8090, ()=> console.log("connected !!!!"))