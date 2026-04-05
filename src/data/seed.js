import SEED_PRODUCTS from "./products";

const SEED_USERS = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@smartcart.com",
    password: "admin123",
    role: "admin",
    joined: "2024-01-01",
  },
];

export default function seedStorage() {
  if (!localStorage.getItem("sc_products"))
    localStorage.setItem("sc_products", JSON.stringify(SEED_PRODUCTS));
  if (!localStorage.getItem("sc_users"))
    localStorage.setItem("sc_users", JSON.stringify(SEED_USERS));
}