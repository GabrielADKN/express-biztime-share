const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({companies: results.rows});
    } catch (err) {
        return next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const companyQuery = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
        if (companyQuery.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        const company = companyQuery.rows[0];

        const industriesQuery = await db.query(`
            SELECT i.name AS industry
            FROM industries i
            JOIN company_industries ci ON i.code = ci.ind_code
            WHERE ci.comp_code = $1
        `, [company.code]);
        const industries = industriesQuery.rows.map(row => row.industry);

        return res.json({ company: { ...company, industries } });
    } catch (err) {
        return next(err);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const {name, description} = req.body;

        const code = slugify(name, {lower: true, strict: true, trim: true});

        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.patch('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const {name, description} = req.body;
        const results = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.json({company: results.rows[0]});
    } catch (err) {
        return next(err);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`DELETE FROM companies WHERE code = $1`, [code]);
        return res.json({status: "deleted"});
    } catch (err) {
        return next(err);
    }
})

module.exports = router;