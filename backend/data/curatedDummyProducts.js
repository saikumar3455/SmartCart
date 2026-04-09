const createSeries = ({ startId, count, category, titlePrefix, description, priceStart, priceStep, stockStart, imageBase, ratingBase, reviewsBase }) =>
  Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    source: "curated-catalog",
    externalSourceId: startId + index,
    name: `${titlePrefix} ${index + 1}`,
    price: priceStart + index * priceStep,
    category,
    image: `${imageBase}${index + 1}`,
    description,
    rating: Number((ratingBase + (index % 5) * 0.1).toFixed(1)),
    reviews: reviewsBase + index * 3,
    stock: stockStart + (index % 18),
  }));

const mens = createSeries({
  startId: 1001,
  count: 55,
  category: "mens",
  titlePrefix: "Men's Everyday Style",
  description: "Curated menswear piece for casual, office, and weekend styling.",
  priceStart: 899,
  priceStep: 45,
  stockStart: 18,
  imageBase: "https://picsum.photos/seed/mens-style-",
  ratingBase: 4.2,
  reviewsBase: 40,
});

const womens = createSeries({
  startId: 2001,
  count: 55,
  category: "womens",
  titlePrefix: "Women's Signature Look",
  description: "Curated womenswear piece designed for everyday elegance and comfort.",
  priceStart: 999,
  priceStep: 50,
  stockStart: 16,
  imageBase: "https://picsum.photos/seed/womens-style-",
  ratingBase: 4.3,
  reviewsBase: 52,
});

const kids = createSeries({
  startId: 3001,
  count: 40,
  category: "kids",
  titlePrefix: "Kids Play Collection",
  description: "Bright, comfortable kidswear made for active days and easy styling.",
  priceStart: 499,
  priceStep: 28,
  stockStart: 20,
  imageBase: "https://picsum.photos/seed/kids-style-",
  ratingBase: 4.1,
  reviewsBase: 18,
});

const accessories = createSeries({
  startId: 4001,
  count: 72,
  category: "accessories",
  titlePrefix: "Accessory Edit",
  description: "Versatile accessory to complete outfits across daily, festive, and work looks.",
  priceStart: 299,
  priceStep: 22,
  stockStart: 24,
  imageBase: "https://picsum.photos/seed/accessory-style-",
  ratingBase: 4.0,
  reviewsBase: 25,
});

const CURATED_DUMMY_PRODUCTS = [...mens, ...womens, ...kids, ...accessories];

export default CURATED_DUMMY_PRODUCTS;
