const buildCategoryImage = (category, item, index) => {
  const keywords =
    category === "mens"
      ? `men,fashion,${encodeURIComponent(item)}`
      : category === "womens"
      ? `women,fashion,${encodeURIComponent(item)}`
      : category === "kids"
      ? `kids,fashion,${encodeURIComponent(item)}`
      : `accessories,fashion,${encodeURIComponent(item)}`;

  return `https://loremflickr.com/600/600/${keywords}?lock=${index + 1}`;
};

const createCatalog = ({ startId, category, count, descriptors, items, description, priceBase, priceStep, stockBase, ratingBase, reviewsBase }) =>
  Array.from({ length: count }, (_, index) => {
    const descriptor = descriptors[index % descriptors.length];
    const item = items[index % items.length];
    const name = `${descriptor} ${item}`;

    return {
      id: startId + index,
      source: "curated-catalog",
      externalSourceId: startId + index,
      name,
      price: priceBase + index * priceStep,
      category,
      image: buildCategoryImage(category, item, startId + index),
      description,
      rating: Number((ratingBase + (index % 4) * 0.1).toFixed(1)),
      reviews: reviewsBase + index * 4,
      stock: stockBase + (index % 20),
    };
  });

const mens = createCatalog({
  startId: 1001,
  category: "mens",
  count: 55,
  descriptors: ["Classic", "Urban", "Modern", "Relaxed", "Tailored", "Weekend", "Essential", "Premium"],
  items: ["Cotton Shirt", "Polo Tee", "Chino Pant", "Casual Jacket", "Denim Shirt", "Linen Trouser", "Crew Neck Tee"],
  description: "Curated menswear piece designed for versatile everyday styling.",
  priceBase: 899,
  priceStep: 45,
  stockBase: 18,
  ratingBase: 4.2,
  reviewsBase: 40,
});

const womens = createCatalog({
  startId: 2001,
  category: "womens",
  count: 55,
  descriptors: ["Elegant", "Everyday", "Chic", "Soft", "Graceful", "Bold", "Signature", "Contemporary"],
  items: ["Maxi Dress", "Satin Blouse", "Relaxed Kurti", "Flared Top", "Tailored Blazer", "Printed Skirt", "Co-ord Set"],
  description: "Curated womenswear piece for effortless styling across work, festive, and casual looks.",
  priceBase: 999,
  priceStep: 50,
  stockBase: 16,
  ratingBase: 4.3,
  reviewsBase: 52,
});

const kids = createCatalog({
  startId: 3001,
  category: "kids",
  count: 40,
  descriptors: ["Happy", "Playtime", "Comfy", "Bright", "Fun", "Adventure", "Active", "Sunny"],
  items: ["Graphic Tee", "Cotton Shorts", "Denim Dungaree", "Printed Hoodie", "Jogger Set", "Casual Dress"],
  description: "Comfort-first kidswear made for playtime, movement, and cheerful everyday looks.",
  priceBase: 499,
  priceStep: 28,
  stockBase: 20,
  ratingBase: 4.1,
  reviewsBase: 18,
});

const accessories = createCatalog({
  startId: 4001,
  category: "accessories",
  count: 72,
  descriptors: ["Minimal", "Daily", "Travel", "Statement", "Classic", "Bold", "Refined", "Compact"],
  items: ["Sling Bag", "Watch", "Sunglasses", "Wallet", "Handbag", "Cap", "Backpack", "Sneaker", "Belt"],
  description: "Curated accessory designed to finish everyday outfits with function and style.",
  priceBase: 299,
  priceStep: 22,
  stockBase: 24,
  ratingBase: 4.0,
  reviewsBase: 25,
});

const CURATED_DUMMY_PRODUCTS = [...mens, ...womens, ...kids, ...accessories];

export default CURATED_DUMMY_PRODUCTS;
