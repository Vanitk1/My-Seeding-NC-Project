const db = require("../connection")
const format = require("pg-format")
const {convertTimestampToDate} = require("../seeds/utils")

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`DROP TABLE IF EXISTS users, topics, articles, comments`)
  .then(() => {
    return db.query(`
      CREATE TABLE topics (
      slug VARCHAR PRIMARY KEY,
      description VARCHAR NOT NULL,
      img_url VARCHAR(1000) NOT NULL
      )`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE users (
      username VARCHAR PRIMARY KEY,
      name VARCHAR NOT NULL,
      avatar_url VARCHAR(1000) NOT NULL
      )`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        topic VARCHAR NOT NULL REFERENCES topics(slug),
        author VARCHAR NOT NULL REFERENCES users(username),
        body TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR (1000)
        )`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT NOT NULL REFERENCES articles(article_id),
        body TEXT NOT NULL,
        votes INT DEFAULT 0,
        author VARCHAR NOT NULL REFERENCES users(username),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`)
    })
    .then(() => {
      const topicValues = topicData.map(({slug, description, img_url}) => {
        return [slug, description, img_url]
      })

      const topicsQuery = format(`
        INSERT INTO topics (slug, description, img_url) 
        VALUES %L`, topicValues
      )
      return db.query(topicsQuery);
    })
    .then(() => {
      const userValues = userData.map(({username, name, avatar_url}) => {
        return [username, name, avatar_url]
      })
      const userQuery = format(`
        INSERT INTO users (username, name, avatar_url)
        VALUES %L`, userValues)

      return db.query(userQuery);
    })
    .then(() => {
      const articles = articleData.map(convertTimestampToDate);

      const articleValues = articles.map(({title, topic, author, body, created_at, votes, article_img_url}) => {
        return [title, topic, author, body, created_at, votes, article_img_url]
      })
      const articleQuery = format(`
        INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url)
        VALUES %L`, articleValues)

      return db.query(articleQuery);
    })
    // .then(() => {
    //   const comments = commentData.map(convertTimestampToDate);

    //   const commentsValues = comments.map(({article_id, body, votes, author, created_at}) => {
    //     return [article_id, body, votes, author, created_at]
    //   })
    //   const commentsQuery = format(`
    //     INSERT INTO comments (article_id, body, votes, author, created_at)
    //     VALUES %L`, commentsValues)

    //   return db.query(commentsQuery);
    // })
}
module.exports = seed;
