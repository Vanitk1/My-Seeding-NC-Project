const { selectTopics } = require("../api/model");
const endpoints = require("../endpoints.json");
const db = require("../db/connection");

exports.getEndPoints = (req, res, next) => {
    res.status(200).send({ endpoints })
}

exports.getTopics = (req, res, next) => {
    selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
}

//module.exports = {}