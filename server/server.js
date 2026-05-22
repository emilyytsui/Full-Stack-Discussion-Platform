const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const { attachCurrentUser } = require("./middleware/auth");

const commentsRouter = require("./routes/commentsRouter");
const communitiesRouter = require("./routes/communitiesRouter");
const postsRouter = require("./routes/postsRouter");
const linkflairsRouter = require("./routes/linkflairsRouter");
const usersRouter = require("./routes/usersRouter");

const app = express();
const port = 8000;

const mongoDB = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/phreddit";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json());

const sessionOptions = {
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "phreddit-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  },
};

if (process.env.NODE_ENV !== "test") {
  sessionOptions.store = MongoStore.create({
    mongoUrl: mongoDB,
  });
}

app.use(session(sessionOptions));

app.use(attachCurrentUser);

app.use("/comments", commentsRouter);
app.use("/communities", communitiesRouter);
app.use("/posts", postsRouter);
app.use("/linkflairs", linkflairsRouter);
app.use("/users", usersRouter);

app.get("/", (_req, res) => {
  res.send("Hello Phreddit!");
});

async function startServer() {
  await mongoose.connect(mongoDB);
  console.log("Connected to database: phreddit");

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });

  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("Server closed. Database instance disconnected.");
    process.exit(0);
  });
}

module.exports = { app, startServer };
