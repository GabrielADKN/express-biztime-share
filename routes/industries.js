const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT i.code AS industry_code, i.name AS industry, array_agg(ci.comp_code) AS company_codes
            FROM industries i
            LEFT JOIN company_industries ci ON i.code = ci.ind_code
            GROUP BY i.code, i.name
        `);
        return res.json({ industries: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`
            SELECT i.code AS industry_code, i.name AS industry, array_agg(ci.comp_code) AS company_codes
            FROM industries i
            LEFT JOIN company_industries ci ON i.code = ci.ind_code
            WHERE i.code = $1
            GROUP BY i.code, i.name
        `, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${code}`, 404);
        }
        return res.json({ industry: results.rows[0] });
    } catch (err) {
        return next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body;
        const code = slugify(name, { lower: true, strict: true, trim: true });
        const results = await db.query(`
            INSERT INTO industries (code, name)
            VALUES ($1, $2)
            RETURNING code, name
        `, [code, name]);
        return res.status(201).json({ industry: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.post('/:code/companies', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { companyCode } = req.body;
        const results = await db.query(`
            INSERT INTO company_industries (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code
        `, [companyCode, code]);
        return res.status(201).json({ company_industry: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;