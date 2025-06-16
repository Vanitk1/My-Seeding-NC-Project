const { Pool } = require("pg");
const path = require("path");

const ENV = process.env.NODE_ENV || "development";

if (ENV !== 'production') {
  require('dotenv').config({ path: `${__dirname}/../.env.${ENV}` });
}

const config = {};

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
  config.max = 2;
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("No PGDATABASE or DATABASE_URL configured");
} else if (process.env.DATABASE_URL) {
  console.log(`Connected to ${process.env.DATABASE_URL}`);
} else {
  console.log(`Connected to ${process.env.PGDATABASE}`);
}

const db = new Pool(config);

module.exports = db;
