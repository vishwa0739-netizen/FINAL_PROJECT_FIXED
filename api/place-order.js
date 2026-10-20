// POST /api/place-order
// Creates customer (upsert), order, order_items, payment and decrements stock
const supabase = require('../lib/supabase');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ALLOWED_PAYMENT_METHODS = ['Cash on Delivery', 'UPI', 'Card'];

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { customer, payment_method, items } = req.body || {};

  // ── Validate input ────────────────────────────────────────────────────────
  if (!customer?.name?.trim())    return res.status(400).json({ error: 'Full name is required.' });
  if (!customer?.phone?.trim())   return res.status(400).json({ error: 'Phone number is required.' });
  if (!customer?.address?.trim()) return res.status(400).json({ error: 'Delivery address is required.' });
  if (!ALLOWED_PAYMENT_METHODS.includes(payment_method))
    return res.status(400).json({ error: 'Invalid payment method.' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Cart is empty.' });
  for (const item of items) {
    if (!Number.isInteger(item.id) || !Number.isInteger(item.qty) || item.qty < 1)
      return res.status(400).json({ error: 'Invalid cart item data.' });
  }

  try {
    // ── 1. Upsert customer (phone is unique key) ───────────────────────────
    const { data: custData, error: custErr } = await supabase
      .from('customers')
      .upsert(
        {
          name:    customer.name.trim(),
          phone:   customer.phone.trim(),
          email:   customer.email?.trim() || null,
          address: customer.address.trim(),
        },
        { onConflict: 'phone' }
      )
      .select('id')
      .single();

    if (custErr) throw new Error('Customer save failed: ' + custErr.message);

    // ── 2. Fetch food prices & stock ───────────────────────────────────────
    const foodIds = items.map(i => i.id);
    const { data: foodData, error: foodErr } = await supabase
      .from('food_items')
      .select('id, price, stock, name')
      .in('id', foodIds);

    if (foodErr) throw new Error('Food fetch failed: ' + foodErr.message);

    // ── 3. Validate stock and calculate total ──────────────────────────────
    let total = 0;
    for (const item of items) {
      const food = foodData.find(f => f.id === item.id);
      if (!food) return res.status(400).json({ error: `Food item not found (id: ${item.id}).` });
      if (food.stock < item.qty)
        return res.status(400).json({ error: `"${food.name}" only has ${food.stock} left in stock.` });
      total += Number(food.price) * item.qty;
    }
    total = Math.round(total * 100) / 100;

    // ── 4. Create order ────────────────────────────────────────────────────
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id:    custData.id,
        total_amount:   total,
        payment_method: payment_method,
        status:         'Confirmed',
      })
      .select('id')
      .single();

    if (orderErr) throw new Error('Order creation failed: ' + orderErr.message);

    // ── 5. Insert order items ──────────────────────────────────────────────
    const orderItems = items.map(item => {
      const food = foodData.find(f => f.id === item.id);
      return {
        order_id:   orderData.id,
        food_id:    item.id,
        quantity:   item.qty,
        unit_price: Number(food.price),
      };
    });

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) throw new Error('Order items insert failed: ' + itemsErr.message);

    // ── 6. Decrement stock ─────────────────────────────────────────────────
    for (const item of items) {
      const food = foodData.find(f => f.id === item.id);
      const { error: stockErr } = await supabase
        .from('food_items')
        .update({ stock: food.stock - item.qty })
        .eq('id', item.id);
      if (stockErr) console.warn(`Stock update failed for food_id ${item.id}:`, stockErr.message);
    }

    // ── 7. Create payment record ───────────────────────────────────────────
    const { error: payErr } = await supabase.from('payments').insert({
      order_id: orderData.id,
      method:   payment_method,
      amount:   total,
      status:   'Completed',
    });
    if (payErr) console.warn('Payment record failed:', payErr.message);

    // ── Success ────────────────────────────────────────────────────────────
    return res.status(201).json({
      success:  true,
      order_id: orderData.id,
      total:    total,
      message:  'Order placed successfully!',
    });
  } catch (err) {
    console.error('[POST /api/place-order]', err.message);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
};
