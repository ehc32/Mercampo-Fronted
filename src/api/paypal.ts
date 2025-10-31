import { authAxios } from "./useAxios";

export const paypal_create = async (payload: {
  order_items: Array<{ id: number; quantity: number; price: string | number }> | string;
  total_price: string | number;
  address: string;
  city: string;
  postal_code: string;
  shipping_price?: number;
  tax_price?: number;
}) => {
  const { data } = await authAxios.post("/orders/paypal/create/", payload);
  return data as { orderID: string; approve_url?: string };
};

export const paypal_capture = async (orderID: string) => {
  const { data } = await authAxios.post("/orders/paypal/capture/", { orderID });
  return data as { status: string; order_id?: number };
};