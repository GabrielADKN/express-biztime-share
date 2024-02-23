// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let comp;
let inv;

beforeEach(async () => {
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test-code', 'test-name', 'test-desc') RETURNING code, name, description`);
    comp = results.rows[0];
    const results2 = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test-code', 100) RETURNING comp_code, amt`);
    inv = results2.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices WHERE comp_code = 'test-code'`);
});

afterAll(async () => {
    await db.end();
})


describe('GET /invoices', () => {
    test('Gets a list of invoices', async () => {
        const resp = await request(app).get('/invoices');
        expect(resp.body).toEqual({invoices: [inv]});
    });
})

describe('GET /invoices/:id', () => {
    test('Gets a single invoice', async () => {
        const resp = await request(app).get(`/invoices/${inv.comp_code}`);
        expect(resp.body).toEqual({invoice: inv});
    });
})


describe('POST /invoices', () => {
    test('Creates a new invoice', async () => {
        const resp = await request(app).post('/invoices').send({comp_code: 'test-code', amt: 200});
        expect(resp.body).toEqual({invoice: {comp_code: 'test-code', amt: 200}});
    });
})


describe('PATCH /invoices/:id', () => {
    test('Updates an invoice', async () => {
        const resp = await request(app).patch(`/invoices/${inv.comp_code}`).send({amt: 200});
        expect(resp.body).toEqual({invoice: {comp_code: 'test-code', amt: 200}});
    });
})


describe('DELETE /invoices/:id', () => {
    test('Deletes an invoice', async () => {
        const resp = await request(app).delete(`/invoices/${inv.comp_code}`);
        expect(resp.body).toEqual({status: 'deleted'});
    });
})

describe('GET /invoices/:id/companies', () => {
    test('Gets a single invoice', async () => {
        const resp = await request(app).get(`/invoices/${inv.comp_code}/companies`);
        expect(resp.body).toEqual({companies: [comp]});
    });
})