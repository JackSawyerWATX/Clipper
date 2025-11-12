export const invoicesData = [
  {
    id: 'INV-2025-001',
    orderId: 'ORD001',
    customerName: 'Falcon Aviation Services',
    customerEmail: 'orders@falconaviation.com',
    invoiceDate: '2025-11-10',
    dueDate: '2025-12-10',
    status: 'Paid',
    subtotal: 15750.00,
    tax: 1260.00,
    total: 17010.00,
    paidDate: '2025-11-08',
    paymentMethod: 'Wire Transfer',
    items: [
      { partId: 'AC001', partName: 'Pratt & Whitney Turbine Blade', quantity: 2, unitPrice: 5250.00, total: 10500.00 },
      { partId: 'AC015', partName: 'Honeywell Flight Management Computer', quantity: 1, unitPrice: 5250.00, total: 5250.00 }
    ],
    terms: 'Net 30'
  },
  {
    id: 'INV-2025-002',
    orderId: 'ORD002',
    customerName: 'Atlantic Charter Co.',
    customerEmail: 'procurement@atlanticcharter.com',
    invoiceDate: '2025-11-09',
    dueDate: '2025-11-24',
    status: 'Pending',
    subtotal: 8950.00,
    tax: 716.00,
    total: 9666.00,
    items: [
      { partId: 'AC021', partName: 'Garmin G1000 Display Unit', quantity: 1, unitPrice: 8950.00, total: 8950.00 }
    ],
    terms: 'Net 15'
  },
  {
    id: 'INV-2025-003',
    orderId: 'ORD003',
    customerName: 'Southwest Air Maintenance',
    customerEmail: 'parts@swmaintenance.com',
    invoiceDate: '2025-11-08',
    dueDate: '2025-12-08',
    status: 'Paid',
    subtotal: 3280.00,
    tax: 262.40,
    total: 3542.40,
    paidDate: '2025-11-10',
    paymentMethod: 'Credit Card',
    items: [
      { partId: 'AC031', partName: 'Boeing 737 Landing Gear Actuator', quantity: 1, unitPrice: 3280.00, total: 3280.00 }
    ],
    terms: 'Net 30'
  },
  {
    id: 'INV-2025-004',
    orderId: 'ORD004',
    customerName: 'Executive Jets Inc.',
    customerEmail: 'supply@executivejets.com',
    invoiceDate: '2025-11-11',
    dueDate: '2025-12-26',
    status: 'Draft',
    subtotal: 12400.00,
    tax: 992.00,
    total: 13392.00,
    items: [
      { partId: 'AC041', partName: 'Rolls-Royce Engine Mount', quantity: 2, unitPrice: 4200.00, total: 8400.00 },
      { partId: 'AC051', partName: 'Collins Aerospace Weather Radar', quantity: 1, unitPrice: 4000.00, total: 4000.00 }
    ],
    terms: 'Net 45'
  },
  {
    id: 'INV-2024-089',
    orderId: 'ORD-2024-089',
    customerName: 'Skyline Corporate Aviation',
    customerEmail: 'parts@skylinecorp.com',
    invoiceDate: '2024-12-15',
    dueDate: '2025-01-15',
    status: 'Overdue',
    subtotal: 7850.00,
    tax: 628.00,
    total: 8478.00,
    items: [
      { partId: 'AC025', partName: 'Bendix King Transponder', quantity: 1, unitPrice: 7850.00, total: 7850.00 }
    ],
    terms: 'Net 30'
  },
  // Future invoices
  {
    id: 'INV-2025-005',
    orderId: 'ORD-FUT-001',
    customerName: 'Desert Wings Aviation',
    customerEmail: 'procurement@desertwings.com',
    invoiceDate: '2025-11-25',
    dueDate: '2025-12-25',
    status: 'Scheduled',
    subtotal: 18500.00,
    tax: 1480.00,
    total: 19980.00,
    items: [
      { partId: 'AC072', partName: 'Turbofan Engine Component', quantity: 1, unitPrice: 18500.00, total: 18500.00 }
    ],
    terms: 'Net 30'
  },
  {
    id: 'INV-2025-006',
    orderId: 'ORD-FUT-002',
    customerName: 'Coastal Air Services',
    customerEmail: 'orders@coastalair.com',
    invoiceDate: '2025-12-01',
    dueDate: '2025-12-31',
    status: 'Scheduled',
    subtotal: 22400.00,
    tax: 1792.00,
    total: 24192.00,
    items: [
      { partId: 'AC085', partName: 'Avionics Suite Upgrade', quantity: 1, unitPrice: 22400.00, total: 22400.00 }
    ],
    terms: 'Net 30'
  }
];

export const recurringPurchasesData = [
  {
    id: 'REC-001',
    customerName: 'Falcon Aviation Services',
    productName: 'Monthly Maintenance Kit',
    frequency: 'Monthly',
    nextInvoiceDate: '2025-12-01',
    amount: 4500.00,
    status: 'Active',
    startDate: '2024-01-01',
    renewalDate: '2026-01-01',
    totalInvoices: 23,
    items: [
      'Oil Filter Set (AC-F001)',
      'Spark Plugs (AC-S012)',
      'Gasket Kit (AC-G008)'
    ]
  },
  {
    id: 'REC-002',
    customerName: 'Atlantic Charter Co.',
    productName: 'Quarterly Safety Inspection Parts',
    frequency: 'Quarterly',
    nextInvoiceDate: '2026-01-15',
    amount: 8750.00,
    status: 'Active',
    startDate: '2023-04-15',
    renewalDate: '2025-04-15',
    totalInvoices: 8,
    items: [
      'Navigation Light Kit (AC-N025)',
      'Brake Pad Set (AC-B018)',
      'Fuel Filter (AC-F045)'
    ]
  },
  {
    id: 'REC-003',
    customerName: 'Southwest Air Maintenance',
    productName: 'Semi-Annual Avionics Update',
    frequency: 'Semi-Annual',
    nextInvoiceDate: '2026-05-01',
    amount: 12200.00,
    status: 'Active',
    startDate: '2024-05-01',
    renewalDate: '2027-05-01',
    totalInvoices: 4,
    items: [
      'GPS Software Update (AC-G112)',
      'Communication Radio Upgrade (AC-C089)',
      'Display Unit Calibration (AC-D056)'
    ]
  },
  {
    id: 'REC-004',
    customerName: 'Executive Jets Inc.',
    productName: 'Annual Engine Overhaul Package',
    frequency: 'Annually',
    nextInvoiceDate: '2026-03-01',
    amount: 45000.00,
    status: 'Pending Renewal',
    startDate: '2022-03-01',
    renewalDate: '2025-03-01',
    totalInvoices: 3,
    items: [
      'Engine Rebuild Kit (AC-E201)',
      'Turbine Blade Set (AC-T089)',
      'Control System Upgrade (AC-C156)'
    ]
  },
  {
    id: 'REC-005',
    customerName: 'Desert Wings Aviation',
    productName: 'Monthly Consumables Package',
    frequency: 'Monthly',
    nextInvoiceDate: '2025-12-15',
    amount: 2800.00,
    status: 'Active',
    startDate: '2024-06-15',
    renewalDate: '2026-06-15',
    totalInvoices: 17,
    items: [
      'Hydraulic Fluid (AC-H012)',
      'Cleaning Supplies (AC-C234)',
      'Safety Equipment (AC-S067)'
    ]
  }
];

// Helper functions
export const getInvoicesByStatus = (status) => {
  return invoicesData.filter(invoice => invoice.status === status);
};

export const getInvoicesByDateRange = (startDate, endDate) => {
  return invoicesData.filter(invoice => {
    const invoiceDate = new Date(invoice.invoiceDate);
    return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
  });
};

export const getRecurringByStatus = (status) => {
  return recurringPurchasesData.filter(recurring => recurring.status === status);
};

export const getInvoiceStats = () => {
  const total = invoicesData.length;
  const paid = getInvoicesByStatus('Paid').length;
  const pending = getInvoicesByStatus('Pending').length;
  const overdue = getInvoicesByStatus('Overdue').length;
  const scheduled = getInvoicesByStatus('Scheduled').length;
  const draft = getInvoicesByStatus('Draft').length;
  
  const totalRevenue = invoicesData
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const outstandingAmount = invoicesData
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const recurringRevenue = recurringPurchasesData
    .filter(rec => rec.status === 'Active')
    .reduce((sum, rec) => sum + rec.amount, 0);

  return {
    total,
    paid,
    pending,
    overdue,
    scheduled,
    draft,
    totalRevenue,
    outstandingAmount,
    recurringRevenue
  };
};