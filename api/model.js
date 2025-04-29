const db = require("../db/connection");

exports.selectTopics = () => {
    return db.query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => {
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

exports.selectArticles = () => {
    return db.query (`SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC`)
        .then(({ rows }) => {
            return rows;
        })
}


exports.selectCommentsByArticleId = (article_id) => {
    return db.query (`SELECT comment_id, votes, created_at, author, body, article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`, [article_id])
        .then(({ rows }) => {
            return rows;
        });
}

exports.insertCommentsByArticleId = (username, article_id, body) => {
    return db.query (`INSERT INTO comments (author, article_id, body)
        VALUES ($1, $2, $3)
        RETURNING *`, [username, article_id, body])
        .then((result) => result.rows[0]) 
        // .then(({ rows }) => {
        //     return rows[0];

        // });

        // }); 
}

exports.updateArticleId = (article_id, inc_votes) => {
    return db.query (`UPDATE articles SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *`, [inc_votes, article_id])
        .then((results) => results.rows[0])

}

exports.removeCommentId = (comment_id) => {
    return db.query (`DELETE FROM comments 
        WHERE comment_id = $1 
        RETURNING 8`, [comment_id])
        .then((result) => result.rows[0]);

}   
//module.exports = {}