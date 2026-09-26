import {
  SearchIcon,
  FolderIcon,
  TagIcon,
  SortIcon,
  CloseIcon,
} from "./StoreIcons";

function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  priceRange,
  setPriceRange,
  onClear,
  totalCount,
  filteredCount,
}) {
  const categories = [
    "All",
    "Electronics",
    "Watches",
    "Accessories",
    "Stationery",
  ];

  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="filter-group">
        <label>
          <SearchIcon size={14} />
          <span>Search</span>
        </label>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="filter-group">
        <label>
          <FolderIcon size={14} />
          <span>Category</span>
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label>
          <TagIcon size={14} />
          <span>Price Range</span>
        </label>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange({ ...priceRange, min: e.target.value })
            }
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange({ ...priceRange, max: e.target.value })
            }
          />
        </div>
      </div>

      {/* Sort */}
      <div className="filter-group">
        <label>
          <SortIcon size={14} />
          <span>Sort By</span>
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-az">Name: A to Z</option>
        </select>
      </div>

      {/* Clear Button */}
      <button className="clear-btn" onClick={onClear}>
        <CloseIcon size={14} />
        <span>Clear Filters</span>
      </button>

      {/* Result Count */}
      <div className="result-count">
        <strong>{filteredCount}</strong> of {totalCount} products
      </div>
    </div>
  );
}

export default FilterBar;