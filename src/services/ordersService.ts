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
};

export type OrderItemRecord = {
  id: string;
  order_id: string;
  card_id_archivo: string;
  quantity: number;
};

export type BoosterOrder = {
  id: string;
  user_id: string;
  order_date: string;
  expansion: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
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

/**
 * Crear una orden de cartas individuales
 */
export async function createCardOrder(
  userId: string,
  items: OrderItem[]
): Promise<OrderRecord> {
  const { data: order, error: orderError } = await supabase
    .from('tcg_orders')
    .insert([
      {
        user_id: userId,
        order_date: new Date().toISOString(),
        booster_count: 0,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: order.id,
    card_id_archivo: item.card_id_archivo,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('tcg_order_items')
    .insert(orderItems);

  if (itemsError) {
    await supabase
      .from('tcg_orders')
      .delete()
      .eq('id', order.id);

    throw itemsError;
  }

  await sendOrderConfirmation(order.id, userId, 'cards');

  return order;
}

/**
 * Crear una orden de sobre (booster)
 */
export async function createBoosterOrder(
  userId: string,
  expansion: string,
  quantity: number
): Promise<BoosterOrder> {
  const { data, error } = await supabase
    .from('tcg_booster_orders')
    .insert([
      {
        user_id: userId,
        order_date: new Date().toISOString(),
        expansion: expansion,
        quantity: quantity,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  await sendOrderConfirmation(data.id, userId, 'booster');
  return data;
}

/**
 * Obtener el coste en slots de un tipo de sobre.
 * Las expansiones con sufijo '-L' (Leyenda) ocupan 2 slots.
 */
export function getBoosterSlotCost(expansion: string): number {
  if (!expansion) return 1;
  return expansion.endsWith('-L') ? 2 : 1;
}

/**
 * Obtener órdenes del usuario de la semana actual
 */
export async function getUserWeeklyBoosterOrders(userId: string): Promise<BoosterOrder[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('tcg_booster_orders')
    .select('*')
    .eq('user_id', userId)
    .gte('order_date', weekAgo.toISOString())
    .in('status', ['pending', 'processing', 'completed']);

  if (error) throw error;
  return data || [];
}

/**
 * Calcular cantidad total de sobres pedidos esta semana
 */
export async function getWeeklyBoosterCount(userId: string): Promise<number> {
  const orders = await getUserWeeklyBoosterOrders(userId);
  return orders.reduce((sum, order) => sum + order.quantity, 0);
}

/**
 * Verificar si el usuario puede pedir más sobres (límite de 2 por semana)
 */
export async function canOrderMoreBoosters(userId: string, requestedQuantity: number = 1): Promise<boolean> {
  const weeklyCount = await getWeeklyBoosterCount(userId);
  const WEEKLY_LIMIT = 2;
  return weeklyCount + requestedQuantity <= WEEKLY_LIMIT;
}

/**
 * Obtener fecha de reset del límite semanal
 */
export async function getWeeklyLimitResetDate(userId: string): Promise<Date | null> {
  const orders = await getUserWeeklyBoosterOrders(userId);
  
  if (orders.length === 0) {
    return null;
  }

  // El límite se reseteará 7 días después de la primera orden de la semana
  const oldestOrder = orders.reduce((prev, current) => {
    return new Date(prev.order_date) < new Date(current.order_date) ? prev : current;
  });

  const resetDate = new Date(new Date(oldestOrder.order_date).getTime() + 7 * 24 * 60 * 60 * 1000);
  return resetDate;
}

/**
 * Obtener todas las órdenes del usuario
 */
export async function getUserOrders(userId: string): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('tcg_orders')
    .select('*')
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obtener todas las órdenes de sobres del usuario
 */
export async function getUserBoosterOrders(userId: string): Promise<BoosterOrder[]> {
  const { data, error } = await supabase
    .from('tcg_booster_orders')
    .select('*')
    .eq('user_id', userId)
    .order('order_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
