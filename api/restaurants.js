// GET /api/restaurants
// Returns all restaurants ordered by rating
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

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, location, rating, delivery_time, price_for_two, image, description')
      .order('rating', { ascending: false });

    if (error) throw error;

    const restaurants = data.map(r => ({
      ...r,
      rating: Number(r.rating),
    }));

    return res.status(200).json({ restaurants });
  } catch (err) {
    console.error('[GET /api/restaurants]', err.message);
    return res.status(500).json({ error: 'Failed to fetch restaurants. Please try again.' });
  }
};
