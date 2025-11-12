// Image Replacement Utility
// Replaces the generic image photo-1581833971358-2c8b550f87b3 with contextually appropriate aircraft part images

const fs = require('fs');
const path = require('path');

// Mapping of better aircraft part images
const imageReplacements = {
  // High-quality aircraft part images from Unsplash
  "spark_plug": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&h=300&fit=crop",
  "oil_filter": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", 
  "engine_component": "https://images.unsplash.com/photo-1565678780-0af8b11c8005?w=300&h=300&fit=crop",
  "avionics": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop",
  "hydraulic": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop",
  "propeller": "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=300&fit=crop", // Keep for propellers
  "landing_gear": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop",
  "generic_aircraft": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop"
};

// The problematic image URL to replace
const OLD_IMAGE = "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=300&fit=crop";

// Smart replacement logic based on context
function getReplacementImage(context) {
  const contextLower = context.toLowerCase();
  
  if (contextLower.includes('spark plug')) return imageReplacements.spark_plug;
  if (contextLower.includes('oil filter')) return imageReplacements.oil_filter;
  if (contextLower.includes('engine') || contextLower.includes('alternator')) return imageReplacements.engine_component;
  if (contextLower.includes('avionics') || contextLower.includes('navigation') || contextLower.includes('instrument')) return imageReplacements.avionics;
  if (contextLower.includes('hydraulic') || contextLower.includes('shock') || contextLower.includes('strut')) return imageReplacements.hydraulic;
  if (contextLower.includes('propeller') || contextLower.includes('prop')) return imageReplacements.propeller;
  if (contextLower.includes('landing') || contextLower.includes('gear') || contextLower.includes('wheel')) return imageReplacements.landing_gear;
  
  // Default to generic aircraft image
  return imageReplacements.generic_aircraft;
}

// Function to replace images in a file
function replaceImagesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(OLD_IMAGE)) {
        // Get context from surrounding lines
        const context = lines.slice(Math.max(0, i-3), i+3).join(' ');
        const newImage = getReplacementImage(context);
        
        lines[i] = lines[i].replace(OLD_IMAGE, newImage);
        modified = true;
        
        console.log(`Replaced image in ${filePath} line ${i+1}`);
        console.log(`Context: ${context.substring(0, 100)}...`);
        console.log(`New image: ${newImage}\n`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`✅ Updated file: ${filePath}\n`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Files to process
const filesToProcess = [
  './data/aircraftInventory.js',
  './demo/ImageComparisonDemo.js'
];

console.log('🔄 Starting image replacement process...\n');

filesToProcess.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    console.log(`Processing: ${file}`);
    replaceImagesInFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('✨ Image replacement complete!');