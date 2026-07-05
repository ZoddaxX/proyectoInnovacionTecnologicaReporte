-- password: demo1234
INSERT INTO users (email, password_hash, full_name, role) VALUES
('vendedor@returniq.com',
 '$2b$10$4gI.LxBbEThIX/i8MsSaBuVUPGXXYsRPu9Gg/Sc8UmbprUHZf3Mge',
 'Demo Vendedor',
 'seller');

INSERT INTO stores (seller_id, name, slug, return_policy_days)
SELECT id, 'Nike Store Chile', 'nike-store-cl', 30
FROM users WHERE email = 'vendedor@returniq.com';

INSERT INTO products (store_id, name, sku, emoji_icon)
SELECT id, 'Air Max 270',       'NK-AM270-001', '👟' FROM stores WHERE slug = 'nike-store-cl'
UNION ALL
SELECT id, 'Camiseta Dri-FIT',  'NK-DRFT-002',  '👕' FROM stores WHERE slug = 'nike-store-cl'
UNION ALL
SELECT id, 'Short Tech Fleece', 'NK-TF-003',    '🩳' FROM stores WHERE slug = 'nike-store-cl';

INSERT INTO product_variants (product_id, size, color, stock)
SELECT id, '40', 'Negro', 12 FROM products WHERE sku = 'NK-AM270-001' UNION ALL
SELECT id, '41', 'Negro', 18 FROM products WHERE sku = 'NK-AM270-001' UNION ALL
SELECT id, '42', 'Negro',  2 FROM products WHERE sku = 'NK-AM270-001' UNION ALL
SELECT id, '43', 'Negro', 16 FROM products WHERE sku = 'NK-AM270-001' UNION ALL
SELECT id, '44', 'Negro',  8 FROM products WHERE sku = 'NK-AM270-001';

INSERT INTO product_variants (product_id, size, color, stock)
SELECT id, 'XS',  'Blanco',  4 FROM products WHERE sku = 'NK-DRFT-002' UNION ALL
SELECT id, 'S',   'Blanco', 12 FROM products WHERE sku = 'NK-DRFT-002' UNION ALL
SELECT id, 'M',   'Blanco', 20 FROM products WHERE sku = 'NK-DRFT-002' UNION ALL
SELECT id, 'L',   'Blanco',  4 FROM products WHERE sku = 'NK-DRFT-002' UNION ALL
SELECT id, 'XL',  'Blanco',  3 FROM products WHERE sku = 'NK-DRFT-002';

INSERT INTO product_variants (product_id, size, color, stock)
SELECT id, 'S',  'Gris', 15 FROM products WHERE sku = 'NK-TF-003' UNION ALL
SELECT id, 'M',  'Gris', 22 FROM products WHERE sku = 'NK-TF-003' UNION ALL
SELECT id, 'L',  'Gris', 10 FROM products WHERE sku = 'NK-TF-003' UNION ALL
SELECT id, 'XL', 'Gris',  6 FROM products WHERE sku = 'NK-TF-003';

INSERT INTO orders (store_id, buyer_name, order_number)
SELECT id, 'Juan Martinez',    'ORD-2024-08471' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Sofia Cardenas',   'ORD-2024-08322' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Ricardo Perez',    'ORD-2024-07891' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Ana Lopez',        'ORD-2024-07654' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Carlos Munoz',     'ORD-2024-07123' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Maria Torres',     'ORD-2024-06987' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Pedro Silva',      'ORD-2024-06500' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Valentina Rios',   'ORD-2024-06400' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Luis Fernandez',   'ORD-2024-06200' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Camila Soto',      'ORD-2024-06100' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Diego Morales',    'ORD-2024-06000' FROM stores WHERE slug = 'nike-store-cl';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-08471' AND p.sku = 'NK-AM270-001' AND pv.size = '42';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-08322' AND p.sku = 'NK-DRFT-002' AND pv.size = 'M';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-07891' AND p.sku = 'NK-TF-003' AND pv.size = 'M';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-07654' AND p.sku = 'NK-AM270-001' AND pv.size = '41';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-07123' AND p.sku = 'NK-AM270-001' AND pv.size = '40';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06987' AND p.sku = 'NK-DRFT-002' AND pv.size = 'S';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06500' AND p.sku = 'NK-AM270-001' AND pv.size = '43';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06400' AND p.sku = 'NK-AM270-001' AND pv.size = '44';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06200' AND p.sku = 'NK-AM270-001' AND pv.size = '42';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06100' AND p.sku = 'NK-AM270-001' AND pv.size = '41';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2024-06000' AND p.sku = 'NK-AM270-001' AND pv.size = '40';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Juan Martinez', s.id, 'wrong_size',
  'La talla 42 me queda grande, necesito la 41. Si tienen disponible me gustaria hacer el cambio.',
  'pending', 'RET-4729', NOW() - INTERVAL '2 hours'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-08471';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Sofia Cardenas', s.id, 'defective',
  'La camiseta vino con un hilo suelto en la costura lateral.',
  'pending', 'RET-4730', NOW() - INTERVAL '1 day'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-08322';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Ricardo Perez', s.id, 'not_as_described',
  'El material no se siente como el de la foto, esperaba algo mas grueso.',
  'reviewing', 'RET-4731', NOW() - INTERVAL '4 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-07891';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Ana Lopez', s.id, 'wrong_size',
  'Pedi talla 41 pero llego la 40.',
  'approved', 'RET-4732', NOW() - INTERVAL '6 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-07654';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Carlos Munoz', s.id, 'defective',
  'La suela izquierda se despego al segundo uso.',
  'rejected', 'RET-4733', NOW() - INTERVAL '10 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-07123';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Maria Torres', s.id, 'other',
  'Me arrepenti de la compra, prefiero otro modelo.',
  'reviewing', 'RET-4734', NOW() - INTERVAL '3 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06987';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Pedro Silva', s.id, 'wrong_size',
  'Talla 43 muy grande.', 'approved', 'RET-4735', NOW() - INTERVAL '8 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06500';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Valentina Rios', s.id, 'wrong_size',
  'Talla 44 muy grande.', 'approved', 'RET-4736', NOW() - INTERVAL '12 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06400';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Luis Fernandez', s.id, 'wrong_size',
  'Talla 42 grande.', 'approved', 'RET-4737', NOW() - INTERVAL '15 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06200';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Camila Soto', s.id, 'defective',
  'Costura defectuosa en el talon.', 'approved', 'RET-4738', NOW() - INTERVAL '18 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06100';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Diego Morales', s.id, 'wrong_size',
  'Talla 40 muy chica.', 'rejected', 'RET-4739', NOW() - INTERVAL '20 days'
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2024-06000';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4729';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '33 minutes'
FROM returns r WHERE r.return_code = 'RET-4729';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4730';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '1 hour'
FROM returns r WHERE r.return_code = 'RET-4730';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4731';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '2 hours'
FROM returns r WHERE r.return_code = 'RET-4731';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Informacion adicional solicitada al comprador', r.created_at + INTERVAL '24 hours'
FROM returns r WHERE r.return_code = 'RET-4731';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4732';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '4 hours'
FROM returns r WHERE r.return_code = 'RET-4732';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Devolucion aprobada', r.created_at + INTERVAL '26 hours'
FROM returns r WHERE r.return_code = 'RET-4732';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Coordinacion de retiro iniciada', r.created_at + INTERVAL '36 hours'
FROM returns r WHERE r.return_code = 'RET-4732';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4733';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '24 hours'
FROM returns r WHERE r.return_code = 'RET-4733';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Devolucion rechazada: danio por uso inadecuado', r.created_at + INTERVAL '48 hours'
FROM returns r WHERE r.return_code = 'RET-4733';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code = 'RET-4734';
INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '6 hours'
FROM returns r WHERE r.return_code = 'RET-4734';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code IN ('RET-4735','RET-4736','RET-4737','RET-4738','RET-4739');

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Devolucion aprobada', r.created_at + INTERVAL '24 hours'
FROM returns r WHERE r.return_code IN ('RET-4735','RET-4736','RET-4737','RET-4738');

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Devolucion rechazada', r.created_at + INTERVAL '24 hours'
FROM returns r WHERE r.return_code = 'RET-4739';

-- Pedidos frescos sin devolución para demostrar el flujo del portal comprador
INSERT INTO orders (store_id, buyer_name, order_number)
SELECT id, 'Ignacio Reyes', 'ORD-2025-00001' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Paula Vega',    'ORD-2025-00002' FROM stores WHERE slug = 'nike-store-cl';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2025-00001' AND p.sku = 'NK-DRFT-002' AND pv.size = 'L';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1
FROM orders o
JOIN product_variants pv ON true
JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2025-00002' AND p.sku = 'NK-AM270-001' AND pv.size = '43';

-- Ordenes adicionales para enriquecer la alerta del Air Max 270 (11 devoluciones en 30 dias)
INSERT INTO orders (store_id, buyer_name, order_number)
SELECT id, 'Elena Vargas',     'ORD-2025-00003' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Roberto Castro',   'ORD-2025-00004' FROM stores WHERE slug = 'nike-store-cl' UNION ALL
SELECT id, 'Francisca Mora',   'ORD-2025-00005' FROM stores WHERE slug = 'nike-store-cl';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1 FROM orders o
JOIN product_variants pv ON true JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2025-00003' AND p.sku = 'NK-AM270-001' AND pv.size = '40';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1 FROM orders o
JOIN product_variants pv ON true JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2025-00004' AND p.sku = 'NK-AM270-001' AND pv.size = '41';

INSERT INTO order_items (order_id, product_variant_id, quantity)
SELECT o.id, pv.id, 1 FROM orders o
JOIN product_variants pv ON true JOIN products p ON pv.product_id = p.id
WHERE o.order_number = 'ORD-2025-00005' AND p.sku = 'NK-AM270-001' AND pv.size = '42';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Elena Vargas', s.id, 'wrong_size',
  'Pedi talla 40 y queda muy chica, necesito cambio a 41.',
  'pending', 'RET-4740', NOW() - INTERVAL '1 day'
FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2025-00003';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Roberto Castro', s.id, 'defective',
  'La suela del lado derecho tiene un desprendimiento desde la caja.',
  'pending', 'RET-4741', NOW() - INTERVAL '3 days'
FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2025-00004';

INSERT INTO returns (order_item_id, buyer_name, store_id, reason, comment, status, return_code, created_at)
SELECT oi.id, 'Francisca Mora', s.id, 'not_as_described',
  'El color negro de la foto se ve muy diferente al que recibi, es mas grisaceo.',
  'reviewing', 'RET-4742', NOW() - INTERVAL '5 days'
FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN stores s ON s.id = o.store_id
WHERE o.order_number = 'ORD-2025-00005';

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Solicitud recibida', r.created_at
FROM returns r WHERE r.return_code IN ('RET-4740', 'RET-4741', 'RET-4742');

INSERT INTO return_events (return_id, description, created_at)
SELECT r.id, 'Revision iniciada', r.created_at + INTERVAL '4 hours'
FROM returns r WHERE r.return_code = 'RET-4742';
