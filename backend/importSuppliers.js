// Script to import suppliers from static file into backend API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/suppliers';


(async () => {
  const module = await import('../data/suppliersData.js');
  const unsortedSuppliersData = module.unsortedSuppliersData;
  console.log('unsortedSuppliersData length:', unsortedSuppliersData.length);
  if (unsortedSuppliersData.length > 0) {
    console.log('First supplier:', unsortedSuppliersData[0]);
  }
  for (const supplier of unsortedSuppliersData) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier)
      });
      if (res.ok) {
        console.log(`Imported: ${supplier.companyName || supplier.supplierId}`);
      } else {
        const err = await res.text();
        console.error(`Failed to import ${supplier.companyName || supplier.supplierId}: ${err}`);
      }
    } catch (e) {
      console.error(`Error importing ${supplier.companyName || supplier.supplierId}:`, e.message);
    }
  }
  console.log('Import complete.');
})();
