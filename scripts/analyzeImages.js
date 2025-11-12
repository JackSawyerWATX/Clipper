// Script to find inventory items missing images
const fs = require('fs');
const path = require('path');

// Read and parse the inventory data file
let aircraftPartsInventory = [];
try {
  const inventoryPath = path.join(__dirname, '..', 'data', 'aircraftInventory.js');
  const fileContent = fs.readFileSync(inventoryPath, 'utf8');
  
  // Extract the array data using regex (since it's an ES module)
  const arrayMatch = fileContent.match(/export const aircraftPartsInventory = (\[[\s\S]*?\]);/);
  if (arrayMatch) {
    // Use eval to parse the array (be careful with this in production)
    aircraftPartsInventory = eval(arrayMatch[1]);
  } else {
    throw new Error('Could not find aircraftPartsInventory array in file');
  }
} catch (error) {
  console.error('Could not load inventory data:', error.message);
  process.exit(1);
}

console.log('🔍 Analyzing inventory for missing images...\n');

let itemsWithoutImages = [];
let itemsWithImages = [];
let itemsWithBrokenImages = [];

aircraftPartsInventory.forEach((item, index) => {
  const hasPhoto = item.photo && item.photo.trim() !== '';
  const hasImage = item.image && item.image.trim() !== '';
  
  if (!hasPhoto && !hasImage) {
    itemsWithoutImages.push({
      index: index + 1,
      id: item.id,
      name: item.name,
      category: item.category
    });
  } else if (hasPhoto || hasImage) {
    itemsWithImages.push({
      index: index + 1,
      id: item.id,
      name: item.name,
      photo: item.photo || item.image
    });
    
    // Check for placeholder or broken images
    const imageUrl = item.photo || item.image;
    if (imageUrl.includes('placeholder') || imageUrl.includes('example.com')) {
      itemsWithBrokenImages.push({
        index: index + 1,
        id: item.id,
        name: item.name,
        imageUrl: imageUrl
      });
    }
  }
});

console.log(`📊 Inventory Analysis Results:`);
console.log(`Total items: ${aircraftPartsInventory.length}`);
console.log(`Items with images: ${itemsWithImages.length}`);
console.log(`Items without images: ${itemsWithoutImages.length}`);
console.log(`Items with potential placeholder images: ${itemsWithBrokenImages.length}\n`);

if (itemsWithoutImages.length > 0) {
  console.log('❌ Items WITHOUT images:');
  itemsWithoutImages.forEach(item => {
    console.log(`  ${item.index}. [${item.id}] ${item.name} (${item.category})`);
  });
  console.log('');
}

if (itemsWithBrokenImages.length > 0) {
  console.log('⚠️  Items with placeholder/broken images:');
  itemsWithBrokenImages.forEach(item => {
    console.log(`  ${item.index}. [${item.id}] ${item.name}`);
    console.log(`     URL: ${item.imageUrl}`);
  });
  console.log('');
}

if (itemsWithoutImages.length === 0 && itemsWithBrokenImages.length === 0) {
  console.log('✅ All inventory items have proper images!');
} else {
  console.log('💡 Recommendation: Update the PartImageMapper.js to ensure all parts get appropriate images.');
}