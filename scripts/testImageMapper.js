// Test script to check what images the PartImageMapper returns
const fs = require('fs');
const path = require('path');

// Load the PartImageMapper
let getPartImage;
try {
  const mapperPath = path.join(__dirname, '..', 'utils', 'PartImageMapper.js');
  const mapperContent = fs.readFileSync(mapperPath, 'utf8');
  
  // Extract the getPartImage function (since it's an ES module)
  eval(mapperContent.replace('export { getPartImage };', ''));
} catch (error) {
  console.error('Could not load PartImageMapper:', error.message);
  process.exit(1);
}

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

console.log('🧪 Testing PartImageMapper with sample inventory items...\n');

// Test first 10 items
const sampleItems = aircraftPartsInventory.slice(0, 10);

sampleItems.forEach((part, index) => {
  const originalImage = part.photo || part.image || 'No image field';
  const mappedImage = getPartImage(part);
  
  console.log(`${index + 1}. [${part.id}] ${part.name}`);
  console.log(`   Category: ${part.category}`);
  console.log(`   Original: ${originalImage.substring(0, 80)}...`);
  console.log(`   Mapped:   ${mappedImage.substring(0, 80)}...`);
  console.log(`   Same?: ${originalImage === mappedImage ? '✅' : '❌'}`);
  console.log('');
});

console.log('💡 Legend:');
console.log('✅ = PartImageMapper returned original image (part.photo field)');
console.log('❌ = PartImageMapper provided intelligent fallback image');