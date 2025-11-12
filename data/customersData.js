export const customersData = [
  {
    id: 'CUST001',
    companyName: 'Falcon Aviation Services',
    contactName: 'Michael Reynolds',
    email: 'orders@falconaviation.com',
    phone: '+1 (305) 555-0123',
    address: '123 Airport Blvd, Miami, FL 33142',
    customerSince: '2023-03-15',
    totalOrders: 18,
    totalSpent: 287500.00,
    status: 'Active',
    creditLimit: 50000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Sarah Johnson',
      title: 'Procurement Manager',
      directPhone: '+1 (305) 555-0124',
      email: 'sarah.johnson@falconaviation.com'
    }
  },
  {
    id: 'CUST002',
    companyName: 'Atlantic Charter Co.',
    contactName: 'David Chen',
    email: 'procurement@atlanticcharter.com',
    phone: '+1 (404) 555-0156',
    address: '456 Hangar Row, Atlanta, GA 30320',
    customerSince: '2023-07-22',
    totalOrders: 12,
    totalSpent: 156750.00,
    status: 'Active',
    creditLimit: 35000.00,
    paymentTerms: 'Net 15',
    primaryContact: {
      name: 'Maria Rodriguez',
      title: 'Operations Director',
      directPhone: '+1 (404) 555-0157',
      email: 'maria.rodriguez@atlanticcharter.com'
    }
  },
  {
    id: 'CUST003',
    companyName: 'Southwest Air Maintenance',
    contactName: 'James Wilson',
    email: 'parts@swmaintenance.com',
    phone: '+1 (602) 555-0189',
    address: '789 Maintenance Way, Phoenix, AZ 85034',
    customerSince: '2022-11-08',
    totalOrders: 25,
    totalSpent: 198450.00,
    status: 'Active',
    creditLimit: 40000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Robert Davis',
      title: 'Parts Manager',
      directPhone: '+1 (602) 555-0190',
      email: 'robert.davis@swmaintenance.com'
    }
  },
  {
    id: 'CUST004',
    companyName: 'Executive Jets Inc.',
    contactName: 'Lisa Thompson',
    email: 'supply@executivejets.com',
    phone: '+1 (214) 555-0245',
    address: '321 Corporate Dr, Dallas, TX 75201',
    customerSince: '2023-01-12',
    totalOrders: 8,
    totalSpent: 95200.00,
    status: 'Active',
    creditLimit: 25000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Kevin Martinez',
      title: 'Fleet Manager',
      directPhone: '+1 (214) 555-0246',
      email: 'kevin.martinez@executivejets.com'
    }
  },
  {
    id: 'CUST005',
    companyName: 'Regional Airways',
    contactName: 'Amanda Foster',
    email: 'orders@regionalairways.com',
    phone: '+1 (303) 555-0298',
    address: '654 Terminal Rd, Denver, CO 80249',
    customerSince: '2022-05-30',
    totalOrders: 15,
    totalSpent: 142800.00,
    status: 'Active',
    creditLimit: 30000.00,
    paymentTerms: 'Net 45',
    primaryContact: {
      name: 'Christopher Lee',
      title: 'Maintenance Coordinator',
      directPhone: '+1 (303) 555-0299',
      email: 'christopher.lee@regionalairways.com'
    }
  },
  {
    id: 'CUST006',
    companyName: 'Skyline Corporate Aviation',
    contactName: 'Jennifer White',
    email: 'parts@skylinecorp.com',
    phone: '+1 (206) 555-0321',
    address: '987 Flight Line Ave, Seattle, WA 98108',
    customerSince: '2023-09-14',
    totalOrders: 6,
    totalSpent: 78900.00,
    status: 'Active',
    creditLimit: 20000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Thomas Anderson',
      title: 'Technical Director',
      directPhone: '+1 (206) 555-0322',
      email: 'thomas.anderson@skylinecorp.com'
    }
  },
  {
    id: 'CUST007',
    companyName: 'Desert Wings Aviation',
    contactName: 'Mark Garcia',
    email: 'procurement@desertwings.com',
    phone: '+1 (702) 555-0387',
    address: '456 Desert Sky Blvd, Las Vegas, NV 89119',
    customerSince: '2023-04-18',
    totalOrders: 11,
    totalSpent: 134600.00,
    status: 'Active',
    creditLimit: 28000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Nicole Taylor',
      title: 'Supply Chain Manager',
      directPhone: '+1 (702) 555-0388',
      email: 'nicole.taylor@desertwings.com'
    }
  },
  {
    id: 'CUST008',
    companyName: 'Coastal Air Services',
    contactName: 'Ryan Murphy',
    email: 'orders@coastalair.com',
    phone: '+1 (617) 555-0412',
    address: '123 Harbor View Dr, Boston, MA 02128',
    customerSince: '2022-08-25',
    totalOrders: 22,
    totalSpent: 245300.00,
    status: 'Active',
    creditLimit: 45000.00,
    paymentTerms: 'Net 30',
    primaryContact: {
      name: 'Emily Clark',
      title: 'Operations Manager',
      directPhone: '+1 (617) 555-0413',
      email: 'emily.clark@coastalair.com'
    }
  }
];

// Helper functions for customer data
export const getActiveCustomers = () => {
  return customersData.filter(customer => customer.status === 'Active');
};

export const getCustomerById = (id) => {
  return customersData.find(customer => customer.id === id);
};

export const getTopCustomersBySpending = (limit = 5) => {
  return [...customersData]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

export const getTotalCustomerValue = () => {
  return customersData.reduce((total, customer) => total + customer.totalSpent, 0);
};

export const getCustomerStats = () => {
  const total = customersData.length;
  const active = getActiveCustomers().length;
  const totalValue = getTotalCustomerValue();
  const avgOrderValue = totalValue / customersData.reduce((total, customer) => total + customer.totalOrders, 0);

  return {
    total,
    active,
    totalValue,
    avgOrderValue
  };
};