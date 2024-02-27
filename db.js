/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
    DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/biztime_test`;
} else {
    DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/biztime`;
}

console.log(DB_URI);
let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;
