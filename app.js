const express = require("express");
 const path = require("path");
 const http = require("http");
 const cors = require("cors");
// const { config } = require("./config/secret")
const { routesInit } = require("./routes/config_routes");
 const fileUpload = require("express-fileupload");
 require("./db/mongoConect")

const app = express();


 app.use(cors());

app.use(express.json());

 app.use(fileUpload())

app.use(express.static(path.join(__dirname, "public")))

routesInit(app);

 const server = http.createServer(app);
//  console.log("env",process.env.TEST,process.env.USER_DB)

let port = process.env.PORT || 3001
server.listen(port);