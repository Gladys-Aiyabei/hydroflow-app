export type BowserStatus = 'en_route' | 'discharging' | 'ready' | 'standby';

export type Bowser = {
  id: string;
  capacity: number;
  volume: number;
  driver: string;
  driverPhone: string;
  vehicle: string;
  status: BowserStatus;
  location: string;
  speedKmh: number;
  etaMins?: number;
};

export type OrderStatus = 'scheduled' | 'awaiting' | 'in_transit' | 'delivered';
export type OrderCategory = 'Commercial' | 'Residential Outage' | 'Agriculture' | 'Hospital' | 'Industrial';

export type Order = {
  id: string;
  category: OrderCategory;
  customer: string;
  site: string;
  volume: number;
  grade: string;
  status: OrderStatus;
  urgent?: boolean;
  deadline?: string;
  urgentNote?: string;
  window?: string;
  bowserId?: string;
  depotBay?: string;
  advisory?: { title: string; body: string };
  etaMins?: number;
  routeName?: string;
  kmRemaining?: number;
  progress?: number;
};

export const initialBowsers: Bowser[] = [
  {
    id: 'BW-04',
    capacity: 10000,
    volume: 7200,
    driver: 'Marcus K.',
    driverPhone: '+1 (555) 019-382',
    vehicle: 'Scania R450',
    status: 'en_route',
    location: 'Apex Construction Site',
    speedKmh: 42,
    etaMins: 14,
  },
  {
    id: 'BW-07',
    capacity: 5000,
    volume: 900,
    driver: 'Elena R.',
    driverPhone: '+1 (555) 014-227',
    vehicle: 'Isuzu FTR',
    status: 'discharging',
    location: 'Highland Residential Park',
    speedKmh: 0,
  },
  {
    id: 'BW-02',
    capacity: 15000,
    volume: 15000,
    driver: 'Sam T.',
    driverPhone: '+1 (555) 017-903',
    vehicle: 'Volvo FMX Heavy',
    status: 'ready',
    location: 'North Depot • Bay 3 Terminal',
    speedKmh: 0,
  },
  {
    id: 'BW-09',
    capacity: 10000,
    volume: 8000,
    driver: 'Dave L.',
    driverPhone: '+1 (555) 012-640',
    vehicle: 'MAN TGS',
    status: 'en_route',
    location: 'Old Mill Valley Rd',
    speedKmh: 42,
    etaMins: 8,
  },
];

export const initialOrders: Order[] = [
  {
    id: 'HF-9050',
    category: 'Hospital',
    customer: 'St. Jude Medical Center',
    site: 'North Wing Main Cistern Backup Valve • Gate 3',
    volume: 12000,
    grade: 'Potable Certified',
    status: 'awaiting',
    urgent: true,
    deadline: '11:30 AM',
    urgentNote: 'ICU reserve at 14%',
    etaMins: 35,
  },
  {
    id: 'HF-9042',
    category: 'Commercial',
    customer: 'Metro Infrastructure - Zone B',
    site: 'East Pier Foundation Works, Bay 12',
    volume: 10000,
    grade: 'Dust & Concrete',
    status: 'scheduled',
    window: '10:00 - 11:00 AM',
    bowserId: 'BW-04',
    depotBay: 'Depot Bay 2',
  },
  {
    id: 'HF-9043',
    category: 'Residential Outage',
    customer: 'Oakridge Heights HOA',
    site: 'Ridge Road Community Well Failure',
    volume: 5000,
    grade: 'Drinking Water',
    status: 'awaiting',
    advisory: {
      title: '45m Hose Required • Steep Gradient',
      body: 'Residential driveway clearance: Max vehicle height 3.4m. Needs high-pressure discharge coupler.',
    },
  },
  {
    id: 'HF-9039',
    category: 'Agriculture',
    customer: 'Green Valley Hydroponics',
    site: 'Greenhouse Complex 4 • Intake Manifold',
    volume: 8000,
    grade: 'Irrigation Grade',
    status: 'in_transit',
    bowserId: 'BW-09',
    etaMins: 8,
    routeName: 'Old Mill Valley Rd',
    kmRemaining: 1.8,
    progress: 0.78,
  },
];

export const activeDelivery = {
  orderId: 'HF-9038',
  customer: 'Apex Construction - Foundation Works',
  address: '148 Industrial Blvd, Sector 7 (East Gate Bay 4)',
  manager: 'Ryan Cole',
  meterId: 'F-881',
  delivered: 6500,
  target: 6500,
  initialTank: 10000,
  dischargeTime: '20m 18s',
  avgFlow: 320,
  line: '2.5" Camlock Line',
  gps: '37.7749° N, 122.4194° W',
  checks: [
    { key: 'chlorine', title: 'Free Chlorine Residual', sub: 'Standard target 0.2 - 0.8 mg/L', result: '0.5 mg/L', verdict: 'Compliant', icon: 'science' },
    { key: 'turbidity', title: 'Water Clarity (Turbidity)', sub: 'Threshold < 5 NTU', result: '< 1 NTU', verdict: 'Clear', icon: 'water-drop' },
    { key: 'valve', title: 'Storage Inflow Valve', sub: 'Seal, check-valve & pressure test', result: 'Passed', verdict: 'No Backflow', icon: 'plumbing' },
  ] as const,
};

export const formatLitres = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
