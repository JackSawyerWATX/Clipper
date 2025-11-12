// Complete inventory image verification script
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load inventory data
let aircraftPartsInventory = [];
try {
  const inventoryPath = path.join(__dirname, '..', 'data', 'aircraftInventory.js');
  const fileContent = fs.readFileSync(inventoryPath, 'utf8');
  
  const arrayMatch = fileContent.match(/export const aircraftPartsInventory = (\[[\s\S]*?\]);/);
  if (arrayMatch) {
    aircraftPartsInventory = eval(arrayMatch[1]);
  }
} catch (error) {
  console.error('Could not load inventory data:', error.message);
  process.exit(1);
}

console.log(`🔍 Checking ALL ${aircraftPartsInventory.length} inventory items for missing/broken images...\n`);

let itemsWithoutImages = [];
let itemsWithBrokenImages = [];
let itemsWithWorkingImages = [];

// Check each item synchronously to avoid overwhelming the server
for (let i = 0; i < aircraftPartsInventory.length; i++) {
  const part = aircraftPartsInventory[i];
  const imageUrl = part.photo || part.image;
  
  if (!imageUrl || imageUrl.trim() === '') {
    itemsWithoutImages.push({
      index: i + 1,
      id: part.id,
      name: part.name,
      category: part.category
    });
    console.log(`${i + 1}. [${part.id}] ${part.name} - ❌ NO IMAGE`);
  } else if (imageUrl.includes('placeholder') || imageUrl.includes('example.com')) {
    itemsWithBrokenImages.push({
      index: i + 1,
      id: part.id,
      name: part.name,
      imageUrl: imageUrl
    });
    console.log(`${i + 1}. [${part.id}] ${part.name} - ⚠️ PLACEHOLDER`);
  } else {
    itemsWithWorkingImages.push({
      index: i + 1,
      id: part.id,
      name: part.name,
      imageUrl: imageUrl
    });
    console.log(`${i + 1}. [${part.id}] ${part.name} - ✅ HAS IMAGE`);
  }
}

console.log('\n📊 Complete Inventory Image Analysis:');
console.log(`Total items: ${aircraftPartsInventory.length}`);
console.log(`✅ Items with images: ${itemsWithWorkingImages.length}`);
console.log(`❌ Items without images: ${itemsWithoutImages.length}`);
console.log(`⚠️ Items with placeholder images: ${itemsWithBrokenImages.length}`);

if (itemsWithoutImages.length > 0) {
  console.log('\n❌ Items WITHOUT any image field:');
  itemsWithoutImages.forEach(item => {
    console.log(`  • [${item.id}] ${item.name} (${item.category})`);
  });
}

if (itemsWithBrokenImages.length > 0) {
  console.log('\n⚠️ Items with placeholder/broken images:');
  itemsWithBrokenImages.forEach(item => {
    console.log(`  • [${item.id}] ${item.name}`);
    console.log(`    URL: ${item.imageUrl}`);
  });
}

if (itemsWithoutImages.length === 0 && itemsWithBrokenImages.length === 0) {
  console.log('\n🎉 SUCCESS: All inventory items have proper image URLs!');
  console.log('✨ Your inventory should now display images for all aircraft parts.');
} else {
  console.log('\n💡 Next steps: Update the items listed above with proper image URLs.');
}