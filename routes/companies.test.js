process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('test', 'Test Company', 'Just a test');`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("It should respond with an array of companies", async () => {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toBe(200);
        expect(response.body.companies).toEqual(expect.any(Array));
    });
});

describe("GET /companies/:code", () => {
    test("It should return the company with the given code", async () => {
        const response = await request(app).get('/companies/test');
        expect(response.statusCode).toBe(200);
        expect(response.body.company).toEqual({
            code: 'test',
            name: 'Test Company',
            description: 'Just a test'
        });
    });

    test("It should return a 404 for a non-existent company", async () => {
        const response = await request(app).get('/companies/nonexistent');
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("It should create a new company", async () => {
        const newCompany = { code: 'new', name: 'New Company', description: 'Brand new' };
        const response = await request(app)
            .post('/companies')
            .send(newCompany);
        expect(response.statusCode).toBe(201);
        expect(response.body.company).toEqual(newCompany);
    });
});

describe("PATCH /companies/:code", () => {
    test("It should update an existing company", async () => {
        const updatedInfo = { name: 'Updated Name', description: 'Updated Description' };
        const response = await request(app)
            .patch('/companies/test')
            .send(updatedInfo);
        expect(response.statusCode).toBe(200);
        expect(response.body.company.name).toEqual(updatedInfo.name);
        expect(response.body.company.description).toEqual(updatedInfo.description);
    });
});

describe("DELETE /companies/:code", () => {
    test("It should delete an existing company", async () => {
        const response = await request(app).delete('/companies/test');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted" });
    });
});
