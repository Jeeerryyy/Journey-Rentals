import 'dotenv/config'
import { connectDB } from './_lib/mongodb.js'
import Vehicle from './_lib/models/Vehicle.js'

const vehicles = [
  // ── CARS ──
  {
    type: 'car', brand: 'Maruti', model: 'Swift', year: 2023,
    pricePerDay: 1500, category: 'Hatchback', transmission: 'Manual',
    fuelType: 'CNG', sittingCapacity: 5, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    description: 'The Maruti Swift is a fun-to-drive hatchback perfect for city commutes and short road trips. CNG powered for maximum fuel savings with peppy performance.',
    features: ['Air Conditioning', 'Power Steering', 'Central Locking', 'Music System', 'CNG Kit', 'ABS'],
    locations: ['Solapur Station', 'Hotgi Road', 'Vijapur Road', 'Akkalkot Road'],
  },
  {
    type: 'car', brand: 'Maruti', model: 'Ertiga', year: 2023,
    pricePerDay: 2500, category: 'MPV', transmission: 'Manual',
    fuelType: 'CNG', sittingCapacity: 7, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    description: 'The Maruti Ertiga is the perfect family MPV offering 7-seater comfort with excellent fuel efficiency. Ideal for family outings and group travel.',
    features: ['7 Seater', 'Air Conditioning', 'Power Windows', 'CNG Kit', 'Rear AC Vents', 'USB Charging'],
    locations: ['Solapur Station', 'Vijapur Road'],
  },
  {
    type: 'car', brand: 'Hyundai', model: 'Venue', year: 2023,
    pricePerDay: 2000, category: 'SUV', transmission: 'Automatic',
    fuelType: 'Petrol', sittingCapacity: 5, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    description: 'The Hyundai Venue is a compact SUV with a bold stance and smart features. Available in automatic transmission for effortless city driving.',
    features: ['Automatic Transmission', 'Sunroof', 'Touchscreen Infotainment', 'Reverse Camera', 'ABS + EBD', 'Cruise Control'],
    locations: ['Solapur Station', 'Hotgi Road', 'Akkalkot Road'],
  },
  {
    type: 'car', brand: 'Hyundai', model: 'Aura', year: 2022,
    pricePerDay: 1800, category: 'Sedan', transmission: 'Manual',
    fuelType: 'CNG', sittingCapacity: 5, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    description: 'The Hyundai Aura is a stylish sedan with a spacious cabin and best-in-class boot space. CNG powered for economical long drives.',
    features: ['Air Conditioning', 'Power Windows', 'CNG Kit', 'Touchscreen', 'Rear Defogger', 'Driver Airbag'],
    locations: ['Hotgi Road', 'Vijapur Road'],
  },
  {
    type: 'car', brand: 'Tata', model: 'Punch', year: 2023,
    pricePerDay: 1700, category: 'SUV', transmission: 'Manual',
    fuelType: 'CNG', sittingCapacity: 5, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    description: 'The Tata Punch is a micro SUV with rugged looks and high ground clearance. Great for both city roads and rough terrain.',
    features: ['High Ground Clearance', 'Touchscreen', 'Reverse Camera', 'CNG Kit', 'Auto Headlamps', 'Hill Assist'],
    locations: ['Solapur Station', 'Akkalkot Road'],
  },
  {
    type: 'car', brand: 'Kia', model: 'Seltos', year: 2023,
    pricePerDay: 2800, category: 'SUV', transmission: 'Automatic',
    fuelType: 'Petrol', sittingCapacity: 5, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
    description: 'The Kia Seltos is a premium SUV with a powerful engine and a feature-rich interior. The top choice for those who want style and performance.',
    features: ['Panoramic Sunroof', 'Bose Sound System', 'Ventilated Seats', 'Automatic Transmission', 'Wireless Charging', '360° Camera'],
    locations: ['Solapur Station', 'Hotgi Road', 'Vijapur Road', 'Akkalkot Road'],
  },
  // ── BIKES ──
  {
    type: 'bike', brand: 'Honda', model: 'Activa 6G', year: 2023,
    category: 'Scooter', transmission: 'Automatic',
    fuelType: 'Petrol', sittingCapacity: 2, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    description: 'The Honda Activa 6G is the most trusted scooter in India. Perfect for quick city errands, easy to ride with automatic transmission and excellent fuel economy.',
    features: ['Auto Headlamp On', 'Mobile Charging Port', 'External Fuel Lid', 'Combi Brake System', 'Silent Start', 'LED DRL'],
    locations: ['Solapur Station', 'Hotgi Road', 'Vijapur Road', 'Akkalkot Road'],
    bikeSlots: { price3hr: 150, price6hr: 200, price12hr: 400 },
  },
  {
    type: 'bike', brand: 'TVS', model: 'Jupiter', year: 2023,
    category: 'Scooter', transmission: 'Automatic',
    fuelType: 'Petrol', sittingCapacity: 2, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
    description: 'The TVS Jupiter is a premium scooter packed with convenience features. Known for its smooth ride quality and spacious under-seat storage.',
    features: ['Body Balance Technology', 'USB Charging', 'Econometer', 'External Fuel Lid', 'Park Assist', 'LED Tail Lamp'],
    locations: ['Solapur Station', 'Akkalkot Road'],
    bikeSlots: { price3hr: 150, price6hr: 200, price12hr: 400 },
  },
  {
    type: 'bike', brand: 'Royal Enfield', model: 'Classic 350', year: 2022,
    category: 'Cruiser', transmission: 'Manual',
    fuelType: 'Petrol', sittingCapacity: 2, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80',
    description: 'The Royal Enfield Classic 350 is an iconic cruiser motorcycle offering a vintage feel with modern reliability. Perfect for leisure rides around Solapur.',
    features: ['Tripper Navigation', 'Dual Channel ABS', 'LED Headlamp', 'USB Charging', 'Halogen Tail Lamp', 'Classic Design'],
    locations: ['Solapur Station', 'Hotgi Road'],
    bikeSlots: { price3hr: 150, price6hr: 200, price12hr: 400 },
  },
  {
    type: 'bike', brand: 'Bajaj', model: 'Pulsar 150', year: 2023,
    category: 'Sports', transmission: 'Manual',
    fuelType: 'Petrol', sittingCapacity: 2, isAvailable: false,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
    description: 'The Bajaj Pulsar 150 is a sporty commuter bike with aggressive styling and punchy performance. Great for riders who want a bit more thrill.',
    features: ['Twin Spark Technology', 'DTS-i Engine', 'Digital Console', 'Split Seat', 'Alloy Wheels', 'Disc Brake'],
    locations: ['Vijapur Road', 'Akkalkot Road'],
    bikeSlots: { price3hr: 150, price6hr: 200, price12hr: 400 },
  },
  {
    type: 'bike', brand: 'Honda', model: 'CB Shine', year: 2023,
    category: 'Commuter', transmission: 'Manual',
    fuelType: 'Petrol', sittingCapacity: 2, isAvailable: true,
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=800&q=80',
    description: 'The Honda CB Shine is a reliable and fuel-efficient commuter bike. Ideal for daily use with its proven engine and comfortable ergonomics.',
    features: ['Honda Eco Technology', 'CBS Braking', 'Digital-Analogue Meter', 'Long Seat', 'Tubeless Tyres', 'Engine Start Stop'],
    locations: ['Hotgi Road', 'Vijapur Road', 'Akkalkot Road'],
    bikeSlots: { price3hr: 150, price6hr: 200, price12hr: 400 },
  },
]

async function seed() {
  try {
    await connectDB()
    console.log('🔌 Connected to MongoDB...')

    await Vehicle.deleteMany({})
    console.log('🗑️  Cleared existing vehicles...')

    const inserted = await Vehicle.insertMany(vehicles)
    console.log(`✅ Seeded ${inserted.length} vehicles successfully!`)

    inserted.forEach(v => {
      console.log(`   → ${v.type.toUpperCase()}: ${v.brand} ${v.model} (${v._id})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seed()
