/**
 * Aircraft Parts Image Mapping
 * Better, more specific images for aircraft parts
 */

export const aircraftPartImages = {
  // Engine Components
  "spark_plug": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop", // Actual spark plug
  "oil_filter": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", // Oil filter
  "fuel_pump": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", // Fuel pump
  "air_filter": "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=300&h=300&fit=crop", // Air filter
  "carburetor": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop", // Carburetor
  "ignition_harness": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", // Wiring/harness
  
  // Flight Instruments
  "altimeter": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop", // Aircraft instruments
  "airspeed_indicator": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop", // Airspeed indicator
  "attitude_indicator": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop", // Gyro instruments
  "compass": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop", // Compass
  "turn_coordinator": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop", // Turn coordinator
  
  // Electrical Components
  "nav_light": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop", // Aircraft lights
  "strobe_light": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop", // Strobe light
  "landing_light": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop", // Landing light
  "alternator": "https://images.unsplash.com/photo-1565678780-0af8b11c8005?w=300&h=300&fit=crop", // Alternator
  "battery": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", // Battery
  
  // Control Surfaces
  "aileron_hinge": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop", // Control surface parts
  "elevator_trim": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop", // Trim tab
  "rudder_cable": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", // Control cable
  
  // Communication/Navigation
  "radio": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop", // Aviation radio
  "transponder": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop", // Transponder
  "gps": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop", // GPS unit
  "antenna": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop", // Antenna
  
  // Landing Gear
  "tire": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", // Aircraft tire
  "brake_disc": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", // Brake disc
  "shock_strut": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=300&h=300&fit=crop", // Shock strut
  
  // Default fallbacks by category
  "engine_components": "https://images.unsplash.com/photo-1565678780-0af8b11c8005?w=300&h=300&fit=crop",
  "flight_instruments": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop", 
  "electrical_components": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=300&fit=crop",
  "avionics": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
  "control_surfaces": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop",
  "landing_gear": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
  "communication_navigation": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop"
};

/**
 * Get appropriate image for a part based on its name, category, or part number
 */
export function getPartImage(part) {
  const partName = part.name?.toLowerCase() || '';
  const category = part.category?.toLowerCase().replace(/\s+/g, '_') || '';
  
  // Try to match by specific part name keywords
  if (partName.includes('spark plug')) return aircraftPartImages.spark_plug;
  if (partName.includes('oil filter')) return aircraftPartImages.oil_filter;
  if (partName.includes('fuel pump')) return aircraftPartImages.fuel_pump;
  if (partName.includes('air filter')) return aircraftPartImages.air_filter;
  if (partName.includes('carburetor')) return aircraftPartImages.carburetor;
  if (partName.includes('ignition harness')) return aircraftPartImages.ignition_harness;
  
  if (partName.includes('altimeter')) return aircraftPartImages.altimeter;
  if (partName.includes('airspeed')) return aircraftPartImages.airspeed_indicator;
  if (partName.includes('attitude')) return aircraftPartImages.attitude_indicator;
  if (partName.includes('compass')) return aircraftPartImages.compass;
  if (partName.includes('turn coordinator')) return aircraftPartImages.turn_coordinator;
  
  if (partName.includes('nav light')) return aircraftPartImages.nav_light;
  if (partName.includes('strobe')) return aircraftPartImages.strobe_light;
  if (partName.includes('landing light')) return aircraftPartImages.landing_light;
  if (partName.includes('alternator')) return aircraftPartImages.alternator;
  if (partName.includes('battery')) return aircraftPartImages.battery;
  
  if (partName.includes('radio')) return aircraftPartImages.radio;
  if (partName.includes('transponder')) return aircraftPartImages.transponder;
  if (partName.includes('gps')) return aircraftPartImages.gps;
  if (partName.includes('antenna')) return aircraftPartImages.antenna;
  
  if (partName.includes('tire')) return aircraftPartImages.tire;
  if (partName.includes('brake')) return aircraftPartImages.brake_disc;
  if (partName.includes('shock')) return aircraftPartImages.shock_strut;
  
  // Fallback to category-based image
  if (aircraftPartImages[category]) {
    return aircraftPartImages[category];
  }
  
  // Final fallback
  return part.photo || part.image || '/api/placeholder/100/100';
}