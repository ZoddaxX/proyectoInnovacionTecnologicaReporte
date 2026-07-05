import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function Catalog() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/products', {}, token).then(res => {
      if (res.success) setProducts(res.data);
      setLoading(false);
    });
  }, [token]);

  const totalStock    = products.reduce((acc, p) => acc + parseInt(p.total_stock), 0);
  const lowStockCount = products.filter(p => parseInt(p.low_stock_variants) > 0).length;

  return (
    <AppLayout>
      <div className="page-header">
        <span className="header-title">Catalogo de productos</span>
      </div>

      <div className="page-content">
        <div className="content-inner">
          <div className="stat-grid">
            <StatCard number={products.length} label="Productos" />
            <StatCard number={totalStock}       label="Stock total"  color="var(--accent)" />
            <StatCard number={lowStockCount}    label="Stock bajo"   color="var(--gold-dark)" />
          </div>

          {loading && <div className="loading">Cargando catalogo...</div>}

          {!loading && products.map(p => {
            const isLow = parseInt(p.low_stock_variants) > 0;
            return (
              <div key={p.id} className="product-row" onClick={() => navigate(`/seller/catalog/${p.id}`)}>
                <div className="product-thumb">{p.emoji_icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="product-name">{p.name}</div>
                  <div className="product-sub">{p.variant_count} variantes &middot; SKU: {p.sku}</div>
                </div>
                <span className={isLow ? 'stock-low' : 'stock-ok'}>
                  {p.total_stock} uds
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
