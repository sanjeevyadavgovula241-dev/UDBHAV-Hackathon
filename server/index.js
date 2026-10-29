require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const complianceRoutes = require('./compliance/routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MOCK DATA ---
const clients = [
  { id: 1, name: 'Acme Corp', industry: 'Manufacturing', revenue: 120000, lastActivity: '2023-10-25', status: 'Active', costToServe: 20000 },
  { id: 2, name: 'Globex', industry: 'Tech', revenue: 85000, lastActivity: '2023-10-20', status: 'Active', costToServe: 15000 },
  { id: 3, name: 'Soylent Corp', industry: 'Food', revenue: 45000, lastActivity: '2023-09-15', status: 'Inactive', costToServe: 10000 },
  { id: 4, name: 'Initech', industry: 'Software', revenue: 210000, lastActivity: '2023-10-28', status: 'Active', costToServe: 30000 },
  { id: 5, name: 'Umbrella Corp', industry: 'Healthcare', revenue: 320000, lastActivity: '2023-10-29', status: 'Active', costToServe: 50000 }
];

const pipeline = [
  { stage: 'Lead', count: 45, value: 500000 },
  { stage: 'Qualified', count: 25, value: 350000 },
  { stage: 'Proposal', count: 12, value: 200000 },
  { stage: 'Negotiation', count: 5, value: 120000 },
  { stage: 'Closed Won', count: 18, value: 450000 }
];

const products = [
  { id: 1, name: 'Industrial Widget A', supplier: 'MetalWorks Inc.', stock: 450, status: 'In Stock', unitsSold: 1200 },
  { id: 2, name: 'Copper Wiring B', supplier: 'ElecTronic Co.', stock: 12, status: 'Low Stock', unitsSold: 500 },
  { id: 3, name: 'Steel Bearings', supplier: 'MetalWorks Inc.', stock: 0, status: 'Out of Stock', unitsSold: 850 },
  { id: 4, name: 'Circuit Board X1', supplier: 'TechParts Ltd.', stock: 85, status: 'In Stock', unitsSold: 2100 }
];

const financials = [
  { month: 'Jan', revenue: 120000, cogs: 40000, gross: 80000, opex: 30000, net: 50000 },
  { month: 'Feb', revenue: 135000, cogs: 45000, gross: 90000, opex: 32000, net: 58000 },
  { month: 'Mar', revenue: 150000, cogs: 50000, gross: 100000, opex: 30000, net: 70000 },
  { month: 'Apr', revenue: 145000, cogs: 48000, gross: 97000, opex: 31000, net: 66000 },
  { month: 'May', revenue: 160000, cogs: 52000, gross: 108000, opex: 33000, net: 75000 },
  { month: 'Jun', revenue: 175000, cogs: 55000, gross: 120000, opex: 35000, net: 85000 },
  { month: 'Jul', revenue: 180000, cogs: 60000, gross: 120000, opex: 35000, net: 85000 },
  { month: 'Aug', revenue: 195000, cogs: 65000, gross: 130000, opex: 36000, net: 94000 },
  { month: 'Sep', revenue: 210000, cogs: 70000, gross: 140000, opex: 38000, net: 102000 },
  { month: 'Oct', revenue: 205000, cogs: 68000, gross: 137000, opex: 38000, net: 99000 },
  { month: 'Nov', revenue: 230000, cogs: 75000, gross: 155000, opex: 40000, net: 115000 },
  { month: 'Dec', revenue: 250000, cogs: 80000, gross: 170000, opex: 42000, net: 128000 }
];

const prices = [
  { item: 'Steel (ton)', current: 850, yesterday: 840, change: 1.19 },
  { item: 'Cotton (lb)', current: 0.85, yesterday: 0.88, change: -3.40 },
  { item: 'Crude Oil (bbl)', current: 82.50, yesterday: 80.20, change: 2.86 },
  { item: 'Wheat (bu)', current: 6.20, yesterday: 6.25, change: -0.80 },
  { item: 'Copper (lb)', current: 3.85, yesterday: 3.80, change: 1.31 },
  { item: 'Aluminium (ton)', current: 2200, yesterday: 2250, change: -2.22 }
];

const employees = [
  { id: 1, name: 'Alice Smith', department: 'Sales', role: 'Manager', baseSalary: 85000, bonus: 15000, status: 'Paid', efficiency: 92 },
  { id: 2, name: 'Bob Jones', department: 'Engineering', role: 'Dev', baseSalary: 95000, bonus: 5000, status: 'Paid', efficiency: 88 },
  { id: 3, name: 'Charlie Brown', department: 'Operations', role: 'Analyst', baseSalary: 70000, bonus: 3000, status: 'Pending', efficiency: 75 },
  { id: 4, name: 'Diana Prince', department: 'HR', role: 'Director', baseSalary: 110000, bonus: 20000, status: 'Paid', efficiency: 98 },
  { id: 5, name: 'Evan Wright', department: 'Sales', role: 'Rep', baseSalary: 60000, bonus: 25000, status: 'Paid', efficiency: 85 }
];

// --- REST ENDPOINTS ---

app.get('/api/dashboard', (req, res) => {
  res.json({
    metrics: {
      totalClients: clients.length,
      newClientsThisMonth: 2,
      churnRate: 4.5, // %
      mrr: 150000
    },
    clients,
    pipeline,
    products
  });
});

app.get('/api/business-intelligence', (req, res) => {
  // Sort products by unitsSold descending
  const popularProducts = [...products].sort((a, b) => b.unitsSold - a.unitsSold);
  
  // Calculate profit contribution to find most profitable clients
  const profitableClients = clients.map(c => ({
    ...c,
    netProfit: c.revenue - c.costToServe,
    profitMargin: ((c.revenue - c.costToServe) / c.revenue) * 100
  })).sort((a, b) => b.netProfit - a.netProfit).slice(0, 5);

  res.json({
    summary: { revenue: 250000, expenses: 122000, netProfit: 128000, margin: 51.2 },
    popularProducts,
    profitableClients
  });
});

app.get('/api/financials', (req, res) => {
  res.json({ financials, prices });
});

app.get('/api/employees', (req, res) => {
  res.json({ employees });
});

// --- COMPLIANCE COPILOT ---
app.use('/api/compliance', complianceRoutes);

// --- AI ENDPOINTS ---

// Generic function to handle Google Gemini requests
async function generateInsights(prompt, fallbackMock) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return fallbackMock;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackMock;
  }
}

app.post('/api/ai/client-insights', async (req, res) => {
  const dataSummary = `Active Clients: ${clients.filter(c => c.status === 'Active').length}, Inactive: ${clients.filter(c => c.status === 'Inactive').length}, Total Revenue: ${clients.reduce((sum, c) => sum + c.revenue, 0)}`;
  const prompt = `Given these client stats: ${dataSummary}, give 3 short bullet-point insights about the client base. Keep it professional and very concise. Format as markdown bullets.`;
  
  const fallback = "- Strong revenue concentration in top active clients.\n- Churn risk detected in Food industry segment.\n- Healthcare sector showing highest growth potential.";
  
  const text = await generateInsights(prompt, fallback);
  res.json({ text });
});

app.post('/api/ai/sales-actions', async (req, res) => {
  const pipelineSummary = pipeline.map(p => `${p.stage}: ${p.count} deals ($${p.value})`).join(', ');
  const prompt = `Given this sales pipeline data: ${pipelineSummary}. Suggest 3 specific, actionable steps the sales team should take right now. Keep it professional and short. Format as markdown bullets.`;
  
  const fallback = "- Focus immediately on the 5 Negotiation deals to close the $120k.\n- Investigate bottleneck at Proposal stage (12 deals stuck).\n- Increase outbound activity to replenish the 45 leads.";
  
  const text = await generateInsights(prompt, fallback);
  res.json({ text });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
