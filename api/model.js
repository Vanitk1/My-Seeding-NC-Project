const db = require("../db/connection");

exports.selectTopics = () => {
    return db.query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => {
        // if (rows.length === 0) {
        //     return Promise.reject ({ status: 404, msg: "Not found" });
        // }
        return rows;
    })
}

exports.selectArticleById = (article_id) => {
    return db.query(`SELECT author, title, article_id, body, topic, created_at, votes, article_img_url
     FROM articles
     WHERE article_id = $1;`, [article_id])
     .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject ({ status: 404, msg: "Not found" });
        }
        return rows[0];
     })
}

//module.exports = {}