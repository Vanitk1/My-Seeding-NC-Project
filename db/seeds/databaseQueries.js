const db = require("../connection")

db.query("SELECT username FROM users")
  .then((result) => {
    console.log(result.rows)
  })

db.query(`SELECT topic FROM articles WHERE topic = 'coding'`)
.then((result) => {
    console.log(result.rows)
})

db.query(`SELECT votes FROM comments WHERE votes < 0`)
.then((result) => {
    console.log(result.rows)
})

db.query(`SELECT topic FROM articles`)
.then((result) => {
    console.log(result.rows)
})

db.query(`SELECT article_img_url FROM articles WHERE author = 'grumpy19'`)
.then((result) => {
    console.log(result.rows)
})

db.query(`SELECT votes FROM comments WHERE votes > 10`)
.then((result) => {
    console.log(result.rows)
})