
const { selectTopics, selectArticleById, selectArticles, selectCommentsByArticleId, insertCommentsByArticleId, updateArticleId, removeCommentId, selectUsers, updateCommentId, insertArticle, insertTopics, removeArticleId } = require("../api/model");
const endpoints = require("../endpoints.json");
const db = require("../db/connection");
const { articleData } = require("../db/data/development-data");

exports.getEndPoints = (req, res) => {
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
    const { sort_by, order, topic } = req.query;

    selectArticles(sort_by, order, topic)
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

    if (!username || !body) {
        return res.status(400).send({ msg: "Bad request" });
      }

    insertCommentsByArticleId(username, article_id, body)
    .then((comment) => {
        res.status(201).send({ comment })
    })
    .catch(next);
}

exports.patchArticlesId = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    updateArticleId(article_id, inc_votes)
    .then((newArticle) => {
        res.status(200).send({article: newArticle})
    })
    .catch(next);
}

exports.deleteCommentId = (req, res, next) => {
    const { comment_id } = req.params;

    removeCommentId(comment_id)
    .then(() => {
        res.status(204).send()
    })
    .catch(next);
}

exports.getUsers = (req, res, next) => {
    const {sort_by, order } = req.query;
    selectUsers(sort_by, order)
    .then((users) => {
        res.status(200).send({users})
    })
    .catch(next)
}

exports.patchCommentId = (req, res, next) => {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    updateCommentId(comment_id, inc_votes)
    .then((comment) => {
        res.status(200).send({comment})
    })
    .catch(next)
}

exports.postArticles = (req, res, next) => {
    const articleInfo = req.body;

    insertArticle(articleInfo)
    .then((newArticle) => {
        res.status(201).send({article: newArticle})
    })
    .catch(next)
}

exports.postTopics = (req, res, next) => {
    const { slug, description, img_url } = req.body;
  
    insertTopics(slug, description, img_url)
      .then((topic) => {
        res.status(201).send({ topic });
      })
      .catch(next)
};

exports.deleteArticleId = (req, res, next) => {
    const { article_id } = req.params;

    removeArticleId(article_id)
    .then(() => {
        res.status(204).send()
    })
    .catch(next);
}
//module.exports = {}