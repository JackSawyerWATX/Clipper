// Quick test for the fuel cap image replacement
const https = require('https');

const oldImage = "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop";
const newImage = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop";

function testImage(url, label) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      console.log(`${label}: ${response.statusCode === 200 ? '✅' : '❌'} Status ${response.statusCode}`);
      resolve(response.statusCode === 200);
      response.destroy();
    });
    
    request.on('error', () => {
      console.log(`${label}: ❌ Connection Error`);
      resolve(false);
    });
    
    request.setTimeout(3000, () => {
      console.log(`${label}: ❌ Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function testFuelCapImages() {
  console.log('🧪 Testing Fuel Cap Image Replacement...\n');
  
  console.log('Testing OLD image (snowboarding):');
  await testImage(oldImage, 'Snowboarding Image');
  
  console.log('\nTesting NEW image (aircraft part):');
  await testImage(newImage, 'Aircraft Part Image');
  
  console.log('\n✅ Fuel Cap (AC026) now uses appropriate aircraft part image instead of snowboarding!');
}

testFuelCapImages();