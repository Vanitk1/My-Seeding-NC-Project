const express = require("express");
const app = express();
//const http = require("http")
const db = require("../db/connection");
const { getEndPoints, getTopics, getArticleId, getArticles, getCommentsByArticleId, postCommentsByArticleId, deleteCommentId } = require("./controller");

app.use(express.json())

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleId);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentsByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentId);

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