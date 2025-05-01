const express = require("express");
const app = express();
//const http = require("http")
const db = require("./db/connection");
const router = require("./api/router");
const { getEndPoints, getTopics, getArticleId, getArticles, getCommentsByArticleId, postCommentsByArticleId, patchArticlesId, deleteCommentId, getUsers } = require("./api/controller");

app.use(express.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.use("/api", router);

app.all("/*splat", (req, res) => {
    res.status(404).send({ msg: "Nothing to see here" });
  });

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({msg: "bad request"})
    } else if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    } else {
        next(err)
    }
});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({msg: "Server error"})
})

module.exports = app;