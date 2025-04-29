const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require('../db/seeds/seed')
const data = require('../db/data/development-data');
const request = require("supertest");
const express = require("express");
const app = require("../api/app");
const { toBeSortedBy } = require("jest-sorted");
//const endpoints = require("../endpoints.json")

/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {return seed(data)});

afterAll(() => {return db.end()});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200, Checks if each topic has slug and description", () => {
    return request(app)
    .get("/api/topics")
    .expect(200)
    .then(({ body }) => {
      expect(body.topics.length).toBeGreaterThan(0);
      body.topics.forEach((topic) => {
        expect(topic).toEqual(
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String)
          })
        );
      });
    });
  });

  test("404, Checks to see if not found error occurs", () => {
    return request(app)
    .get("/api/topics/apple")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Nothing to see here")
    })
  })
});

describe("GET /api/articles/:article_id", () => {
  test("200. checks if the article object contains all the properties ", () => {
    return request(app)
    .get("/api/articles/3") // change the number to test for more articles
    .expect(200)
    .then(({ body: {article}}) => {
      expect(article).toEqual(
        expect.objectContaining({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String)
        })
      )
    })
  });

  test("400: Checks for a bad request", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("404, Checks to see if not found error occurs", () => {
    return request(app)
    .get("/api/articles/458354")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Not found")
    });
  });
});

describe("GET /api/articles", () => {
  test("200, checks for an array of articles objects", () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({ body: {articles} }) => {
      expect(Array.isArray(articles)).toBe(true)
    });
  });

  test("200, checks to see if the article object has no body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number)
            }));
          expect(article).not.toHaveProperty("body");
        });
      });     
    });
  
  test("200, articles are sorted in descending order by date", () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({ body: { articles } }) => {
      expect(articles).toBeSortedBy("created_at", {descending: true}) // created_at is the column date

    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("checks for an array of comments for the given article_id", () => {
    return request(app)
    .get("/api/articles/1/comments")
    .expect(200)
    .then(({ body: { comments } }) => {
      comments.forEach((comment) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number)
          }));
      });
    }); 
  });

  test("200, checks for an empty array if article exists but has no comments", () => {
    return request(app) 
    .get("/api/articles/100/comments")
    .expect(200)
    .then(({ body: { comments } }) => {
    expect(comments).toEqual([]);
    });
  });

  test("400: returns bad request when number is given as a word instead", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
      expect(body.msg).toBe("bad request");
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201, checks if a comment is posted", () => {
    const newComment = {
      username: "King Mittens 1st",
      body: "test comment"
    };

    return request(app)
      .post("/api/articles/7/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            author: "King Mittens 1st",
            article_id: 7,
            votes: expect.any(Number),
            created_at: expect.any(String),
            body: "test comment"
          })
        );
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200, returns updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 4 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            votes: expect.any(Number)
          })
        );
      });
  });

  test("200, checks if votes are negative", () => {
    return request(app)
    .patch("/api/articles/2")
    .send({ inc_votes: -2})
    .expect(200)
    .then(({body}) => {
      expect(body.article.votes).toBeLessThanOrEqual(0)
    })
  })

  test("400: article_id is not a number", () => {
    return request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });

  });
});
    
describe("DELETE api/comments/:comment_id", () => {
  test("204, checks to see if comment is deleted", () => {
    return request(app)
    .delete("/api/comments/1")
    .expect(204)
    .then(({body}) => {
      expect(body).toEqual({})
    });