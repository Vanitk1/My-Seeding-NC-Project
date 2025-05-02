const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require('../db/seeds/seed')
const data = require('../db/data/development-data');
const request = require("supertest");
const express = require("express");
const app = require("../app");
const { toBeSortedBy } = require("jest-sorted");

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
  test("200. checks if the article object contains all the properties and the comment_count ", () => {
    return request(app)
    .get("/api/articles/3")
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
          article_img_url: expect.any(String),
          comment_count: expect.any(Number)
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

  test("201, ignores all unnecessary properties on the request body", () => {
    const newComments = {
      username: "King Mittens 1st",
      body: "test comment",
      age: 4,
      likes: "sleeping"
    }

    return request(app)
    .post("/api/articles/7/comments")
    .send(newComments)
    .expect(201)
    .then(({ body }) => {
      expect(body.comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          author: "King Mittens 1st",
          article_id: 7,
          votes: expect.any(Number),
          created_at: expect.any(String),
          body: "test comment"
        })
      )
    })
  })

  test("400, checks for an error when body is missing", () => {
    return request(app)
    .post("/api/articles/7/comments")
    .send({username: "King Mittens 1st"})
    .expect(400)
  })

  test("400, checks for an error when username is missing", () => {
    return request(app)
    .post("/api/articles/7/comments")
    .send({body: "test comment"})
    .expect(400)
  })

  test("404, returns this error if article doesnt exist", () => {
    const errComment = {
      username: "Nathan",
      body: "set to fail"
    }

    return request(app)
    .post("/api/articles/9999/comments")
    .send(errComment)
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Article does not exist");
    });
  })

  test("404, returns this error if user doesnt exist", () => {
    const errComments = {
      username: "fhsbfsj",
      body: "test set to fail"
    }
    return request(app)
    .post("/api/articles/7/comments")
    .send(errComments)
    .expect(404)
    .then(({ body}) => {
      expect(body.msg).toBe("User doesnt exist")
    })
  })

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

  test("400, article_id is not a number", () => {
    return request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("400, checks if wrong votes is sent when wrong data type is given", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({inc_votes: "cats"})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("Wrong votes")
    });
  });

  test("400, returns a error if inc_votes is missing", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("Wrong votes")
    });
  });
});
    
describe("DELETE api/comments/:comment_id", () => {
  test("204, checks to see if comment is deleted", () => {
    return request(app)
    .delete("/api/comments/1")
    .expect(204)
  });

  test("404, if comment_id doesnt exist returns error", () => {
    return request(app)
    .delete("/api/comments/9999")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Comment does not exist");
    });
  })

  test("400, returns a bad request when comment_id is invalid", () => {
    return request (app)
    .delete("/api/comments/cats")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("bad request")
    })
  })
});

describe("GET api/users", () => {
  test("200, checks for all users", () => {
    return request(app)
    .get("/api/users")
    .expect(200)
    .then(({body}) => {
      expect(body.users).toHaveLength(8) // users.js contains 8 users
      body.users.forEach((user) => {
        expect(user).toEqual((
          expect.objectContaining({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
        ));
      });
    });
  });

  test("404: responds with error for invalid route", () => {
    return request(app)
      .get("/api/userz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Nothing to see here");
      });
    });

  test("400, returns an error when column is invalid", () => {
    return request(app)
    .get("/api/users?sort_by=tools")
    .expect(400)
    .then(({ body}) => {
      expect(body.msg).toBe("invalid sort_by column")
    });
  });

  test("400, returns an error when order is invalid", () => {
    return request(app)
    .get("/api/users?sort_by=name&order=up")
    .expect(400)
    .then(({ body}) => {
      expect(body.msg).toBe("invalid order query")
    });
  });

  test("200, returns a user by username", () => {
    return request(app)
    .get("/api/users?username=TomTickle")
    .expect(200)
    .then(({ body }) => {
      body.users.forEach((user) => {
        expect(user).toEqual((
          expect.objectContaining({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String)
          })
        ));
      });
    });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  test("200, sort articles in ASC", () => {
    return request(app)
    .get("/api/articles?sort_by=votes&order=ASC")
    .expect(200)
    .then(({ body}) => {
      expect(body.articles).toBeSortedBy("votes", {ascending: true})
    })
  })

  test("200, sort articles by title in DESC", () => {
    return request(app)
    .get("/api/articles?sort_by=title&order=DESC")
    .expect(200)
    .then(({ body}) => {
      expect(body.articles).toBeSortedBy("title", {descending: true})
    })
    /* Can change the sort_by <any column> and the order by ASC/DESC
    to any of the vaild columns set in the model.js.
    remeber to change the "title" to the correct column too.
    */
  })

  test("400, bad request for sort_by", () => {
    return request(app)
    .get("/api/articles?sort_by=cats")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("sort_by column not found")
    })
  })

  test("400, bad request for order query", () => {
    return request(app)
    .get("/api/articles?order=up")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("incorrect order query")
    })
  })
})

describe("GET api/articles?topics", () => {
  test("200, filters articles by topics", () => {
    return request(app)
    .get("/api/articles?topic=coding")
    .expect(200)
    .then(({ body }) => {
      body.articles.forEach((article) => {
        expect(article.topic).toBe("coding");
      });
    });
  });

  test("404, if topic does not exist, returns error", () => {
    return request(app)
    .get("/api/articles?topic=faketopic")
    .expect(404)
    .then(({ body}) => {
      expect(body.msg).toBe("topic not found")
    })
  })
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: updates and returns the comment with incremented votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 3 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: 1,
            votes: expect.any(Number)
          })
        );
      });
  });

  test("400: invalid inc_votes type", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "two" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Wrong votes");
      });
  });
})

describe("POST api/articles", () => {
  test("201, returns new article", () => {
    const newArticle = {
      author: "Queen Mittens 1st",
      title: "How to take over the world",
      body: "Cats will rule the world!",
      topic: "World domination",
      article_img_url: "https://images.pexels.com/photos/1314550/pexels-photo-1314550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }

    return request(app)
    .post("/api/articles")
    .send(newArticle)
    .expect(201)
    .then(({ body: { article }}) => {
      expect(article).toEqual(
        expect.objectContaining({
          article_id: expect.any(Number),
          author: expect.any(String),
          title: expect.any(String),
          body: expect.any(String),
          topic: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
          created_at:expect.any(String),
          comment_count: expect.any(Number)
        })
      );
    });
  });

  test("201, Checks if the article is actually added", () => {
    const newArticle = {
      author: "Queen Mittens 1st",
      title: "How to take over the world",
      body: "Cats will rule the world!",
      topic: "World domination",
      article_img_url: "https://images.pexels.com/photos/1314550/pexels-photo-1314550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    }

    return request(app)
    .post("/api/articles")
    .send(newArticle)
    .expect(201)
    .then(({ body: { article }}) => {
      expect(article).toEqual(
        expect.objectContaining({
          article_id: expect.any(Number),
          author: "Queen Mittens 1st",
          title: "How to take over the world",
          body: "Cats will rule the world!",
          topic: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
          created_at:expect.any(String),
          comment_count: expect.any(Number)
        })
      );
    });
  });

  test("400, if one property is missing returns error", () => {
    return request(app)
    .post("/api/articles")
    .send({author: "only author given"})
    .expect(400)
    // .then(({ body }) => {
    //   expect(body.msg).toBe("Complete all required properties")
    // })
  })
});

describe("POST api/topics", () => {
  test("201, returns a new topic", () => {
    const newTopic = {
      slug: "gaming",
      description: "I like to play games!",
      img_url: "https://..."
    }

    return request(app)
    .post("/api/topics")
    .send(newTopic)
    .expect(201)
    .then(({ body }) => {
      expect(body.topic).toEqual(
        expect.objectContaining(newTopic)
      )
    })
  })

  test("400, returns an error if any property is missing", () => {
    return request(app)
    .post("/api/topics")
    .send({slug: "no description here"})
    .expect(400)
  })
})

describe("DELETE /api/articles/:article_id", () => {
  test("204, checks to see if article is deleted", () => {
    return request(app)
    .delete("/api/articles/1")
    .expect(204)
  });

  test("404, if article_id doesnt exist returns error", () => {
    return request(app)
    .delete("/api/articles/9999")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Article does not exist");
    });
  })

  test("400, returns a bad request when article_id is invalid", () => {
    return request (app)
    .delete("/api/articles/cats")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("bad request")
    })
  })
});
