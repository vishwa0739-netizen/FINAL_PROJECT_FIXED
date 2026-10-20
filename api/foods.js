// GET /api/foods
// Returns all food items with their category and restaurant name
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
      .from('food_items')
      .select(`
        id, name, description, price, rating, stock, image,
        categories ( name ),
        restaurants ( name )
      `)
      .order('name');

    if (error) throw error;

    const foods = data.map(item => ({
      id:         item.id,
      name:       item.name,
      description:item.description,
      price:      Number(item.price),
      rating:     Number(item.rating),
      stock:      item.stock,
      img:        item.image,
      cat:        item.categories?.name  ?? '',
      restaurant: item.restaurants?.name ?? '',
    }));

    return res.status(200).json({ foods });
  } catch (err) {
    console.error('[GET /api/foods]', err.message);
    return res.status(500).json({ error: 'Failed to fetch menu items. Please try again.' });
  }
};
