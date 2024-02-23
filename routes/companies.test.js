process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let comp;

beforeEach(async () => {
    const results = await db.query("INSERT INTO companies (code, name, description) VALUES ('test-code', 'test-name', 'test-desc') RETURNING code, name, description");
    comp = results.rows[0];
});

afterEach(async () => {
    await db.query("DELETE FROM companies WHERE code = 'test-code'");
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Gets a list of companies", async () => {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({companies: [comp]});
    });
});

describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const resp = await request(app).get(`/companies/${comp.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: comp});
    });

    test("Responds with 404 if company not found", async () => {
        const resp = await request(app).get("/companies/nope");
        expect(resp.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Creates a new company", async () => {
        const newCompany = {code: "test-code2", name: "test-name2", description: "test-desc2"};
        const resp = await request(app).post("/companies").send(newCompany);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: newCompany});
    });
});

describe("PATCH /companies/:code", () => {
    test("Updates a company", async () => {
        const resp = await request(app).patch(`/companies/${comp.code}`).send({name: "test-name2", description: "test-desc2"});
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company: {code: comp.code, name: "test-name2", description: "test-desc2"}});
    });

    test("Responds with 404 if company not found", async () => {
        const resp = await request(app).patch("/companies/nope").send({name: "test-name2", description: "test-desc2"});
        expect(resp.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:code", () => {
    test("Deletes a company", async () => {
        const resp = await request(app).delete(`/companies/${comp.code}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({status: "deleted"});
    });
});


