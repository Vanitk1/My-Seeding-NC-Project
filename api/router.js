const express = require("express")
const router = express.Router();
const { getEndPoints, getTopics, getArticleId, getArticles, getCommentsByArticleId, getUsers,
    postCommentsByArticleId, postArticles, postTopics,
    patchArticlesId, patchCommentId,
    deleteCommentId, deleteArticleId } = require("./controller");

// All get requests:

router.get("/", getEndPoints);

router.get("/topics", getTopics);

router.get("/articles/:article_id", getArticleId);

router.get("/articles", getArticles);

router.get("/articles/:article_id/comments", getCommentsByArticleId);

router.get("/users", getUsers);

// All post requests:

router.post("/articles/:article_id/comments", postCommentsByArticleId);

router.post("/articles", postArticles);

router.post("/topics", postTopics);

// All patch requests:

router.patch("/articles/:article_id", patchArticlesId);

router.patch("/comments/:comment_id", patchCommentId);

// All delete requests:

router.delete("/comments/:comment_id", deleteCommentId);

router.delete("/articles/:article_id", deleteArticleId);

module.exports = router