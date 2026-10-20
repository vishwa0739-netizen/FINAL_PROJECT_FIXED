// ── NGH Foods — Full Workflow Audit Script ─────────────────────────────────
// Tests: Supabase connection → seed check → each API endpoint logic
// Run: node test/audit.js
// ───────────────────────────────────────────────────────────────────────────

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

let passed = 0;
let failed = 0;

function log(label, ok, detail = '') {
  const icon = ok ? PASS : FAIL;
  console.log(`  ${icon}  ${label}${detail ? '  →  ' + detail : ''}`);
  ok ? passed++ : failed++;
}

async function run() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  NGH Foods — Backend & Database Audit');
  console.log('══════════════════════════════════════════════════\n');

  // ── 1. Env vars ────────────────────────────────────────────────────────
  console.log('【1】Environment Variables');
  log('SUPABASE_URL set',         !!url && !url.includes('your-project'));
  log('SUPABASE_SERVICE_KEY set', !!key && key.length > 50);
  console.log();

  if (!url || !key) {
    console.log('  ⛔ Cannot continue — env vars missing.\n');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // ── 2. DB tables exist ─────────────────────────────────────────────────
  console.log('【2】Database Tables');
  const tables = ['categories', 'restaurants', 'food_items', 'customers', 'orders', 'order_items', 'payments'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    log(`Table "${t}" accessible`, !error, error?.message || '');
  }
  console.log();

  // ── 3. Seed data ───────────────────────────────────────────────────────
  console.log('【3】Seed Data');
  const { data: cats }  = await supabase.from('categories').select('id');
  const { data: rests } = await supabase.from('restaurants').select('id');
  const { data: foods } = await supabase.from('food_items').select('id');

  log('Categories seeded (expect 6)',   cats?.length === 6,   `found ${cats?.length}`);
  log('Restaurants seeded (expect 6)',  rests?.length === 6,  `found ${rests?.length}`);
  log('Food items seeded (expect 24)',  foods?.length === 24, `found ${foods?.length}`);
  console.log();

  // ── 4. GET /api/foods logic ────────────────────────────────────────────
  console.log('【4】GET /api/foods — Menu Endpoint');
  const { data: foodData, error: foodErr } = await supabase
    .from('food_items')
    .select('id, name, price, rating, stock, image, categories(name), restaurants(name)')
    .order('name');

  log('Query runs without error', !foodErr, foodErr?.message || '');
  log('Returns food items',       foodData?.length > 0, `${foodData?.length} items`);
  log('Each item has category',   foodData?.every(f => f.categories?.name), '');
  log('Each item has restaurant', foodData?.every(f => f.restaurants?.name), '');
  if (foodData?.[0]) {
    const f = foodData[0];
    log(`Sample: "${f.name}" ₹${f.price} [${f.categories?.name}] @ ${f.restaurants?.name}`, true);
  }
  console.log();

  // ── 5. GET /api/restaurants logic ─────────────────────────────────────
  console.log('【5】GET /api/restaurants — Restaurants Endpoint');
  const { data: restData, error: restErr } = await supabase
    .from('restaurants')
    .select('id, name, rating, delivery_time, price_for_two, image, description')
    .order('rating', { ascending: false });

  log('Query runs without error',    !restErr, restErr?.message || '');
  log('Returns restaurants',          restData?.length > 0, `${restData?.length} restaurants`);
  log('Top-rated first',              restData?.[0]?.rating >= restData?.[restData.length-1]?.rating, `${restData?.[0]?.name} (${restData?.[0]?.rating}★)`);
  console.log();

  // ── 6. POST /api/place-order logic ────────────────────────────────────
  console.log('【6】POST /api/place-order — Order Placement');

  // Pick first food item for test
  const testFood = foodData?.[0];
  log('Test food item available', !!testFood, testFood?.name || '');

  if (testFood) {
    // Upsert test customer
    const { data: cust, error: custErr } = await supabase
      .from('customers')
      .upsert({
        name: 'Audit Test User', phone: '0000000001',
        email: 'audit@nghfoods.test', address: '1 Test Street, Chennai'
      }, { onConflict: 'phone' })
      .select('id').single();

    log('Customer upsert works', !custErr, custErr?.message || `customer_id=${cust?.id}`);

    if (cust) {
      // Create order
      const { data: order, error: ordErr } = await supabase
        .from('orders')
        .insert({ customer_id: cust.id, total_amount: Number(testFood.price), payment_method: 'Cash on Delivery', status: 'Confirmed' })
        .select('id').single();

      log('Order creation works', !ordErr, ordErr?.message || `order_id=${order?.id}`);

      if (order) {
        // Order item
        const { error: itemErr } = await supabase.from('order_items').insert({
          order_id: order.id, food_id: testFood.id, quantity: 1, unit_price: Number(testFood.price)
        });
        log('Order items insert works', !itemErr, itemErr?.message || '');

        // Payment
        const { error: payErr } = await supabase.from('payments').insert({
          order_id: order.id, method: 'Cash on Delivery',
          amount: Number(testFood.price), status: 'Completed'
        });
        log('Payment record works', !payErr, payErr?.message || '');

        // Clean up test order
        await supabase.from('orders').delete().eq('id', order.id);
        log('Test order cleaned up', true);
      }
    }
  }
  console.log();

  // ── 7. GET /api/orders logic ───────────────────────────────────────────
  console.log('【7】GET /api/orders — Order History Endpoint');
  const { data: custCheck } = await supabase.from('customers').select('id,name').eq('phone','0000000001').maybeSingle();
  log('Customer lookup by phone works', !!custCheck, custCheck?.name || 'not found');

  const { data: orderHistory, error: histErr } = await supabase
    .from('orders')
    .select('id, total_amount, payment_method, status, created_at, order_items(quantity, unit_price, food_items(name))')
    .eq('customer_id', custCheck?.id || 0)
    .order('created_at', { ascending: false })
    .limit(10);
  log('Order history query works', !histErr, histErr?.message || `${orderHistory?.length || 0} orders`);
  console.log();

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════');
  console.log(`  AUDIT RESULT:  ${passed} passed  /  ${failed} failed`);
  console.log('══════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('  🚀 All checks passed! Ready to deploy.\n');
  } else {
    console.log('  ⚠️  Fix the failed checks before deploying.\n');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('\n  ⛔ Unhandled error:', err.message);
  process.exit(1);
});
