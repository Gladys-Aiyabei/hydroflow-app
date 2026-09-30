import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { Bowser, initialBowsers, initialOrders, Order } from './mock';

type NewOrderInput = Pick<Order, 'customer' | 'site' | 'volume' | 'grade' | 'category'> & { urgent: boolean };

type FleetState = {
  bowsers: Bowser[];
  orders: Order[];
  deliveredTodayKl: number;
  deliveryConfirmed: boolean;
  /** Assigns the given bowser, or the best ready bowser with enough water. Returns the bowser id used. */
  assignBowser: (orderId: string, bowserId?: string) => string | undefined;
  compatibleBowsers: (order: Order) => Bowser[];
  addOrder: (input: NewOrderInput) => Order;
  confirmDelivery: (litres: number) => void;
};

const FleetContext = createContext<FleetState | null>(null);

let nextOrderNumber = 9051;

export function FleetProvider({ children }: { children: ReactNode }) {
  const [bowsers, setBowsers] = useState(initialBowsers);
  const [orders, setOrders] = useState(initialOrders);
  const [deliveredTodayKl, setDeliveredTodayKl] = useState(48.5);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  const compatibleBowsers = useCallback(
    (order: Order) =>
      bowsers.filter(
        (b) => (b.status === 'ready' || b.status === 'standby') && b.volume >= Math.min(order.volume, b.capacity),
      ),
    [bowsers],
  );

  const assignBowser = useCallback(
    (orderId: string, bowserId?: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return undefined;
      const chosen = bowserId
        ? bowsers.find((b) => b.id === bowserId)
        : [...compatibleBowsers(order)].sort((a, b) => b.volume - a.volume)[0];
      if (!chosen) return undefined;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'in_transit', urgent: false, bowserId: chosen.id, etaMins: 22, progress: 0.05, kmRemaining: 9.6, routeName: 'Industrial Pkwy' }
            : o,
        ),
      );
      setBowsers((prev) =>
        prev.map((b) => (b.id === chosen.id ? { ...b, status: 'en_route', location: order.customer, etaMins: 22, speedKmh: 38 } : b)),
      );
      return chosen.id;
    },
    [orders, bowsers, compatibleBowsers],
  );

  const addOrder = useCallback((input: NewOrderInput) => {
    const order: Order = {
      id: `HF-${nextOrderNumber++}`,
      customer: input.customer,
      site: input.site,
      volume: input.volume,
      grade: input.grade,
      category: input.category,
      status: 'awaiting',
      urgent: input.urgent,
      deadline: input.urgent ? 'ASAP' : undefined,
      urgentNote: input.urgent ? 'Flagged by dispatch' : undefined,
    };
    setOrders((prev) => (input.urgent ? [order, ...prev] : [...prev, order]));
    return order;
  }, []);

  const confirmDelivery = useCallback(
    (litres: number) => {
      if (deliveryConfirmed) return;
      setDeliveryConfirmed(true);
      setDeliveredTodayKl((kl) => Math.round((kl + litres / 1000) * 10) / 10);
    },
    [deliveryConfirmed],
  );

  const value = useMemo(
    () => ({ bowsers, orders, deliveredTodayKl, deliveryConfirmed, assignBowser, compatibleBowsers, addOrder, confirmDelivery }),
    [bowsers, orders, deliveredTodayKl, deliveryConfirmed, assignBowser, compatibleBowsers, addOrder, confirmDelivery],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
}
