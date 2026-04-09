const createCatalog = ({ startId, category, count, images, descriptors, items, description, priceBase, priceStep, stockBase, ratingBase, reviewsBase }) =>
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
      image: images[index % images.length],
      description,
      rating: Number((ratingBase + (index % 4) * 0.1).toFixed(1)),
      reviews: reviewsBase + index * 4,
      stock: stockBase + (index % 20),
    };
  });

const mensImages = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
  "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
];

const womensImages = [
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
  "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
];

const kidsImages = [
  "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
  "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
  "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&q=80",
  "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600&q=80",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80",
];

const accessoriesImages = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&q=80",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
];

const mens = createCatalog({
  startId: 1001,
  category: "mens",
  count: 55,
  images: mensImages,
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
  images: womensImages,
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
  images: kidsImages,
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
  images: accessoriesImages,
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
