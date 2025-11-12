export const shipmentsData = [
  { id: 1, trackingNumber: 'SH001', status: 'In Transit', destination: 'New York, NY', items: ['AC001', 'AC002'], estimatedDelivery: '2025-11-13', priority: 'High', carrier: 'FedEx' },
  { id: 2, trackingNumber: 'SH002', status: 'Delivered', destination: 'Los Angeles, CA', items: ['AC021', 'AC022'], deliveredDate: '2025-11-10', priority: 'Medium', carrier: 'UPS' },
  { id: 3, trackingNumber: 'SH003', status: 'Processing', destination: 'Chicago, IL', items: ['AC031'], estimatedDelivery: '2025-11-14', priority: 'Low', carrier: 'DHL' },
  { id: 4, trackingNumber: 'SH004', status: 'Shipped', destination: 'Miami, FL', items: ['AC041', 'AC015'], estimatedDelivery: '2025-11-12', priority: 'High', carrier: 'FedEx' },
  { id: 5, trackingNumber: 'SH005', status: 'Processing', destination: 'Seattle, WA', items: ['AC051'], estimatedDelivery: '2025-11-15', priority: 'Medium', carrier: 'UPS' },
  { id: 6, trackingNumber: 'SH006', status: 'In Transit', destination: 'Dallas, TX', items: ['AC061', 'AC071'], estimatedDelivery: '2025-11-13', priority: 'High', carrier: 'FedEx' },
  { id: 7, trackingNumber: 'SH007', status: 'Delivered', destination: 'Boston, MA', items: ['AC081'], deliveredDate: '2025-11-09', priority: 'Low', carrier: 'UPS' },
  { id: 8, trackingNumber: 'SH008', status: 'Pending', destination: 'Phoenix, AZ', items: ['AC091', 'AC101'], estimatedDelivery: '2025-11-16', priority: 'Medium', carrier: 'DHL' },
  { id: 9, trackingNumber: 'SH009', status: 'In Transit', destination: 'Denver, CO', items: ['AC111'], estimatedDelivery: '2025-11-14', priority: 'High', carrier: 'FedEx' },
  { id: 10, trackingNumber: 'SH010', status: 'Shipped', destination: 'Atlanta, GA', items: ['AC121', 'AC131', 'AC141'], estimatedDelivery: '2025-11-12', priority: 'Medium', carrier: 'UPS' },
  { id: 11, trackingNumber: 'SH011', status: 'Processing', destination: 'Las Vegas, NV', items: ['AC151'], estimatedDelivery: '2025-11-17', priority: 'Low', carrier: 'DHL' },
  { id: 12, trackingNumber: 'SH012', status: 'Delivered', destination: 'Orlando, FL', items: ['AC161', 'AC171'], deliveredDate: '2025-11-11', priority: 'High', carrier: 'FedEx' }
];

export const ordersData = [
  {
    id: 'ORD001',
    customerName: 'Falcon Aviation Services',
    customerEmail: 'orders@falconaviation.com',
    orderDate: '2025-11-10',
    status: 'Processing',
    priority: 'High',
    totalAmount: 15750.00,
    items: [
      { partId: 'AC001', partName: 'Pratt & Whitney Turbine Blade', quantity: 2, unitPrice: 5250.00 },
      { partId: 'AC015', partName: 'Honeywell Flight Management Computer', quantity: 1, unitPrice: 5250.00 }
    ],
    shippingAddress: '123 Airport Blvd, Miami, FL 33142',
    estimatedDelivery: '2025-11-15'
  },
  {
    id: 'ORD002',
    customerName: 'Atlantic Charter Co.',
    customerEmail: 'procurement@atlanticcharter.com',
    orderDate: '2025-11-09',
    status: 'Shipped',
    priority: 'Medium',
    totalAmount: 8950.00,
    items: [
      { partId: 'AC021', partName: 'Garmin G1000 Display Unit', quantity: 1, unitPrice: 8950.00 }
    ],
    shippingAddress: '456 Hangar Row, Atlanta, GA 30320',
    trackingNumber: 'SH002',
    estimatedDelivery: '2025-11-12'
  },
  {
    id: 'ORD003',
    customerName: 'Southwest Air Maintenance',
    customerEmail: 'parts@swmaintenance.com',
    orderDate: '2025-11-08',
    status: 'Delivered',
    priority: 'Low',
    totalAmount: 3280.00,
    items: [
      { partId: 'AC031', partName: 'Boeing 737 Landing Gear Actuator', quantity: 1, unitPrice: 3280.00 }
    ],
    shippingAddress: '789 Maintenance Way, Phoenix, AZ 85034',
    trackingNumber: 'SH001',
    deliveredDate: '2025-11-10'
  },
  {
    id: 'ORD004',
    customerName: 'Executive Jets Inc.',
    customerEmail: 'supply@executivejets.com',
    orderDate: '2025-11-11',
    status: 'Pending',
    priority: 'High',
    totalAmount: 12400.00,
    items: [
      { partId: 'AC041', partName: 'Rolls-Royce Engine Mount', quantity: 2, unitPrice: 4200.00 },
      { partId: 'AC051', partName: 'Collins Aerospace Weather Radar', quantity: 1, unitPrice: 4000.00 }
    ],
    shippingAddress: '321 Corporate Dr, Dallas, TX 75201',
    estimatedDelivery: '2025-11-18'
  },
  {
    id: 'ORD005',
    customerName: 'Regional Airways',
    customerEmail: 'orders@regionalairways.com',
    orderDate: '2025-11-07',
    status: 'Cancelled',
    priority: 'Medium',
    totalAmount: 6750.00,
    items: [
      { partId: 'AC061', partName: 'Airbus A320 Hydraulic Pump', quantity: 1, unitPrice: 6750.00 }
    ],
    shippingAddress: '654 Terminal Rd, Denver, CO 80249',
    cancelReason: 'Customer request - found alternative supplier'
  }
];