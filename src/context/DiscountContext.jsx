import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { COUPONS, getCouponDiscount, getCouponState, saveCouponState } from "../utils/helpers";

const DiscountContext = createContext();

export function DiscountProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.email || "guest";
  const [coupon, setCoupon] = useState(() => getCouponState(userKey));
  const [availableCoupons, setAvailableCoupons] = useState(Object.values(COUPONS));

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await fetch("https://smartcart-api-2ogq.onrender.com/api/coupons");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setAvailableCoupons(data.filter((item) => item.isActive));
        } else {
          setAvailableCoupons(Object.values(COUPONS));
        }
      } catch (error) {
        console.log("coupon fetch error", error);
        setAvailableCoupons(Object.values(COUPONS));
      }
    };

    loadCoupons();
  }, []);

  useEffect(() => {
    setCoupon(getCouponState(userKey));
  }, [userKey]);

  useEffect(() => {
    saveCouponState(userKey, coupon);
  }, [coupon, userKey]);

  const value = useMemo(() => {
    const applyCouponCode = (rawCode, subtotal) => {
      const code = rawCode.trim().toUpperCase();
      const nextCoupon = availableCoupons.find((item) => item.code === code);

      if (!nextCoupon) {
        return { ok: false, message: "Coupon code not found" };
      }

      if (subtotal < nextCoupon.minSubtotal) {
        return {
          ok: false,
          message: `This coupon requires a cart total of ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(nextCoupon.minSubtotal).replace(".00", "")}`,
        };
      }

      setCoupon(nextCoupon);
      return { ok: true, coupon: nextCoupon };
    };

    const removeCoupon = () => setCoupon(null);

    const getDiscountAmount = (subtotal, shipping = 0) =>
      getCouponDiscount(coupon, subtotal, shipping);

    return {
      coupon,
      availableCoupons,
      applyCouponCode,
      removeCoupon,
      getDiscountAmount,
    };
  }, [availableCoupons, coupon]);

  return <DiscountContext.Provider value={value}>{children}</DiscountContext.Provider>;
}

export const useDiscount = () => useContext(DiscountContext);
