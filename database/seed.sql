-- ═══════════════════════════════════════════════════════════════
-- NGH Foods – Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- CATEGORIES
INSERT INTO categories (name) VALUES
  ('Fast Food'), ('Meals'), ('Biryani'), ('Snacks'), ('Drinks'), ('Desserts')
ON CONFLICT (name) DO NOTHING;

-- RESTAURANTS
INSERT INTO restaurants (name, location, rating, delivery_time, price_for_two, image, description) VALUES
  ('Spice Garden',  'Chennai', 4.8, '25–35 min', '₹200 for two',
   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
   'South Indian • Biryani • Meals'),
  ('Urban Bites',   'Chennai', 4.7, '20–30 min', '₹300 for two',
   'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85',
   'Burgers • Pizza • Snacks'),
  ('Royal Kitchen', 'Chennai', 4.6, '30–40 min', '₹250 for two',
   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85',
   'Indian • Chinese • Meals'),
  ('Pizza Point',   'Chennai', 4.9, '25–35 min', '₹350 for two',
   'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85',
   'Pizza • Pasta • Italian'),
  ('Grill House',   'Chennai', 4.7, '30–40 min', '₹400 for two',
   'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',
   'Grill • Chicken • BBQ'),
  ('Healthy Bowl',  'Chennai', 4.5, '20–30 min', '₹250 for two',
   'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85',
   'Healthy • Salads • Juices')
ON CONFLICT DO NOTHING;

-- FOOD ITEMS (restaurant_id matches insert order above; category_id matches categories)
-- restaurant: 1=Spice Garden, 2=Urban Bites, 3=Royal Kitchen, 4=Pizza Point, 5=Grill House, 6=Healthy Bowl
-- category:   1=Fast Food,    2=Meals,        3=Biryani,       4=Snacks,      5=Drinks,      6=Desserts
INSERT INTO food_items (restaurant_id, category_id, name, description, price, rating, stock, image) VALUES
  (2, 1, 'Chicken Burger',       'Crispy golden chicken burger with lettuce',       149, 4.8, 20, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85'),
  (4, 1, 'Chicken Pizza',        'Loaded chicken pizza with extra cheese',          249, 4.8, 15, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85'),
  (3, 2, 'Chicken Fried Rice',   'Wok-tossed chicken fried rice',                  179, 4.6, 18, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85'),
  (3, 2, 'Chicken Noodles',      'Hot sesame chicken noodles',                      159, 4.5, 16, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85'),
  (1, 3, 'Chicken Biryani',      'Aromatic Hyderabadi chicken biryani',             220, 4.9, 12, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85'),
  (1, 3, 'Mutton Biryani',       'Rich slow-cooked mutton biryani',                 290, 4.8, 10, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85'),
  (1, 3, 'Egg Biryani',          'Flavourful egg biryani with raita',               190, 4.6, 14, 'https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=85'),
  (2, 4, 'French Fries',         'Crispy salted golden fries',                       99, 4.5, 30, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85'),
  (5, 4, 'Chicken Wings',        'Smoky BBQ chicken wings',                         189, 4.7, 15, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=85'),
  (5, 4, 'Chicken 65',           'Spicy South Indian chicken 65',                   180, 4.7, 18, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85'),
  (6, 5, 'Mango Juice',          'Fresh squeezed mango juice',                       80, 4.4, 25, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85'),
  (6, 5, 'Fresh Lime Soda',      'Refreshing lime soda with mint',                   70, 4.3, 25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85'),
  (4, 6, 'Chocolate Cake',       'Soft moist chocolate fudge cake',                 129, 4.7, 10, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85'),
  (6, 6, 'Ice Cream',            'Creamy vanilla and chocolate ice cream',           110, 4.6, 20, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=900&q=85'),
  (1, 2, 'South Indian Meals',   'Full traditional South Indian banana-leaf meal',  190, 4.6, 14, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85'),
  (1, 2, 'Mini Meals',           'Light South Indian mini meals with sides',         150, 4.5, 14, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85'),
  (3, 2, 'Parotta & Chicken Curry','Crispy layered parotta with spicy chicken curry',210, 4.8, 12, 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85'),
  (3, 4, 'Paneer Tikka',         'Smoky tandoor paneer tikka with chutney',         175, 4.6, 15, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=85'),
  (4, 1, 'Margherita Pizza',     'Classic fresh tomato and mozzarella pizza',       219, 4.7, 15, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85'),
  (4, 1, 'Pasta Alfredo',        'Creamy white sauce pasta with garlic bread',      229, 4.6, 12, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85'),
  (5, 1, 'BBQ Chicken',          'Slow-grilled BBQ chicken with coleslaw',          280, 4.8, 10, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85'),
  (5, 1, 'Grilled Chicken',      'Herb-marinated grilled chicken breast',            260, 4.7, 10, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85'),
  (6, 2, 'Veggie Salad Bowl',    'Fresh seasonal veggie salad bowl',                160, 4.5, 18, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85'),
  (6, 6, 'Fruit Bowl',           'Seasonal mixed fruit bowl with honey drizzle',    130, 4.4, 16, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85')
ON CONFLICT DO NOTHING;
