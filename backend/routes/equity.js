const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ========== EQUITY OFFERS ==========

// Get all equity offers for a startup
router.get('/offers/startup/:startupId', authenticateToken, (req, res) => {
    try {
        const offers = db.prepare(`
            SELECT eo.*, u.name as professional_name, u.email as professional_email
            FROM equity_offers eo
            LEFT JOIN users u ON eo.professional_id = u.id
            WHERE eo.startup_id = ?
            ORDER BY eo.created_at DESC
        `).all(req.params.startupId);

        res.json({ offers });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Get equity offers for a professional
router.get('/offers/professional/:userId', authenticateToken, (req, res) => {
    try {
        const offers = db.prepare(`
            SELECT eo.*, s.name as startup_name, s.description as startup_description
            FROM equity_offers eo
            LEFT JOIN startups s ON eo.startup_id = s.id
            WHERE eo.professional_id = ?
            ORDER BY eo.created_at DESC
        `).all(req.params.userId);

        res.json({ offers });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Create equity offer
router.post('/offers', authenticateToken, (req, res) => {
    try {
        const { startup_id, professional_id, equity_percentage, vesting_period, cliff_period, role, salary } = req.body;

        // Validate
        if (!startup_id || !professional_id || !equity_percentage) {
            return res.status(400).json({ error: { message: 'Missing required fields' } });
        }

        const result = db.prepare(`
            INSERT INTO equity_offers (startup_id, professional_id, equity_percentage, vesting_period, cliff_period, role, salary, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `).run(startup_id, professional_id, equity_percentage, vesting_period || 48, cliff_period || 12, role, salary || 0);

        const offer = db.prepare('SELECT * FROM equity_offers WHERE id = ?').get(result.lastInsertRowid);

        // Create notification
        db.prepare(`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES (?, 'EQUITY_OFFER', 'New Equity Offer', 'You received an equity offer')
        `).run(professional_id);

        res.status(201).json({ offer });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update offer status (accept/reject)
router.put('/offers/:id/status', authenticateToken, (req, res) => {
    try {
        const { status } = req.body;

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: { message: 'Invalid status' } });
        }

        db.prepare('UPDATE equity_offers SET status = ? WHERE id = ?').run(status, req.params.id);

        const offer = db.prepare('SELECT * FROM equity_offers WHERE id = ?').get(req.params.id);

        // If accepted, add to cap table
        if (status === 'ACCEPTED') {
            const vestingStart = new Date().toISOString();
            const vestingEnd = new Date();
            vestingEnd.setMonth(vestingEnd.getMonth() + offer.vesting_period);

            db.prepare(`
                INSERT INTO cap_table (startup_id, stakeholder_id, stakeholder_type, equity_percentage, vesting_start, vesting_end, cliff_months)
                VALUES (?, ?, 'EMPLOYEE', ?, ?, ?, ?)
            `).run(offer.startup_id, offer.professional_id, offer.equity_percentage, vestingStart, vestingEnd.toISOString(), offer.cliff_period);
        }

        res.json({ offer });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== CAP TABLE ==========

// Get cap table for a startup
router.get('/cap-table/:startupId', authenticateToken, (req, res) => {
    try {
        const entries = db.prepare(`
            SELECT ct.*, u.name as stakeholder_name, u.email as stakeholder_email
            FROM cap_table ct
            LEFT JOIN users u ON ct.stakeholder_id = u.id
            WHERE ct.startup_id = ?
            ORDER BY ct.equity_percentage DESC
        `).all(req.params.startupId);

        // Calculate total allocated
        const totalAllocated = entries.reduce((sum, entry) => sum + entry.equity_percentage, 0);

        res.json({
            entries,
            totalAllocated,
            available: 100 - totalAllocated
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Add cap table entry
router.post('/cap-table', authenticateToken, (req, res) => {
    try {
        const { startup_id, stakeholder_id, stakeholder_type, equity_percentage, vesting_start, vesting_end, cliff_months } = req.body;

        const result = db.prepare(`
            INSERT INTO cap_table (startup_id, stakeholder_id, stakeholder_type, equity_percentage, vesting_start, vesting_end, cliff_months)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(startup_id, stakeholder_id, stakeholder_type, equity_percentage, vesting_start, vesting_end, cliff_months || 0);

        const entry = db.prepare('SELECT * FROM cap_table WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ entry });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Update cap table entry
router.put('/cap-table/:id', authenticateToken, (req, res) => {
    try {
        const { equity_percentage, vesting_start, vesting_end, cliff_months } = req.body;

        db.prepare(`
            UPDATE cap_table 
            SET equity_percentage = ?, vesting_start = ?, vesting_end = ?, cliff_months = ?
            WHERE id = ?
        `).run(equity_percentage, vesting_start, vesting_end, cliff_months, req.params.id);

        const entry = db.prepare('SELECT * FROM cap_table WHERE id = ?').get(req.params.id);

        res.json({ entry });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== EQUITY CALCULATOR ==========

// Calculate vesting schedule
router.post('/calculator/vesting', authenticateToken, (req, res) => {
    try {
        const { equity_percentage, vesting_months, cliff_months, start_date } = req.body;

        const schedule = [];
        const startDate = new Date(start_date || Date.now());
        const monthlyVesting = equity_percentage / vesting_months;

        for (let month = 0; month <= vesting_months; month++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + month);

            let vestedPercentage = 0;
            if (month >= cliff_months) {
                vestedPercentage = month * monthlyVesting;
            }

            schedule.push({
                month,
                date: date.toISOString().split('T')[0],
                vestedPercentage: Math.min(vestedPercentage, equity_percentage),
                unvestedPercentage: Math.max(equity_percentage - vestedPercentage, 0)
            });
        }

        res.json({ schedule });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Calculate dilution
router.post('/calculator/dilution', authenticateToken, (req, res) => {
    try {
        const { current_equity, new_investment_amount, pre_money_valuation } = req.body;

        const postMoneyValuation = pre_money_valuation + new_investment_amount;
        const newInvestorEquity = (new_investment_amount / postMoneyValuation) * 100;
        const dilutedEquity = current_equity * (1 - (newInvestorEquity / 100));
        const dilutionPercentage = ((current_equity - dilutedEquity) / current_equity) * 100;

        res.json({
            preMoneyValuation: pre_money_valuation,
            newInvestmentAmount: new_investment_amount,
            postMoneyValuation,
            newInvestorEquity,
            currentEquity: current_equity,
            dilutedEquity,
            dilutionPercentage
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// Calculate exit value
router.post('/calculator/exit', authenticateToken, (req, res) => {
    try {
        const { equity_percentage, exit_valuation, liquidation_preference } = req.body;

        const equityValue = (equity_percentage / 100) * exit_valuation;
        const afterPreference = Math.max(equityValue - (liquidation_preference || 0), 0);

        res.json({
            exitValuation: exit_valuation,
            equityPercentage: equity_percentage,
            equityValue,
            liquidationPreference: liquidation_preference || 0,
            netValue: afterPreference
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

module.exports = router;
