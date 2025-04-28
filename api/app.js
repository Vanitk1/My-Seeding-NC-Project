const express = require("express");
const app = express();
const db = require("../db/connection");
const { getEndPoints, getTopics, getArticleId } = require("./controller");

app.use(express.json())

app.get("/api", getEndPoints);

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticleId)

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