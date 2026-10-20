// GET /api/orders?phone=XXXXXXXXXX
// Returns the last 10 orders for a customer by phone number
const supabase = require('../lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const phone = (req.query.phone || '').trim();
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

  try {
    // ── 1. Find customer by phone ──────────────────────────────────────────
    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .select('id, name')
      .eq('phone', phone)
      .maybeSingle();

    if (custErr) throw custErr;
    if (!customer) return res.status(200).json({ orders: [] });

    // ── 2. Fetch orders with nested items and food names ───────────────────
    const { data: orders, error: ordErr } = await supabase
      .from('orders')
      .select(`
        id, total_amount, payment_method, status, created_at,
        order_items (
          quantity, unit_price,
          food_items ( name )
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordErr) throw ordErr;

    return res.status(200).json({ customer: customer.name, orders: orders || [] });
  } catch (err) {
    console.error('[GET /api/orders]', err.message);
    return res.status(500).json({ error: 'Failed to fetch orders. Please try again.' });
  }
};
