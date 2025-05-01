const express = require("express")
const router = express.Router();
const { getEndPoints, getTopics, getArticleId, getArticles, getCommentsByArticleId, postCommentsByArticleId, patchArticlesId, deleteCommentId, getUsers, patchCommentId, postArticles } = require("./controller");

router.get("/", getEndPoints);

router.get("/topics", getTopics);

router.get("/articles/:article_id", getArticleId)

router.get("/articles/:article_id", getArticleId);

router.get("/articles", getArticles);

router.get("/articles/:article_id/comments", getCommentsByArticleId);

router.post("/articles/:article_id/comments", postCommentsByArticleId);

router.patch("/articles/:article_id", patchArticlesId);

router.delete("/comments/:comment_id", deleteCommentId);

router.get("/users", getUsers);

router.patch("/comments/:comment_id", patchCommentId);

router.post("/articles", postArticles);

module.exports = router