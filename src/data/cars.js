export const CARS_DATA = [
  {
    id: "bmw-3-series",
    make: "BMW",
    model: "3 Series",
    year: "2024",
    price: "$43,700",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/2019_BMW_330i_M_Sport_Step_2.0_Front.jpg/1024px-2019_BMW_330i_M_Sport_Step_2.0_Front.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "480 Liters",
      headlights: "Adaptive LED",
      autonomousTech: "Active Driving Assistant",
      autonomous: {
        level: "Level 2",
        capabilities: "Utilizes a localized neural processor to analyze camera and radar data for lane keeping and collision avoidance."
      },
      performance: {
        zeroToSixty: "5.6 sec",
        hp: "255 hp",
        topSpeed: "155 mph"
      }
    },
    paragraphs: [
      "The benchmark sport sedan for 40 years. Surgical steering, perfectly balanced chassis, and a rev-happy turbo inline-4 that makes every commute feel a little more special. The 2024 refresh added the curved iDrive 8.5 display and refined the M Sport package.",
      "Inside, the BMW Curved Display completely modernizes the cockpit. It seamlessly merges a 10.25-inch instrument cluster with a 10.7-inch central control display behind a single piece of glass, running the highly intuitive iDrive 8 operating system.",
      "The Active Driving Assistant suite utilizes a localized neural processor to analyze camera and radar data. It includes frontal collision warning, active blind spot detection, and lane departure warning to create a 360-degree safety shield."
    ]
  },
  {
    id: "porsche-911-carrera",
    make: "Porsche",
    model: "911 Carrera",
    year: "2024",
    price: "$122,400",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Porsche_992_Carrera_4S_1.jpg/1024px-Porsche_992_Carrera_4S_1.jpg",
    model3d: "https://modelviewer.dev/shared-assets/models/Ferrari.glb",
    specs: {
      passengers: 4,
      doors: 2,
      bootSpace: "132 Liters (Front)",
      headlights: "LED Matrix (PDLS Plus)",
      autonomousTech: "Warn & Brake Assist",
      autonomous: {
        level: "Level 1",
        capabilities: "Camera-assisted warning and brake assist system to significantly reduce the risk of collisions."
      },
      performance: {
        zeroToSixty: "4.0 sec",
        hp: "379 hp",
        topSpeed: "182 mph"
      }
    },
    paragraphs: [
      "The Porsche 911 Carrera is the definitive sports car, evolved over six decades into the precision instrument it is today. The 992 generation features a wider body and a more aggressive stance, optimized for high-speed stability and cooling.",
      "Inside, the 2+2 seating configuration allows for four passengers, though the rear is best reserved for children or additional luggage. The layout is a blend of digital displays and analog heritage, centered around the iconic tachometer.",
      "The 3.0-liter twin-turbo flat-six engine remains the heart of the 911. With 379 horsepower in the base trim, it offers a visceral driving experience and a signature mechanical rasp that is unmistakably Porsche."
    ]
  },
  {
    id: "ferrari-296-gtb",
    make: "Ferrari",
    model: "296 GTB",
    year: "2024",
    price: "$334,778",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Ferrari_296_GTB_in_Monaco.jpg/1024px-Ferrari_296_GTB_in_Monaco.jpg",
    model3d: "https://modelviewer.dev/shared-assets/models/Ferrari.glb",
    specs: {
      passengers: 2,
      doors: 2,
      bootSpace: "201 Liters",
      headlights: "Matrix LED",
      autonomousTech: "ADAS Suite",
      autonomous: {
        level: "Level 1",
        capabilities: "Focuses strictly on performance enhancement, utilizing Side-Slip Control 7.0 for predictable oversteer rather than self-driving."
      },
      performance: {
        zeroToSixty: "2.9 sec",
        hp: "819 hp",
        topSpeed: "205 mph"
      }
    },
    paragraphs: [
      "The Ferrari 296 GTB is a plug-in hybrid V6 supercar that redefines Ferrari for the electric era. Producing 819 hp combined output with a 25 km EV-only range, it boasts the most sublime mid-engine balance the marque has ever produced.",
      "The hybrid V6 fills low-end torque the V8 generation lacked. Side-Slip Control 7.0 manages oversteer with surgical precision. Steering is impossibly direct, making track driving accessible while retaining raw emotion.",
      "The cabin is a strict driver-focused environment with a 16-inch curved HD driver display right behind the steering wheel, completely eliminating traditional analog gauges in favor of a modern digital experience."
    ]
  },
  {
    id: "tesla-model-s-plaid",
    make: "Tesla",
    model: "Model S Plaid",
    year: "2024",
    price: "$89,990",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2021_Tesla_Model_S_Plaid_in_Midnight_Silver_Metallic%2C_front_right.jpg/1024px-2021_Tesla_Model_S_Plaid_in_Midnight_Silver_Metallic%2C_front_right.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "793 Liters",
      headlights: "Matrix LED",
      autonomousTech: "Autopilot",
      autonomous: {
        level: "Level 2/3",
        capabilities: "Full Self-Driving (Supervised) capability utilizes pure-vision neural nets to navigate complex urban environments."
      },
      performance: {
        zeroToSixty: "1.99 sec",
        hp: "1,020 hp",
        topSpeed: "200 mph"
      }
    },
    paragraphs: [
      "The Tesla Model S Plaid is a tri-motor electric sedan with 1,020 hp and the fastest production-car acceleration ever recorded — 1.99 seconds to 60 mph. It wraps physics-defying insanity inside a practical, luxury package.",
      "Its cabin features active noise cancellation, tri-zone climate control, and a 22-speaker audio system. A secondary display is mounted in the rear console, allowing passengers to stream movies or play high-end video games.",
      "The Plaid powertrain utilizes carbon-sleeved rotors to maintain extreme RPMs without expanding, allowing the tri-motor setup to deliver instantaneous torque and a completely seamless pull all the way to 200 mph."
    ]
  },
  {
    id: "mercedes-benz-c-class",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: "2024",
    price: "$46,750",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Mercedes-Benz_W206_1003250.jpg/1024px-Mercedes-Benz_W206_1003250.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "455 Liters",
      headlights: "Digital Light",
      autonomousTech: "DRIVE PILOT",
      autonomous: {
        level: "Level 2",
        capabilities: "Active Distance Assist DISTRONIC and Active Steering Assist provide semi-autonomous highway cruising."
      },
      performance: {
        zeroToSixty: "6.0 sec",
        hp: "255 hp",
        topSpeed: "155 mph"
      }
    },
    paragraphs: [
      "The C-Class looks and feels like a baby S-Class, inside and out. The W206 generation brings 'Hey Mercedes' voice control, augmented-reality navigation, and a massive portrait infotainment screen straight from the flagship.",
      "The driving experience is plush and refined first, sporty second. The mild-hybrid 48V system fills in low-end torque seamlessly, making city driving incredibly smooth and fuel-efficient.",
      "The Digital Light headlight technology directs light using 1.3 million micro-mirrors, offering unprecedented nighttime visibility while actively masking out oncoming traffic to prevent glare."
    ]
  },
  {
    id: "rivian-r1t",
    make: "Rivian",
    model: "R1T",
    year: "2024",
    price: "$73,000",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Rivian_R1T_at_LA_Auto_Show_2.jpg/1024px-Rivian_R1T_at_LA_Auto_Show_2.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "330L Gear Tunnel",
      headlights: "Stadium LED",
      autonomousTech: "Driver+",
      autonomous: {
        level: "Level 2",
        capabilities: "Utilizes 11 cameras, 5 radars, and 12 sensors to automatically steer and adjust speed on mapped highways."
      },
      performance: {
        zeroToSixty: "3.0 sec",
        hp: "835 hp",
        topSpeed: "115 mph"
      }
    },
    paragraphs: [
      "The Rivian R1T is the world's first electric adventure vehicle. Its design is rugged yet aerodynamic, featuring smooth panels and a distinctive 'stadium' lighting signature that has become iconic on the trails.",
      "Storage is where the R1T truly innovates. Beyond the traditional bed and front trunk, it features a unique 'Gear Tunnel' that runs completely through the center of the truck, offering weatherproof storage for outdoor equipment.",
      "With four electric motors, the R1T produces a staggering 835 horsepower. This quad-motor setup allows for extreme torque vectoring, enabling the truck to crawl over massive rocks or sprint from 0-60 mph in a supercar-rivaling 3.0 seconds."
    ]
  },
  {
    id: "bmw-i7",
    make: "BMW",
    model: "i7 xDrive60",
    year: "2024",
    price: "$105,700",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/BMW_i7_xDrive60_Auto_Zuerich_2022_1M8A5553.jpg/1024px-BMW_i7_xDrive60_Auto_Zuerich_2022_1M8A5553.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "500 Liters",
      headlights: "Crystal LED",
      autonomousTech: "Highway Assistant",
      autonomous: {
        level: "Level 2+",
        capabilities: "Allows for true hands-free driving at speeds up to 85 mph on mapped highways with eye-tracking safety."
      },
      performance: {
        zeroToSixty: "4.5 sec",
        hp: "536 hp",
        topSpeed: "149 mph"
      }
    },
    paragraphs: [
      "The BMW i7 represents the pinnacle of electric luxury, serving as the battery-powered counterpart to the legendary 7 Series. It boasts a monolithic design language that completely reimagines the flagship executive sedan.",
      "The rear passenger compartment is an absolute revolution. It features an optional 31.3-inch 8K Theater Screen that descends from the roof, transforming the back seat into a rolling, high-fidelity cinema.",
      "The dual-motor xDrive60 setup delivers 536 horsepower in absolute silence. It achieves a 0 to 60 mph sprint in just 4.5 seconds, while sophisticated active aerodynamics yield an EPA-estimated range of up to 318 miles."
    ]
  },
  {
    id: "toyota-rav4",
    make: "Toyota",
    model: "RAV4 Prime",
    year: "2024",
    price: "$43,690",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/2019_Toyota_RAV4_Icon_HEV_CVT_2.5_Front.jpg/1024px-2019_Toyota_RAV4_Icon_HEV_CVT_2.5_Front.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "949 Liters",
      headlights: "Bi-LED Projector",
      autonomousTech: "TSS 2.5",
      autonomous: {
        level: "Level 2",
        capabilities: "Toyota Safety Sense integrates radar and camera systems for Dynamic Radar Cruise Control and lane tracing."
      },
      performance: {
        zeroToSixty: "5.7 sec",
        hp: "302 hp",
        topSpeed: "125 mph"
      }
    },
    paragraphs: [
      "The Toyota RAV4 revolutionized the compact SUV segment, and the Prime plug-in hybrid variant represents the pinnacle of its evolution. It combines rugged styling with an aerodynamically optimized underbody.",
      "Cargo space remains highly practical despite the addition of a large battery pack. The motorized rear bootlid provides access to 949 liters of space behind the second row, making it ideal for camping gear.",
      "Motivation comes from a dynamic force 2.5-liter engine paired with powerful electric motors. Delivering a combined 302 horsepower, it sprints from 0 to 60 mph in a blistering 5.7 seconds while offering up to 42 miles of pure electric range."
    ]
  },
  {
    id: "honda-accord",
    make: "Honda",
    model: "Accord Touring",
    year: "2024",
    price: "$38,890",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Honda_Accord_%28CV3%29_EX_L_1.5T_2022_front_quarter.jpg/1024px-Honda_Accord_%28CV3%29_EX_L_1.5T_2022_front_quarter.jpg",
    model3d: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "473 Liters",
      headlights: "LED Reflector",
      autonomousTech: "Honda Sensing",
      autonomous: {
        level: "Level 2",
        capabilities: "Delivers highly accurate Traffic Jam Assist, Adaptive Cruise Control, and Lane Keeping Assist."
      },
      performance: {
        zeroToSixty: "7.3 sec",
        hp: "204 hp",
        topSpeed: "132 mph"
      }
    },
    paragraphs: [
      "The Honda Accord stands as a masterclass in midsize sedan engineering, offering a refined balance of efficiency, comfort, and dynamic handling. The latest generation adopts a sleeker, more sophisticated exterior profile.",
      "Inside the cabin, Honda has deployed its 'Simplicity and Something' design philosophy. The dashboard features a striking honeycomb mesh trim that cleverly conceals the air vents.",
      "Power in the Touring trim is delivered via an advanced two-motor hybrid system. By combining a 2.0-liter Atkinson-cycle 4-cylinder engine with electric propulsion, it generates 204 system horsepower and 247 lb-ft of torque."
    ]
  }
];