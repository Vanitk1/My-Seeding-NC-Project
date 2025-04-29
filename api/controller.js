const { selectTopics, selectArticleById, selectArticles, selectCommentsByArticleId, insertCommentsByArticleId } = require("../api/model");
const endpoints = require("../endpoints.json");
const db = require("../db/connection");
//const articles = require("../db/data/development-data/articles");

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

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    selectCommentsByArticleId(article_id)
    .then((comments) => {
        res.status(200).send({ comments })
    })
    .catch(next);
}

exports.postCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    insertCommentsByArticleId(username, article_id, body)
    .then((comment) => {
        res.status(201).send({ comment})
    })
    .catch(next);
}

//module.exports = {}