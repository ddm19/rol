import { supabase } from './supabaseClient';

export type OrderItem = {
  card_id_archivo: string;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  user_id: string;
  order_date: string;
  booster_count: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  coins_spent: number | null;
};

export type BoosterOrder = {
  id: string;
  user_id: string;
  order_date: string;
  expansion: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  pack_type_id: string | null;
  coins_spent: number | null;
};

const ORDER_CONFIRMATION_FUNCTION = 'send-order-confirmation';

async function sendOrderConfirmation(orderId: string, userId: string, orderType: 'cards' | 'booster') {
  const { error } = await supabase.functions.invoke(ORDER_CONFIRMATION_FUNCTION, {
    body: {
      order_id: orderId,
      user_id: userId,
      order_type: orderType,
    },
  });

  if (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

export async function createCardOrder(items: OrderItem[]): Promise<OrderRecord> {
  const { data, error } = await supabase.rpc('roh_pedir_cartas', { p_items: items });
  if (error) throw error;

  const order = data as OrderRecord;
  await sendOrderConfirmation(order.id, order.user_id, 'cards');
  return order;
}

export async function createBoosterOrder(packTypeId: string): Promise<BoosterOrder> {
  const { data, error } = await supabase.rpc('roh_pedir_sobre', { p_pack_type: packTypeId });
  if (error) throw error;

  const order = data as BoosterOrder;
  await sendOrderConfirmation(order.id, order.user_id, 'booster');
  return order;
}
