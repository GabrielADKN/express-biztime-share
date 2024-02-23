const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const {comp_code, amt} = req.body;
        const results = await db.query(`UPDATE invoices SET comp_code = $1, amt = $2 WHERE id = $3 RETURNING *`, [comp_code, amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({invoice: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
})

router.get('/companies/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoices for company with code of ${code}`, 404);
        }
        return res.json({invoices: results.rows});
    } catch (err) {
        return next(err);
    }
})

module.exports = router