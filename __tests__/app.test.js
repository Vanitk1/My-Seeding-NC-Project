const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require('../db/seeds/seed')
const data = require('../db/data/development-data');
const request = require("supertest");
const app = require("../api/app");
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
    })
  })
});