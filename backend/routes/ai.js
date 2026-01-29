const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Note: For production, replace these mock responses with actual OpenAI API calls
// Example: const { Configuration, OpenAIApi } = require('openai');

// ========== AI COPILOT ==========
router.post('/copilot', authenticateToken, async (req, res) => {
    try {
        const { message, context } = req.body;

        // In production, use OpenAI API:
        // const completion = await openai.createChatCompletion({
        //     model: "gpt-4",
        //     messages: [
        //         { role: "system", content: "You are a startup advisor..." },
        //         { role: "user", content: message }
        //     ]
        // });

        // Mock response with comprehensive advice
        const responses = {
            funding: {
                response: "Based on your startup stage, here's my advice on funding:\n\n1. **Bootstrap First**: Try to validate your idea with minimal investment. This gives you leverage when talking to investors.\n\n2. **Angel Investors**: For pre-seed/seed stage, focus on angel investors who understand your industry. They typically invest $25k-$100k.\n\n3. **Pitch Deck**: Ensure you have a compelling pitch deck covering: Problem, Solution, Market Size, Business Model, Traction, Team, and Ask.\n\n4. **Valuation**: For pre-revenue startups, typical valuations range from $1M-$5M. Don't over-optimize for valuation in early stages.\n\n5. **Equity**: Expect to give up 10-20% in seed rounds. Preserve equity for future rounds and employee stock options.\n\nWould you like specific advice on any of these areas?",
                suggestions: [
                    "How to find angel investors?",
                    "What should be in my pitch deck?",
                    "How to calculate valuation?",
                    "Equity dilution strategies"
                ]
            },
            team: {
                response: "Building the right team is crucial. Here's my guidance:\n\n1. **Co-founder Selection**: Look for complementary skills. If you're technical, find a business/marketing co-founder and vice versa.\n\n2. **Equity Split**: Common split is 50-50 for 2 co-founders, or 40-30-30 for 3. Use vesting (4 years with 1-year cliff) to protect the company.\n\n3. **First Hires**: Prioritize roles that directly impact revenue or product development. Consider equity-based compensation for early employees.\n\n4. **Culture**: Define your values early. Culture is set by the first 10 employees.\n\n5. **Remote vs Office**: Remote work can access global talent and reduce costs, but requires strong communication systems.\n\nWhat specific team challenge are you facing?",
                suggestions: [
                    "How to find a technical co-founder?",
                    "Equity compensation for employees",
                    "Building remote teams",
                    "Hiring your first employee"
                ]
            },
            mvp: {
                response: "Let's build your MVP strategically:\n\n1. **Core Feature Only**: Identify the ONE feature that solves your core problem. Everything else is a distraction.\n\n2. **Timeline**: Aim for 2-3 months max. If it takes longer, you're building too much.\n\n3. **Tech Stack**: Use proven technologies you know. Don't experiment with new tech in MVP stage.\n\n4. **No-Code Options**: Consider no-code tools (Bubble, Webflow, Airtable) to validate faster.\n\n5. **Feedback Loop**: Launch to 10-50 users, gather feedback, iterate quickly.\n\n6. **Metrics**: Define 2-3 key metrics to track (e.g., user activation, retention, engagement).\n\nWhat's your core feature?",
                suggestions: [
                    "Choosing the right tech stack",
                    "No-code vs custom development",
                    "How to get first users?",
                    "MVP metrics to track"
                ]
            },
            marketing: {
                response: "Here's your marketing strategy:\n\n1. **Product-Led Growth**: Make your product so good that users naturally share it. Build viral loops.\n\n2. **Content Marketing**: Start a blog, create valuable content for your target audience. SEO takes time but compounds.\n\n3. **Community Building**: Build a community around your product (Discord, Slack, Reddit). Engage authentically.\n\n4. **Partnerships**: Partner with complementary products for co-marketing.\n\n5. **Early Channels**:\n   - Product Hunt launch\n   - LinkedIn for B2B\n   - Twitter for tech audience\n   - Reddit communities (provide value, don't spam)\n\n6. **Metrics**: Focus on CAC (Customer Acquisition Cost) and LTV (Lifetime Value). LTV should be 3x CAC.\n\nWhat's your target audience?",
                suggestions: [
                    "Product Hunt launch strategy",
                    "Building a community",
                    "Content marketing tips",
                    "Reducing customer acquisition cost"
                ]
            }
        };

        const category = context?.category || 'funding';
        const advice = responses[category] || responses.funding;

        res.json({
            response: advice.response,
            suggestions: advice.suggestions,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== IDEA VALIDATOR ==========
router.post('/validate-idea', authenticateToken, async (req, res) => {
    try {
        const { idea, industry, targetMarket } = req.body;

        // In production, use AI to analyze the idea
        // For now, providing intelligent mock analysis

        const score = Math.floor(Math.random() * 30) + 70; // 70-100
        const viability = score >= 85 ? 'High' : score >= 70 ? 'Medium' : 'Low';

        const validation = {
            score,
            viability,
            marketSize: `The ${industry || 'target'} market is estimated at $${Math.floor(Math.random() * 50 + 10)}B globally`,
            strengths: [
                "Clear problem-solution fit identified",
                "Growing market with strong demand signals",
                "Potential for scalable business model",
                "Opportunity for differentiation from competitors"
            ],
            weaknesses: [
                "Market validation needed with real customers",
                "Competitive landscape requires deeper analysis",
                "Revenue model needs refinement",
                "Go-to-market strategy requires more detail"
            ],
            recommendations: [
                "Conduct 20-30 customer interviews to validate problem",
                "Build a landing page to test demand (aim for 100+ signups)",
                "Research top 5 competitors and identify your unique value proposition",
                "Create a simple financial model (revenue projections for 3 years)",
                "Define your MVP scope - what's the minimum to test your hypothesis?"
            ],
            nextSteps: [
                "Week 1-2: Customer interviews and market research",
                "Week 3-4: Build landing page and start collecting emails",
                "Week 5-6: Analyze feedback and refine value proposition",
                "Week 7-8: Plan MVP development"
            ]
        };

        res.json({ validation });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== PITCH DECK GENERATOR ==========
router.post('/pitch-deck', authenticateToken, async (req, res) => {
    try {
        const { name, description, industry } = req.body;

        const pitchDeck = {
            slides: [
                {
                    title: "Cover Slide",
                    content: `${name}\n\n"${description}"\n\nYour tagline here\nFounder Name\nDate`
                },
                {
                    title: "Problem",
                    content: "• What problem are you solving?\n• Who experiences this problem?\n• How big is the pain point?\n• Current solutions and their limitations\n• Why now? (market timing)"
                },
                {
                    title: "Solution",
                    content: "• Your unique solution\n• How it solves the problem\n• Key features and benefits\n• Why your approach is better\n• Demo or product screenshots"
                },
                {
                    title: "Market Opportunity",
                    content: `• Total Addressable Market (TAM): $XB\n• Serviceable Addressable Market (SAM): $XB\n• Serviceable Obtainable Market (SOM): $XM\n• Market growth rate: X% CAGR\n• Key market trends supporting your business`
                },
                {
                    title: "Product",
                    content: "• Product overview and key features\n• User journey and experience\n• Technology stack (if relevant)\n• Roadmap and future features\n• Competitive advantages"
                },
                {
                    title: "Business Model",
                    content: "• Revenue streams\n• Pricing strategy\n• Unit economics (CAC, LTV, margins)\n• Sales channels\n• Path to profitability"
                },
                {
                    title: "Traction",
                    content: "• Key metrics and growth\n• Customer testimonials\n• Partnerships or pilot programs\n• Press coverage or awards\n• Milestones achieved"
                },
                {
                    title: "Competition",
                    content: "• Competitive landscape\n• Your unique positioning\n• Barriers to entry\n• Why you'll win\n• Competitive matrix"
                },
                {
                    title: "Team",
                    content: "• Founder backgrounds and expertise\n• Key team members\n• Advisors and board members\n• Why this team can execute\n• Open positions"
                },
                {
                    title: "Financials",
                    content: "• 3-year revenue projections\n• Key assumptions\n• Path to profitability\n• Use of funds\n• Key metrics dashboard"
                },
                {
                    title: "The Ask",
                    content: "• Amount raising: $X\n• Valuation: $X (or terms)\n• Use of funds breakdown\n• Milestones to achieve\n• Expected timeline to next round"
                },
                {
                    title: "Contact",
                    content: "• Contact information\n• Website and social media\n• Thank you\n• Q&A"
                }
            ],
            tips: [
                "Keep slides visual - use images, charts, and minimal text",
                "Tell a compelling story - connect emotionally with investors",
                "Practice your pitch - aim for 10-15 minutes with 5-10 min Q&A",
                "Customize for your audience - research investors beforehand",
                "Have a detailed appendix ready for deep-dive questions",
                "Update traction slide regularly with latest metrics"
            ]
        };

        res.json({ pitchDeck });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== MVP PLANNER ==========
router.post('/mvp-plan', authenticateToken, async (req, res) => {
    try {
        const { productType, timeline } = req.body;

        const mvpPlan = {
            phases: [
                {
                    name: "Phase 1: Discovery & Planning",
                    duration: "2 weeks",
                    tasks: [
                        "Define core user problem and solution",
                        "Identify must-have features (vs nice-to-have)",
                        "Create user stories and acceptance criteria",
                        "Design basic user flows and wireframes",
                        "Choose technology stack",
                        "Set up development environment"
                    ],
                    deliverables: [
                        "Product requirements document",
                        "User flow diagrams",
                        "Low-fidelity wireframes",
                        "Technical architecture document"
                    ]
                },
                {
                    name: "Phase 2: Design & Prototyping",
                    duration: "2 weeks",
                    tasks: [
                        "Create high-fidelity designs for core screens",
                        "Build interactive prototype",
                        "Conduct usability testing with 5-10 users",
                        "Refine designs based on feedback",
                        "Finalize design system (colors, typography, components)"
                    ],
                    deliverables: [
                        "High-fidelity mockups",
                        "Interactive prototype",
                        "Design system documentation",
                        "User testing insights"
                    ]
                },
                {
                    name: "Phase 3: Development",
                    duration: "4-6 weeks",
                    tasks: [
                        "Set up backend infrastructure and database",
                        "Implement core features (prioritized list)",
                        "Build frontend with responsive design",
                        "Integrate third-party services (auth, payments, etc.)",
                        "Implement basic analytics tracking",
                        "Write essential tests"
                    ],
                    deliverables: [
                        "Working MVP application",
                        "API documentation",
                        "Test coverage report",
                        "Deployment scripts"
                    ]
                },
                {
                    name: "Phase 4: Testing & Launch",
                    duration: "2 weeks",
                    tasks: [
                        "Conduct thorough QA testing",
                        "Fix critical bugs",
                        "Set up monitoring and error tracking",
                        "Prepare launch materials (landing page, social posts)",
                        "Soft launch to beta users (50-100 people)",
                        "Gather feedback and iterate",
                        "Public launch"
                    ],
                    deliverables: [
                        "Bug-free MVP",
                        "Launch announcement",
                        "User feedback report",
                        "Iteration roadmap"
                    ]
                }
            ],
            keyMetrics: [
                "User activation rate (% who complete core action)",
                "Daily/Weekly active users",
                "User retention (Day 1, Day 7, Day 30)",
                "Core feature usage",
                "User feedback score (NPS or satisfaction)"
            ],
            successCriteria: [
                "100+ active users in first month",
                "30%+ user retention after 7 days",
                "Positive user feedback (NPS > 30)",
                "Core feature used by 60%+ of users",
                "Less than 5 critical bugs reported"
            ],
            tips: [
                "Focus ruthlessly on core value proposition",
                "Launch faster than you think you should",
                "Talk to users every week",
                "Measure everything from day one",
                "Be ready to pivot based on feedback"
            ]
        };

        res.json({ mvpPlan });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== CONTRACT GENERATOR ==========
router.post('/contract', authenticateToken, async (req, res) => {
    try {
        const { type, parties } = req.body;

        const contracts = {
            nda: {
                title: "Non-Disclosure Agreement (NDA)",
                sections: [
                    "1. Definition of Confidential Information",
                    "2. Obligations of Receiving Party",
                    "3. Time Periods",
                    "4. Exclusions from Confidential Information",
                    "5. Return of Materials",
                    "6. No License",
                    "7. Term and Termination",
                    "8. Remedies",
                    "9. Miscellaneous"
                ],
                keyTerms: [
                    "Confidential information includes business plans, financial data, customer lists, and proprietary technology",
                    "Receiving party must protect information with same care as own confidential information",
                    "Agreement typically lasts 2-5 years",
                    "Mutual NDA protects both parties equally"
                ]
            },
            cofounder: {
                title: "Co-Founder Agreement",
                sections: [
                    "1. Equity Ownership and Vesting",
                    "2. Roles and Responsibilities",
                    "3. Time Commitment",
                    "4. Intellectual Property Assignment",
                    "5. Decision Making Process",
                    "6. Compensation and Expenses",
                    "7. Confidentiality and Non-Compete",
                    "8. Dispute Resolution",
                    "9. Exit and Buyout Provisions",
                    "10. Termination"
                ],
                keyTerms: [
                    "Equity split (e.g., 50-50, 40-30-30) with 4-year vesting and 1-year cliff",
                    "Clear definition of roles: CEO, CTO, etc.",
                    "Full-time commitment expected from all co-founders",
                    "All IP created belongs to the company",
                    "Major decisions require unanimous consent",
                    "Right of first refusal if co-founder wants to leave"
                ]
            },
            advisor: {
                title: "Advisor Agreement",
                sections: [
                    "1. Services and Expectations",
                    "2. Equity Compensation",
                    "3. Vesting Schedule",
                    "4. Time Commitment",
                    "5. Confidentiality",
                    "6. Intellectual Property",
                    "7. Term and Termination",
                    "8. No Conflicts of Interest"
                ],
                keyTerms: [
                    "Typical advisor equity: 0.25% - 1% depending on involvement",
                    "Standard vesting: 2 years with monthly vesting",
                    "Expected commitment: 2-4 hours per month",
                    "Advisor provides strategic guidance, introductions, and expertise",
                    "No compensation beyond equity unless specified"
                ]
            },
            employee: {
                title: "Employee Offer Letter with Equity",
                sections: [
                    "1. Position and Responsibilities",
                    "2. Compensation (Salary + Equity)",
                    "3. Equity Grant Details",
                    "4. Vesting Schedule",
                    "5. Benefits",
                    "6. Confidentiality and IP Assignment",
                    "7. At-Will Employment",
                    "8. Start Date",
                    "9. Acceptance"
                ],
                keyTerms: [
                    "Salary: Market rate for role and location",
                    "Equity: 0.1% - 2% for early employees",
                    "Vesting: 4 years with 1-year cliff",
                    "Benefits: Health insurance, PTO, etc.",
                    "All work product belongs to company",
                    "Employment is at-will (can be terminated by either party)"
                ]
            }
        };

        const contract = contracts[type] || contracts.nda;

        res.json({
            contract: {
                ...contract,
                generatedDate: new Date().toISOString().split('T')[0],
                parties: parties || ["Party A", "Party B"]
            },
            disclaimer: "This is a template for informational purposes only. Please consult with a lawyer before using any legal agreement."
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== SMART MATCHING ==========
router.post('/smart-match', authenticateToken, async (req, res) => {
    try {
        const { role, skills, experience } = req.body;

        // Get all professionals from database
        const professionals = db.prepare(`
            SELECT p.*, u.name, u.email
            FROM professionals p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.availability = 1
        `).all();

        // Simple matching algorithm (in production, use ML)
        const matches = professionals.map(pro => {
            let score = 0;
            const proSkills = JSON.parse(pro.skills || '[]');

            // Match role
            if (pro.role.toLowerCase().includes(role?.toLowerCase() || '')) {
                score += 30;
            }

            // Match skills
            const requiredSkills = skills || [];
            const matchedSkills = proSkills.filter(skill =>
                requiredSkills.some(req => skill.toLowerCase().includes(req.toLowerCase()))
            );
            score += (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 40;

            // Experience bonus
            if (pro.experience && experience) {
                if (pro.experience.includes(experience)) {
                    score += 20;
                }
            }

            // Random factor for diversity
            score += Math.random() * 10;

            return {
                ...pro,
                matchScore: Math.min(Math.round(score), 100),
                matchedSkills,
                reason: `Strong match based on ${matchedSkills.length} matching skills and relevant experience`
            };
        }).filter(m => m.matchScore > 40)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        res.json({
            matches,
            totalMatches: matches.length,
            algorithm: "Skills-based matching with experience weighting"
        });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== BUSINESS MODEL GENERATOR ==========
router.post('/business-model', authenticateToken, async (req, res) => {
    try {
        const { industry, customerType } = req.body;

        const businessModel = {
            revenueStreams: [
                {
                    name: "Subscription Model",
                    description: "Recurring monthly/annual fees",
                    pros: ["Predictable revenue", "High customer LTV", "Easier to scale"],
                    cons: ["Requires ongoing value delivery", "Churn management needed"],
                    pricing: "$10-$100/month depending on tier"
                },
                {
                    name: "Freemium",
                    description: "Free basic tier, paid premium features",
                    pros: ["Low barrier to entry", "Viral growth potential", "Large user base"],
                    cons: ["Low conversion rates (2-5%)", "Support costs for free users"],
                    pricing: "Free + $20-$50/month for premium"
                },
                {
                    name: "Transaction Fees",
                    description: "Take a % of transactions on platform",
                    pros: ["Scales with usage", "Aligned with customer success"],
                    cons: ["Requires high volume", "Sensitive to pricing"],
                    pricing: "5-20% per transaction"
                },
                {
                    name: "Enterprise Licensing",
                    description: "Custom pricing for large organizations",
                    pros: ["High contract values", "Stable revenue", "Less churn"],
                    cons: ["Long sales cycles", "Custom development needed"],
                    pricing: "$50k-$500k+ annually"
                }
            ],
            unitEconomics: {
                CAC: "Customer Acquisition Cost: $50-$200",
                LTV: "Lifetime Value: $500-$2000",
                ratio: "Target LTV:CAC ratio of 3:1 or higher",
                payback: "Aim for CAC payback in 12 months or less"
            },
            recommendations: [
                "Start with one revenue stream and validate before adding others",
                "Price based on value delivered, not cost",
                "Consider hybrid models (e.g., freemium + enterprise)",
                "Build in pricing flexibility for experimentation",
                "Track metrics religiously from day one"
            ]
        };

        res.json({ businessModel });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== MARKET RESEARCH ==========
router.post('/market-research', authenticateToken, async (req, res) => {
    try {
        const { industry, geography } = req.body;

        const research = {
            marketSize: {
                TAM: `$${Math.floor(Math.random() * 100 + 50)}B globally`,
                SAM: `$${Math.floor(Math.random() * 30 + 10)}B in ${geography || 'target region'}`,
                SOM: `$${Math.floor(Math.random() * 5 + 1)}B achievable in 3-5 years`,
                growth: `${Math.floor(Math.random() * 20 + 10)}% CAGR`
            },
            trends: [
                "Digital transformation accelerating across industries",
                "Remote work driving new software adoption",
                "AI/ML integration becoming standard expectation",
                "Sustainability and ESG increasingly important",
                "Mobile-first experiences now mandatory"
            ],
            competitors: [
                {
                    name: "Competitor A",
                    strength: "Market leader with strong brand",
                    weakness: "Legacy technology, slow to innovate",
                    marketShare: "35%"
                },
                {
                    name: "Competitor B",
                    strength: "Strong product features",
                    weakness: "Poor customer service",
                    marketShare: "25%"
                },
                {
                    name: "Competitor C",
                    strength: "Low pricing",
                    weakness: "Limited functionality",
                    marketShare: "15%"
                }
            ],
            opportunities: [
                "Underserved customer segment identified",
                "Technology gap in current solutions",
                "Changing regulations creating new demand",
                "Market consolidation creating opportunities",
                "Geographic expansion potential"
            ],
            threats: [
                "Well-funded competitors entering market",
                "Technology disruption risk",
                "Economic downturn impact",
                "Regulatory changes",
                "Customer switching costs"
            ]
        };

        res.json({ research });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

// ========== GROWTH STRATEGY ==========
router.post('/growth-strategy', authenticateToken, async (req, res) => {
    try {
        const { stage, budget } = req.body;

        const strategy = {
            channels: [
                {
                    name: "Content Marketing",
                    cost: "Low",
                    timeToResults: "3-6 months",
                    tactics: [
                        "Start a blog with SEO-optimized content",
                        "Create comprehensive guides and resources",
                        "Guest post on industry publications",
                        "Build email newsletter"
                    ],
                    kpis: ["Organic traffic", "Email subscribers", "Content engagement"]
                },
                {
                    name: "Product-Led Growth",
                    cost: "Medium",
                    timeToResults: "1-3 months",
                    tactics: [
                        "Free trial or freemium model",
                        "In-product viral loops",
                        "Referral program with incentives",
                        "Self-serve onboarding"
                    ],
                    kpis: ["Activation rate", "Viral coefficient", "Trial-to-paid conversion"]
                },
                {
                    name: "Community Building",
                    cost: "Low",
                    timeToResults: "2-4 months",
                    tactics: [
                        "Create Slack/Discord community",
                        "Host webinars and workshops",
                        "Engage in relevant online communities",
                        "User-generated content campaigns"
                    ],
                    kpis: ["Community size", "Engagement rate", "Community-driven signups"]
                },
                {
                    name: "Paid Advertising",
                    cost: "High",
                    timeToResults: "Immediate",
                    tactics: [
                        "Google Ads for high-intent keywords",
                        "LinkedIn Ads for B2B",
                        "Facebook/Instagram for B2C",
                        "Retargeting campaigns"
                    ],
                    kpis: ["CAC", "ROAS", "Conversion rate"]
                }
            ],
            timeline: [
                {
                    phase: "Month 1-2: Foundation",
                    focus: "Product-market fit validation",
                    goals: ["100 users", "Positive feedback", "Core metrics defined"]
                },
                {
                    phase: "Month 3-4: Early Growth",
                    focus: "Channel experimentation",
                    goals: ["500 users", "2-3 channels tested", "Unit economics understood"]
                },
                {
                    phase: "Month 5-6: Scaling",
                    focus: "Double down on working channels",
                    goals: ["2000 users", "Profitable CAC", "Retention > 40%"]
                }
            ],
            metrics: [
                "North Star Metric: [Define based on your product]",
                "Acquisition: New signups per week",
                "Activation: % completing core action",
                "Retention: % active after 30 days",
                "Revenue: MRR growth rate",
                "Referral: Viral coefficient"
            ]
        };

        res.json({ strategy });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

module.exports = router;
