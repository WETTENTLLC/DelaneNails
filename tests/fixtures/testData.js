// Sample test data for NailAide tests

const sampleAppointments = [
  {
    id: 'appt-123',
    clientName: 'Jane Doe',
    date: '2023-11-15T14:00:00Z',
    service: 'Gel Manicure',
    duration: 60,
    price: 45.99,
    status: 'confirmed'
  },
  {
    id: 'appt-124',
    clientName: 'John Smith',
    date: '2023-11-15T16:00:00Z',
    service: 'Regular Pedicure',
    duration: 45,
    price: 35.50,
    status: 'pending'
  }
];

const sampleClients = [
  {
    id: 'client-001',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-123-4567',
    preferences: {
      preferredPolishBrand: 'OPI',
      allergies: 'Acetone',
      favoriteColors: ['Red', 'Pink']
    },
    visitHistory: ['2023-10-01', '2023-10-15', '2023-11-01']
  },
  {
    id: 'client-002',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-987-6543',
    preferences: {
      preferredPolishBrand: 'Essie',
      allergies: 'None',
      favoriteColors: ['Blue', 'Black']
    },
    visitHistory: ['2023-10-05', '2023-10-20']
  }
];

const sampleInventory = [
  {
    id: 'item-001',
    name: 'OPI Nail Polish - Ruby Red',
    category: 'polish',
    quantity: 5,
    reorderThreshold: 2,
    price: 12.99
  },
  {
    id: 'item-002',
    name: 'Acetone Remover',
    category: 'supplies',
    quantity: 3,
    reorderThreshold: 1,
    price: 8.50
  }
];

async function generateTestData(db) {
  // Clear collections
  await db.collection('appointments').deleteMany({});
  await db.collection('clients').deleteMany({});
  await db.collection('inventory').deleteMany({});
  
  // Insert test data
  await db.collection('appointments').insertMany(sampleAppointments);
  await db.collection('clients').insertMany(sampleClients);
  await db.collection('inventory').insertMany(sampleInventory);
  
  return {
    appointments: sampleAppointments,
    clients: sampleClients,
    inventory: sampleInventory
  };
}

module.exports = {
  generateTestData,
  sampleAppointments,
  sampleClients,
  sampleInventory
};
