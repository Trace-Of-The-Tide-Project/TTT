import { api } from "./api";

export type PrintOrderStatus = "pending" | "shipped" | "cancelled";

export type PrintOrder = {
  id: string;
  user_id: string;
  book_id: string;
  price_paid: number | string | null;
  currency: string;
  recipient_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  status: PrintOrderStatus;
  tracking_number: string | null;
  createdAt: string;
  book?: { id: string; title: string; cover_image: string | null } | null;
  user?: { id: string; email: string; full_name: string | null } | null;
};

export type PrintOrdersListResponse = {
  rows: PrintOrder[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/** GET /commerce/admin/print-orders */
export async function getPrintOrders(params?: {
  page?: number;
  limit?: number;
  status?: PrintOrderStatus;
}): Promise<PrintOrdersListResponse> {
  const { data } = await api.get<unknown>("/commerce/admin/print-orders", { params });
  return unwrap<PrintOrdersListResponse>(data);
}

/** PATCH /commerce/admin/print-orders/:id/ship */
export async function shipPrintOrder(
  id: string,
  trackingNumber?: string,
): Promise<PrintOrder> {
  const { data } = await api.patch<unknown>(
    `/commerce/admin/print-orders/${encodeURIComponent(id)}/ship`,
    { tracking_number: trackingNumber || undefined },
  );
  return unwrap<PrintOrder>(data);
}
