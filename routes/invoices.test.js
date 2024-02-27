// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let comp, inv;

beforeEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM invoices;`);
    
    let result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test-code', 'test-name', 'test-desc') RETURNING code, name, description`);
    comp = result.rows[0];
    
    result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test-code', 100) RETURNING id, comp_code, amt`);
    inv = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies;`);
    await db.query(`DELETE FROM invoices;`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /invoices', () => {
    test('Gets a list of invoices', async () => {
        const resp = await request(app).get('/invoices');
        expect(resp.status).toBe(200);
        expect(resp.body.invoices).toEqual(expect.arrayContaining([expect.objectContaining({ id: inv.id })]));
    });
});

describe('GET /invoices/:id', () => {
    test('Gets a single invoice', async () => {
        const resp = await request(app).get(`/invoices/${inv.id}`);
        expect(resp.status).toBe(200);
        expect(resp.body.invoice).toEqual(expect.objectContaining({ id: inv.id }));
    });
});

describe('POST /invoices', () => {
    test('Creates a new invoice', async () => {
        const newInvoice = { comp_code: 'test-code', amt: 200 };
        const resp = await request(app).post('/invoices').send(newInvoice);
        expect(resp.status).toBe(201);
        expect(resp.body.invoice).toEqual(expect.objectContaining(newInvoice));
    });
});

describe('PATCH /invoices/:id', () => {
    test('Updates an invoice', async () => {
        const resp = await request(app).patch(`/invoices/${inv.id}`).send({ amt: 250 });
        expect(resp.status).toBe(200);
        expect(resp.body.invoice).toEqual(expect.objectContaining({ id: inv.id, amt: 250 }));
    });
});

describe('DELETE /invoices/:id', () => {
    test('Deletes an invoice', async () => {
        const resp = await request(app).delete(`/invoices/${inv.id}`);
        expect(resp.status).toBe(200);
        expect(resp.body).toEqual({ status: 'deleted' });
    });
});

// Assuming this is a valid test case for your setup
describe('GET /invoices/:id/companies', () => {
    test('Gets the company for a single invoice', async () => {
        const resp = await request(app).get(`/invoices/${inv.id}/companies`);
        expect(resp.status).toBe(200);
        // Assuming your API returns company details associated with the invoice
        expect(resp.body.company).toEqual(expect.objectContaining({ code: comp.code }));
    });
});
