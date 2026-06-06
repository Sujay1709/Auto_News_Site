// Car records sourced from Wikipedia, with live Wikimedia Commons lead images.
// Image URLs are re-resolved via the Wikipedia REST API summary endpoint so they
// stay valid (the older hard-coded thumbnail paths 404'd after Commons renames).
// 3D model URLs reuse the shared community glTF samples used elsewhere in the app.
const GLB_SEDAN = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb";
const GLB_TRUCK = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb";
const GLB_SPORTS = "https://modelviewer.dev/shared-assets/models/Ferrari.glb";

export const CARS_DATA = [
  {
    id: "toyota-camry",
    make: "Toyota",
    model: "Camry",
    year: "2024",
    price: "$26,420",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/1280px-2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "428 Liters",
      headlights: "LED Projector",
      autonomousTech: "Toyota Safety Sense 2.5+",
      autonomous: {
        level: "Level 2",
        capabilities: "Toyota Safety Sense fuses a forward camera and millimeter-wave radar for adaptive cruise, lane tracing, and pre-collision braking."
      },
      performance: {
        zeroToSixty: "7.5 sec",
        hp: "203 hp",
        topSpeed: "135 mph"
      }
    },
    paragraphs: [
      "The Toyota Camry is the benchmark midsize sedan, the default choice for millions thanks to its blend of bulletproof reliability, low running costs, and genuinely comfortable road manners. The TNGA-K platform gives it a surprisingly composed chassis for a mainstream commuter.",
      "Inside, the cabin prioritizes ergonomics over flash. A clean dashboard, a responsive touchscreen, and the standard Toyota Safety Sense suite make it an easy car to live with every day, while generous rear legroom keeps families happy.",
      "Power comes from a 2.5-liter four-cylinder producing 203 horsepower routed through an 8-speed automatic. It is not fast, but it is efficient and tireless, returning up to 39 mpg on the highway while sprinting to 60 mph in a respectable 7.5 seconds."
    ]
  },
  {
    id: "honda-accord",
    make: "Honda",
    model: "Accord Touring",
    year: "2024",
    price: "$38,890",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg/1280px-2023_Honda_Accord_LX%2C_front_left%2C_07-13-2023.jpg",
    model3d: GLB_SEDAN,
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
  },
  {
    id: "bmw-3-series",
    make: "BMW",
    model: "3 Series",
    year: "2024",
    price: "$43,700",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BMW_G20_%282022%29_IMG_7316_%282%29.jpg/1280px-BMW_G20_%282022%29_IMG_7316_%282%29.jpg",
    model3d: GLB_SEDAN,
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
    id: "mercedes-benz-c-class",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: "2024",
    price: "$46,750",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mercedes-Benz_W206_IMG_6380.jpg/1280px-Mercedes-Benz_W206_IMG_6380.jpg",
    model3d: GLB_SEDAN,
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
    id: "hyundai-sonata",
    make: "Hyundai",
    model: "Sonata",
    year: "2024",
    price: "$26,800",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/2024_Hyundai_Sonata_SEL%2C_front_right.jpg/1280px-2024_Hyundai_Sonata_SEL%2C_front_right.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "453 Liters",
      headlights: "Seamless Horizon LED",
      autonomousTech: "Hyundai SmartSense",
      autonomous: {
        level: "Level 2",
        capabilities: "Highway Driving Assist combines radar cruise and lane centering, with Remote Smart Parking Assist for hands-off maneuvering."
      },
      performance: {
        zeroToSixty: "8.0 sec",
        hp: "191 hp",
        topSpeed: "130 mph"
      }
    },
    paragraphs: [
      "The Hyundai Sonata reinvents the value sedan with genuinely striking design. The 2024 refresh adds a full-width 'Seamless Horizon' light bar that gives it a futuristic face few rivals can match at this price point.",
      "Inside, a pair of 12.3-inch curved displays dominate the dashboard, paired with soft-touch materials and clever storage. It feels a class above its modest sticker price, with limousine-grade rear legroom.",
      "A 2.5-liter four-cylinder delivers 191 horsepower through an 8-speed automatic, prioritizing smoothness and 38 mpg highway efficiency over outright pace, reaching 60 mph in around 8.0 seconds."
    ]
  },
  {
    id: "kia-k5",
    make: "Kia",
    model: "K5",
    year: "2024",
    price: "$27,900",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg/1280px-2022_Kia_K5_GT-Line_in_Pacific_Blue%2C_Front_Left%2C_09-05-2022.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "456 Liters",
      headlights: "LED with Heartbeat DRL",
      autonomousTech: "Kia Drive Wise",
      autonomous: {
        level: "Level 2",
        capabilities: "Highway Driving Assist and Lane Following Assist provide centered, speed-matched cruising on mapped highways."
      },
      performance: {
        zeroToSixty: "7.8 sec",
        hp: "191 hp",
        topSpeed: "128 mph"
      }
    },
    paragraphs: [
      "The Kia K5 is the sport-styled sibling to the Sonata, trading conservative elegance for an aggressive, coupe-like silhouette and the signature 'heartbeat' LED running lights that streak into the grille.",
      "The driver-focused cabin wraps a wide infotainment display toward the driver, and the available GT-Line trim adds sport seats and red contrast stitching for a genuinely upscale ambiance.",
      "The base 1.6-liter turbo and available 2.5-liter four-cylinder make up to 191 horsepower, blending eager around-town response with a composed, well-damped highway ride and 39 mpg efficiency."
    ]
  },
  {
    id: "nissan-altima",
    make: "Nissan",
    model: "Altima",
    year: "2024",
    price: "$26,300",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg/1280px-2024_Nissan_Altima_SR%2C_front_left%2C_05-05-2025.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "436 Liters",
      headlights: "LED Projector",
      autonomousTech: "ProPILOT Assist",
      autonomous: {
        level: "Level 2",
        capabilities: "Safety Shield 360 plus ProPILOT Assist deliver single-lane highway driving with adaptive cruise and steering support."
      },
      performance: {
        zeroToSixty: "8.0 sec",
        hp: "188 hp",
        topSpeed: "125 mph"
      }
    },
    paragraphs: [
      "The Nissan Altima carved out its niche by offering available all-wheel drive in a segment dominated by front-drive rivals, making it a practical year-round choice in colder climates.",
      "Zero Gravity front seats, designed with NASA-inspired posture research, make the Altima one of the most fatigue-resistant long-distance cruisers in the class, wrapped in a roomy, quiet cabin.",
      "The standard 2.5-liter four-cylinder produces 188 horsepower paired to a refined CVT, focusing on smooth, efficient progress and up to 39 mpg rather than outright acceleration."
    ]
  },
  {
    id: "audi-a4",
    make: "Audi",
    model: "A4",
    year: "2024",
    price: "$43,500",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg/1280px-Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "460 Liters",
      headlights: "Matrix LED",
      autonomousTech: "Audi pre sense",
      autonomous: {
        level: "Level 2",
        capabilities: "Adaptive Cruise Assist bundles radar cruise, active lane guidance, and pre sense collision mitigation into one smooth system."
      },
      performance: {
        zeroToSixty: "5.6 sec",
        hp: "261 hp",
        topSpeed: "150 mph"
      }
    },
    paragraphs: [
      "The Audi A4 is the understated intellectual of the compact luxury class, prizing material precision and quiet competence over flash. Its tailored sheet metal hides a deeply engineered quattro chassis.",
      "The cabin remains a benchmark for fit and finish, with the crisp Virtual Cockpit digital instrument display and tightly damped switchgear that feels milled from solid metal.",
      "The 2.0-liter turbocharged four makes up to 261 horsepower routed through a quick 7-speed dual-clutch and standard quattro all-wheel drive, delivering an effortless, surefooted 5.6-second sprint to 60 mph."
    ]
  },
  {
    id: "lexus-es",
    make: "Lexus",
    model: "ES",
    year: "2024",
    price: "$43,100",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg/1280px-Lexus_ES_350_%28GSZ10%29_IMG_4332.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "479 Liters",
      headlights: "Triple-Beam LED",
      autonomousTech: "Lexus Safety System+ 2.5",
      autonomous: {
        level: "Level 2",
        capabilities: "Bundles Dynamic Radar Cruise Control, Lane Tracing Assist, and predictive pre-collision braking with pedestrian detection."
      },
      performance: {
        zeroToSixty: "8.1 sec",
        hp: "203 hp",
        topSpeed: "131 mph"
      }
    },
    paragraphs: [
      "The Lexus ES is the quiet luxury alternative, offering near-flagship serenity and legendary Toyota dependability without the price or pretension of the German rivals it undercuts.",
      "Its cabin is a sanctuary of hushed isolation, with deeply padded seats, real wood and metal trim, and one of the best Mark Levinson audio systems available at any price.",
      "Available as a smooth 2.5-liter hybrid or a 203-horsepower four-cylinder, the ES is tuned for refinement and efficiency, gliding to 60 mph in a relaxed 8.1 seconds while returning up to 44 mpg in hybrid form."
    ]
  },
  {
    id: "genesis-g70",
    make: "Genesis",
    model: "G70",
    year: "2024",
    price: "$42,950",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/2022_Genesis_G70_2.0T_Prestige%2C_front_left%2C_09-09-2023.jpg/1280px-2022_Genesis_G70_2.0T_Prestige%2C_front_left%2C_09-09-2023.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "297 Liters",
      headlights: "Quad-Lens LED",
      autonomousTech: "Highway Driving Assist",
      autonomous: {
        level: "Level 2",
        capabilities: "Highway Driving Assist with Smart Cruise Control and Lane Following Assist provides centered, adaptive highway cruising."
      },
      performance: {
        zeroToSixty: "5.1 sec",
        hp: "300 hp",
        topSpeed: "149 mph"
      }
    },
    paragraphs: [
      "The Genesis G70 is the enthusiast's pick in the entry-luxury sport sedan class, a compact rear-driver engineered to chase the BMW 3 Series and largely succeeding on driving feel alone.",
      "Inside, twin-stitched quilted leather, knurled metal controls, and the brand's signature two-spoke steering wheel create a cabin that punches well above its price, backed by a generous warranty.",
      "The available 2.5-liter turbocharged four produces 300 horsepower through an 8-speed automatic and available all-wheel drive, firing the G70 to 60 mph in a genuinely quick 5.1 seconds."
    ]
  },
  {
    id: "toyota-rav4",
    make: "Toyota",
    model: "RAV4 Prime",
    year: "2024",
    price: "$43,690",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg/1280px-Toyota_RAV4_XLE_%28facelift%29_%28front%29.jpg",
    model3d: GLB_TRUCK,
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
    id: "ford-explorer",
    make: "Ford",
    model: "Explorer",
    year: "2024",
    price: "$36,860",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg/1280px-Ford_Explorer_%28sixth_generation%29_IMG_6063.jpg",
    model3d: GLB_TRUCK,
    specs: {
      passengers: 7,
      doors: 4,
      bootSpace: "515 Liters",
      headlights: "LED",
      autonomousTech: "Ford Co-Pilot360",
      autonomous: {
        level: "Level 2",
        capabilities: "Available BlueCruise enables true hands-free driving on pre-mapped highways, monitored by an infrared driver-facing camera."
      },
      performance: {
        zeroToSixty: "6.8 sec",
        hp: "300 hp",
        topSpeed: "130 mph"
      }
    },
    paragraphs: [
      "The Ford Explorer pioneered the modern three-row SUV and remains a family staple, blending genuine towing capability with carlike on-road manners thanks to its rear-biased platform.",
      "Three rows seat up to seven, and the second-row captain's chairs and fold-flat third row make it endlessly configurable for school runs, road trips, and hauling cargo alike.",
      "The standard 2.3-liter EcoBoost turbo four punches out 300 horsepower through a 10-speed automatic, towing up to 5,300 pounds while still reaching 60 mph in a brisk 6.8 seconds."
    ]
  },
  {
    id: "tesla-model-x",
    make: "Tesla",
    model: "Model X",
    year: "2024",
    price: "$89,990",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2017_Tesla_Model_X_100D_Front.jpg/1280px-2017_Tesla_Model_X_100D_Front.jpg",
    model3d: GLB_TRUCK,
    specs: {
      passengers: 7,
      doors: 4,
      bootSpace: "2500 Liters",
      headlights: "Matrix LED",
      autonomousTech: "Autopilot / FSD",
      autonomous: {
        level: "Level 2/3",
        capabilities: "Full Self-Driving (Supervised) uses pure-vision neural nets to navigate complex urban environments and highways."
      },
      performance: {
        zeroToSixty: "3.5 sec",
        hp: "670 hp",
        topSpeed: "163 mph"
      }
    },
    paragraphs: [
      "The Tesla Model X is the dramatic flagship SUV, instantly recognizable for its rear Falcon Wing doors that articulate upward and outward to grant easy access to all three rows even in tight parking spots.",
      "Combined cargo volume approaches 2,500 liters thanks to a deep front trunk and folding rear seats, while the panoramic windshield gives the cabin an airy, spaceship-like ambiance dominated by a single central display.",
      "The dual-motor powertrain delivers 670 horsepower of instant electric torque, launching this 2.5-ton SUV to 60 mph in just 3.5 seconds while offering up to 348 miles of EPA-rated range."
    ]
  },
  {
    id: "porsche-cayenne",
    make: "Porsche",
    model: "Cayenne",
    year: "2024",
    price: "$77,800",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Porsche_Cayenne_%28III%2C_Facelift%29_%E2%80%93_f_01012025.jpg/1280px-Porsche_Cayenne_%28III%2C_Facelift%29_%E2%80%93_f_01012025.jpg",
    model3d: GLB_TRUCK,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "772 Liters",
      headlights: "Matrix LED (PDLS Plus)",
      autonomousTech: "Porsche InnoDrive",
      autonomous: {
        level: "Level 2",
        capabilities: "InnoDrive reads navigation, road, and traffic data to proactively adjust speed for corners and limits, with active lane keeping."
      },
      performance: {
        zeroToSixty: "6.0 sec",
        hp: "335 hp",
        topSpeed: "152 mph"
      }
    },
    paragraphs: [
      "The Porsche Cayenne proved a sports-car company could build an SUV without diluting its DNA. The 2024 facelift sharpens the styling and brings a fully redesigned, driver-centric digital cockpit.",
      "It remains the dynamic benchmark of the luxury SUV class, with adaptive air suspension and rear-axle steering that shrink its footprint through corners while preserving a plush, long-distance ride.",
      "The base 3.0-liter turbocharged V6 makes 335 horsepower through an 8-speed Tiptronic, delivering a refined yet urgent 6.0-second run to 60 mph that belies the Cayenne's substantial size."
    ]
  },
  {
    id: "porsche-911-carrera",
    make: "Porsche",
    model: "911 Carrera",
    year: "2024",
    price: "$122,400",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg/1280px-Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg",
    model3d: GLB_SPORTS,
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
    id: "chevrolet-corvette-c8",
    make: "Chevrolet",
    model: "Corvette C8",
    year: "2024",
    price: "$67,495",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg/1280px-Chevrolet_Corvette_C8_IAA_2021_1X7A0156.jpg",
    model3d: GLB_SPORTS,
    specs: {
      passengers: 2,
      doors: 2,
      bootSpace: "357 Liters",
      headlights: "LED Projector",
      autonomousTech: "Chevy Safety Assist",
      autonomous: {
        level: "Level 1",
        capabilities: "Focuses on driver-aid safety with forward collision alert and automatic emergency braking rather than self-steering."
      },
      performance: {
        zeroToSixty: "2.9 sec",
        hp: "495 hp",
        topSpeed: "194 mph"
      }
    },
    paragraphs: [
      "The Chevrolet Corvette C8 rewrote the rulebook by moving its engine behind the driver, transforming America's sports car into a genuine mid-engine exotic at a fraction of the price of its European rivals.",
      "Despite supercar proportions, the C8 keeps two trunks: a rear bay big enough for golf clubs and a front frunk, giving 357 liters of combined storage and surprising everyday usability.",
      "The 6.2-liter LT2 V8 sits inches behind your shoulders, producing 495 horsepower in Z51 trim and launching the Corvette to 60 mph in a savage 2.9 seconds with the lightning-fast 8-speed dual-clutch."
    ]
  },
  {
    id: "ferrari-296-gtb",
    make: "Ferrari",
    model: "296 GTB",
    year: "2024",
    price: "$334,778",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/2022_Ferrari_296_%28cropped%29.jpg/1280px-2022_Ferrari_296_%28cropped%29.jpg",
    model3d: GLB_SPORTS,
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
    id: "ford-mustang-dark-horse",
    make: "Ford",
    model: "Mustang Dark Horse",
    year: "2024",
    price: "$59,270",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/2024_Ford_Mustang_GT_Premium_convertible%2C_front_left%2C_09-28-2024.jpg/1280px-2024_Ford_Mustang_GT_Premium_convertible%2C_front_left%2C_09-28-2024.jpg",
    model3d: GLB_SPORTS,
    specs: {
      passengers: 4,
      doors: 2,
      bootSpace: "382 Liters",
      headlights: "Tri-Bar LED",
      autonomousTech: "Ford Co-Pilot360",
      autonomous: {
        level: "Level 1",
        capabilities: "Driver-assist suite with adaptive cruise, blind-spot monitoring, and pre-collision braking; tuned to keep the driver in command."
      },
      performance: {
        zeroToSixty: "3.7 sec",
        hp: "500 hp",
        topSpeed: "168 mph"
      }
    },
    paragraphs: [
      "The Ford Mustang Dark Horse is the most track-focused factory Mustang ever, a sharpened seventh-generation pony car that channels old-school V8 muscle through thoroughly modern chassis tuning.",
      "It keeps usable 2+2 seating and a 382-liter trunk, proving you can take it to the track on the weekend and still run errands during the week without compromise.",
      "Its naturally aspirated 5.0-liter Coyote V8 is dialed up to 500 horsepower, and with the available six-speed manual or 10-speed automatic it charges to 60 mph in around 3.7 seconds with a spine-tingling soundtrack."
    ]
  },
  {
    id: "tesla-model-3",
    make: "Tesla",
    model: "Model 3",
    year: "2024",
    price: "$38,990",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/1280px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "682 Liters",
      headlights: "Adaptive LED",
      autonomousTech: "Autopilot",
      autonomous: {
        level: "Level 2",
        capabilities: "Vision-based Autopilot delivers traffic-aware cruise and Autosteer, with Full Self-Driving (Supervised) available as an upgrade."
      },
      performance: {
        zeroToSixty: "5.8 sec",
        hp: "271 hp",
        topSpeed: "140 mph"
      }
    },
    paragraphs: [
      "The Tesla Model 3 is the car that brought electric driving to the mainstream, pairing a minimalist, screen-centric interior with class-leading efficiency and access to the Supercharger network.",
      "The 2024 'Highland' refresh quieted the cabin, improved ride comfort, and added ventilated seats and a rear passenger display, sharpening its appeal as a premium daily driver.",
      "The single-motor rear-drive version makes 271 horsepower and slips to 60 mph in 5.8 seconds, while the frunk and deep trunk combine for a remarkably practical 682 liters of cargo space."
    ]
  },
  {
    id: "tesla-model-s-plaid",
    make: "Tesla",
    model: "Model S Plaid",
    year: "2024",
    price: "$89,990",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tesla_Model_S_%28Facelift_ab_04-2016%29_%28cropped%29.jpg/1280px-Tesla_Model_S_%28Facelift_ab_04-2016%29_%28cropped%29.jpg",
    model3d: GLB_SEDAN,
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
    id: "lucid-air-pure",
    make: "Lucid",
    model: "Air Pure",
    year: "2024",
    price: "$77,400",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/2022_Lucid_Air_Grand_Touring_in_Zenith_Red%2C_front_left.jpg/1280px-2022_Lucid_Air_Grand_Touring_in_Zenith_Red%2C_front_left.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "627 Liters",
      headlights: "Micro-Lens Array LED",
      autonomousTech: "DreamDrive",
      autonomous: {
        level: "Level 2",
        capabilities: "DreamDrive uses 32 sensors including a driver-monitoring camera and surround radar for highway assist and automated parking."
      },
      performance: {
        zeroToSixty: "4.5 sec",
        hp: "430 hp",
        topSpeed: "140 mph"
      }
    },
    paragraphs: [
      "The Lucid Air Pure is the most efficient electric luxury sedan on sale, the work of ex-Tesla engineers who packaged a compact, miniaturized powertrain to free up extraordinary interior space.",
      "Its glass-canopy cabin feels airy and futuristic, with a curved 34-inch 5K display floating above a lower control screen, and a deep frunk that swallows luggage like a second trunk.",
      "Even in single-motor Pure form, 430 horsepower delivers a 4.5-second run to 60 mph, while best-in-class aerodynamics yield well over 400 miles of range from a relatively small battery."
    ]
  },
  {
    id: "rivian-r1t",
    make: "Rivian",
    model: "R1T",
    year: "2024",
    price: "$73,000",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/2022_Rivian_R1T_%28in_Glacier_White%29%2C_front_6.21.22.jpg/1280px-2022_Rivian_R1T_%28in_Glacier_White%29%2C_front_6.21.22.jpg",
    model3d: GLB_TRUCK,
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
    id: "hyundai-ioniq-6",
    make: "Hyundai",
    model: "Ioniq 6",
    year: "2024",
    price: "$42,650",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2023_Hyundai_Ioniq_6_Limited%2C_front_4.27.23.jpg/1280px-2023_Hyundai_Ioniq_6_Limited%2C_front_4.27.23.jpg",
    model3d: GLB_SEDAN,
    specs: {
      passengers: 5,
      doors: 4,
      bootSpace: "401 Liters",
      headlights: "Parametric Pixel LED",
      autonomousTech: "Hyundai SmartSense (HDA 2)",
      autonomous: {
        level: "Level 2",
        capabilities: "Highway Driving Assist 2 adds automated lane changes and curve handling to centered, adaptive highway cruising."
      },
      performance: {
        zeroToSixty: "7.4 sec",
        hp: "225 hp",
        topSpeed: "115 mph"
      }
    },
    paragraphs: [
      "The Hyundai Ioniq 6 is a streamliner-inspired electric sedan whose teardrop silhouette delivers one of the lowest drag coefficients of any production car, translating directly into exceptional range.",
      "Pixelated 'Parametric' lighting front and rear, a dual 12.3-inch display setup, and a flat-floor cabin with sustainable materials make it feel like a concept car you can actually buy.",
      "Built on Hyundai's 800-volt E-GMP platform, the single-motor version makes 225 horsepower for a 7.4-second sprint to 60 mph, and supports ultra-fast charging from 10 to 80 percent in around 18 minutes."
    ]
  },
  {
    id: "bmw-i7",
    make: "BMW",
    model: "i7 xDrive60",
    year: "2024",
    price: "$105,700",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/BMW_7-Series_%28G70%29_750e_IMG_9358.jpg/1280px-BMW_7-Series_%28G70%29_750e_IMG_9358.jpg",
    model3d: GLB_SEDAN,
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
  }
];
