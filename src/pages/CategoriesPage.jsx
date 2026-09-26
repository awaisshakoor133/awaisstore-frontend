import { Link } from "react-router-dom";

function CategoriesPage() {
  const categories = [
    { title: "Smartphones", desc: "iPhone, Samsung & more", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop", count: "120+ Products" },
    { title: "Smartwatches", desc: "Apple Watch, Galaxy Watch", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop", count: "45+ Products" },
    { title: "Accessories", desc: "Cases, Chargers & More", image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop", count: "200+ Products" },
    { title: "Audio", desc: "Earbuds, Headphones", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop", count: "60+ Products" },
    { title: "Tablets", desc: "iPad, Galaxy Tab", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=500&fit=crop", count: "30+ Products" },
    { title: "Power Banks", desc: "Fast charging portable", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop", count: "80+ Products" },
  ];

  return (
    <section className="categories-page">
      <div className="section-head">
        <p className="eyebrow">— BROWSE ALL</p>
        <h2>Shop By <span className="gradient-text">Category</span></h2>
      </div>

      <div className="category-page-container">
        {categories.map((c) => (
          <Link to="/products" className="category-card-large" key={c.title}>
            <div className="category-large-image">
              <img src={c.image} alt={c.title} loading="lazy" />
              <div className="category-large-overlay">
                <span className="category-count">{c.count}</span>
              </div>
            </div>
            <div className="category-large-info">
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="category-shop-link">Shop Now →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoriesPage;