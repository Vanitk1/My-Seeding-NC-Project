const { selectTopics, selectArticleById, selectArticles } = require("../api/model");
const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const articles = require("../db/data/development-data/articles");

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

exports.getArticleId = (req, res, next) => {
    const { article_id } = req.params; 
    
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send({article})
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
    selectArticles()
    .then((articles) => {
        res.status(200).send({ articles })
    })
    .catch(next)
}
//module.exports = {}