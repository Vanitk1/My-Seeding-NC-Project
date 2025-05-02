const { Query } = require("pg/lib/client.js");
const db = require("../db/connection");

exports.selectTopics = () => {
    return db.query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => {
        return rows;
    })
}

exports.selectArticleById = (article_id) => {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
        COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id`, [article_id])
     .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject ({ status: 404, msg: "Not found" });
        }
        return rows[0];
     })
}

exports.selectArticles = (sort_by = "created_at", order = "DESC", topic) => {
    const validColumns = ["author", "title", "article_id", "topic", "created_at", "votes", "comment_count", "article_img_url"];
    const validOrder = ["ASC", "DESC"];

    if (!validColumns.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "sort_by column not found" });
    } else if (!validOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "incorrect order query" });
    }

    let checkTopicExists;

    if (topic) {
        checkTopicExists = db.query(`SELECT * FROM topics WHERE slug = $1`, [topic]);
    } else {
        checkTopicExists = Promise.resolve();
    }

    return checkTopicExists.then((results) => {
        if (topic && results.rows.length === 0) {
            return Promise.reject({ status: 404, msg: "topic not found" });
        }

        const topicValues = [];
        let where = "";

        if (topic) {
            where = `WHERE articles.topic = $1`;
            topicValues.push(topic);
        }

        const queryStr = `
        SELECT articles.author, articles.title, articles.article_id, articles.topic,
        articles.created_at, articles.votes, articles.article_img_url, 
        COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id ${where}
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order};`;

        return db.query(queryStr, topicValues)
        .then(({ rows }) => {
            return rows;
        });
    });
};


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
        .catch((err) => {
            if (err.code === "23503") {
                if (err.detail.includes("article_id")) {
                    return Promise.reject({status: 404, msg: "Article does not exist"})
                } else if (err.detail.includes("author")) {
                    return Promise.reject({status: 404, msg: "User doesnt exist"})
                }
                return Promise.reject(err)
            }
        })

}

exports.updateArticleId = (article_id, inc_votes) => {
    
    if(typeof inc_votes !== "number") {
        return Promise.reject({ status: 400, msg: "Wrong votes" });
    }
    
    return db.query (`UPDATE articles SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *`, [inc_votes, article_id])
        .then((results) => results.rows[0])

}

exports.removeCommentId = (comment_id) => {
    return db.query (`DELETE FROM comments 
        WHERE comment_id = $1
        RETURNING *`, [comment_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
              return Promise.reject({ status: 404, msg: "Comment does not exist" });
            }
        })
}

exports.selectUsers = (sort_by = "username", order = "DESC") => {
    const validColumns = ["username", "name", "avatar_url"]
    const validOrder = ["ASC", "DESC"]

    if (!validColumns.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "invalid sort_by column" });
      } else if (!validOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "invalid order query" });
      }

    const queryStr = `SELECT username, name, avatar_url 
        FROM users
        ORDER BY ${sort_by} ${order}`

    return db.query(queryStr)
    .then(({ rows }) => {
        return rows;
    });
}

exports.updateCommentId = (comment_id, inc_votes) => {

    if(typeof inc_votes !== "number") {
        return Promise.reject({ status: 400, msg: "Wrong votes" });
    }

    return db.query (`UPDATE comments 
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *`,
        [inc_votes, comment_id])
        .then((results) => results.rows[0])
}

exports.insertArticle = ({ author, title, body, topic, article_img_url= "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" }) => {

    if(!author || !title || !body || !topic ) {
        return Promise.reject({status: 400, msg: "Complete all required properties"})
    }

    return db.query(`INSERT INTO articles (author, title, body, topic, article_img_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`, [author, title, body, topic, article_img_url])
        .then(({ rows }) => {
            rows[0].comment_count = 0; // manually adds comment_count to article
            return rows[0];
        })

}

exports.insertTopics = (slug, description, img_url = "https://...") => {

    if(!slug || !description) {
        return Promise.reject({status: 400, msg: "Complete all required properties"})
    }

    return db.query(`INSERT INTO topics (slug, description, img_url)
        VALUES ($1, $2, $3)
        RETURNING *`, 
        [slug, description, img_url])
        .then((results) => results.rows[0]);
}

exports.removeArticleId = (article_id) => {
    return db.query (`DELETE FROM comments 
        WHERE article_id = $1
        RETURNING *`, [article_id])
        .then(() => {
            return db.query(`DELETE FROM articles 
                WHERE article_id = $1 
                RETURNING *`,
                [article_id]
            );
        })
        .then(({ rows }) => {
            
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Article does not exist" });
            }
        });
      
}
