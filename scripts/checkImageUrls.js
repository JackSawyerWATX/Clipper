// Script to check which images are broken or failing to load
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

console.log('🔍 Testing image URLs for accessibility...\n');

function testImageUrl(url) {
  return new Promise((resolve) => {
    if (!url || url.includes('placeholder')) {
      resolve({ url, status: 'placeholder', accessible: false });
      return;
    }
    
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, (response) => {
      const accessible = response.statusCode === 200;
      resolve({ 
        url, 
        status: response.statusCode, 
        accessible,
        contentType: response.headers['content-type'] 
      });
      response.destroy();
    });
    
    request.on('error', () => {
      resolve({ url, status: 'error', accessible: false });
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({ url, status: 'timeout', accessible: false });
    });
  });
}

async function checkAllImages() {
  let brokenImages = [];
  let workingImages = [];
  let placeholderImages = [];
  
  const promises = aircraftPartsInventory.slice(0, 15).map(async (part, index) => {
    const imageUrl = part.photo || part.image;
    const result = await testImageUrl(imageUrl);
    
    if (result.status === 'placeholder') {
      placeholderImages.push({ part, result });
    } else if (result.accessible) {
      workingImages.push({ part, result });
    } else {
      brokenImages.push({ part, result });
    }
    
    console.log(`${index + 1}. [${part.id}] ${part.name}`);
    console.log(`   Image: ${result.accessible ? '✅' : '❌'} ${result.status} - ${imageUrl.substring(0, 60)}...`);
  });
  
  await Promise.all(promises);
  
  console.log('\n📊 Summary:');
  console.log(`✅ Working images: ${workingImages.length}`);
  console.log(`❌ Broken images: ${brokenImages.length}`);
  console.log(`🔗 Placeholder images: ${placeholderImages.length}`);
  
  if (brokenImages.length > 0) {
    console.log('\n❌ Parts with broken images:');
    brokenImages.forEach(({ part, result }) => {
      console.log(`   • ${part.name} - Status: ${result.status}`);
    });
  }
}

checkAllImages().catch(console.error);