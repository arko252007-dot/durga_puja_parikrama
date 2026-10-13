# 🪔 Durga Puja Parikrama — Immersive 3D Experience

An authentic, culturally grounded, interactive 3D web experience of a traditional Kolkata Durga Puja Pandal and Mela ground built using **Three.js** and **Vite**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-r186-orange.svg)
![Vite](https://img.shields.io/badge/Vite-v8-yellow.svg)

---

## 🌟 Key Highlights

- **Bishnupur Terracotta Pandal Architecture:**
  - Layered facade with intricate terracotta relief tiles, floral medallions, cornices, and stepped archways.
  - Curved traditional *Bangla*-style roof with ornamental golden *kalash* and *shikhara* finials.
  - Grand entrance archway leading through a physical 3D tunnel into the interior hall.
- **Interior Nave & Sanctum:**
  - Majestic colonnade with fluted terracotta pillars, golden column bases, and coffered timber ceiling.
  - Suspended brass tiered chandeliers casting warm illumination along the central aisle.
  - Elevated 3-tier sandstone altar platform housing the sacred divine tableau.
- **Complete 10-Armed Maa Durga Pratima Tableau:**
  - Sculpted 3D *pratima* of Maa Durga wielding all 10 divine *astras* (*Trishula*, *Khadga*, *Chakra*, *Teer*, *Dhanush*, *Gada*, *Nagpasha*, *Shankha*, *Kheta*, *Padma*).
  - Fierce golden lion *vahana* attacking Mahishasura, who emerges from the decapitated water buffalo.
  - Full divine family (*Soparibara*): Lord Ganesha, Devi Lakshmi, Devi Saraswati, and Lord Kartikeya with their respective *vahanas*.
  - Semi-circular traditional *Chalchitra* backdrop with Shiva medallion and painted panel disks.
- **Bustling Mela Ground (120m × 120m):**
  - **Food Stalls:** Kolkata Kathi Roll & Cha, Bengali Mishti Bhandar, Fuchka Stall.
  - **Craft & Shopping Stalls:** Bengal Handicrafts & Dokra, Shakha Pola Bangles, Traditional Wooden Toys.
  - **Promenade Stalls:** Garam Chai & Telebhaja, Balloon Shooting Gallery.
  - Strolling crowd visitors in festive attire (*kurtas* and *sarees*), balloon vendors holding colorful floating balloon clusters, and overhead crisscrossing festoon lighting.
- **3D Spatial Audio Soundscape (Web Audio API):**
  - 4-point outdoor loudspeaker network broadcasting authentic Bengali Puja music (Asha Bhosle & Mita Chatterjee).
  - Staggered Bengali hawker vendor calls localized in 3D around food and shopping lanes.
  - Dynamic acoustic low-pass filtering: muffled acoustics and heightened crowd murmur when entering inside the pandal.
  - **Mobile Lifecycle Protection:** Automatically silences and suspends `AudioContext` when the phone browser is backgrounded, app-switched, or the screen is locked; resumes seamlessly upon returning to foreground.
- **Controls & Cross-Platform Usability:**
  - **Desktop:** First-person WASD exploration with smooth, un-inverted mouse-look, pointer lock, and collision detection.
  - **Mobile / Tablet:** Responsive virtual joystick for 360° walking and touch swipe-look.
  - **Mandatory Landscape Lock:** Fullscreen portrait blocking overlay ensures proper panoramic field of view on mobile devices.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/arko252007-dot/durga_puja_parikrama.git

# Navigate into the project folder
cd durga_puja_parikrama

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173/` (and across your local network for testing on mobile devices).

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎮 Controls

### Desktop
| Input | Action |
|---|---|
| `W`, `A`, `S`, `D` | Move Forward / Left / Backward / Right |
| `Mouse` | Look around (Yaw & Pitch) |
| `Click Canvas` | Enter first-person mode (Pointer Lock) |
| `Escape` | Release mouse cursor |
| `R` | Reset position to default spawn point |

### Mobile / Tablet
| Input | Action |
|---|---|
| `Virtual Joystick (Bottom-Left)` | Move in any direction |
| `Swipe (Right Screen)` | Rotate camera view |
| `Orientation` | Landscape orientation required (rotate device horizontally) |

---

## 📂 Project Architecture

```
durga-puja-world/
├── public/
│   ├── assets/
│   │   └── audio/              # Spatial soundscape audio assets (MP3)
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── createRenderer.js   # WebGLRenderer with ACES tone mapping & shadow setup
│   │   └── createScene.js      # Scene graph initialization
│   ├── audio/
│   │   └── SpatialAudioManager.js # 3D HRTF audio, loudspeaker bus, mobile lifecycle handlers
│   ├── controls/
│   │   └── FirstPersonController.js # WASD movement & mouse-look controls with AABB collisions
│   ├── crowd/
│   │   ├── CrowdManager.js     # Animated crowd simulation
│   │   ├── CrowdMaterials.js   # Traditional clothing materials
│   │   └── VisitorCharacter.js # Procedural 3D character models
│   ├── idol/
│   │   ├── DurgaFigure.js      # 10-armed Maa Durga sculptural model & weapons
│   │   ├── DurgaTableau.js     # Sacred altar tableau & Chalchitra backdrop
│   │   ├── IdolMaterials.js    # Shola, terracotta, clay & gold leaf shaders
│   │   ├── LionAndAsura.js     # Lion vahana & Mahishasura combat models
│   │   └── SupportingDeities.js# Ganesha, Lakshmi, Saraswati, Kartikeya models
│   ├── lighting/
│   │   └── LightingSetup.js    # Twilight ambient, moonlight, facade & sanctum lighting
│   ├── mela/
│   │   ├── MelaGround.js       # Ground layout, festoon lights & balloon sellers
│   │   ├── MelaStalls.js       # Food, craft & shopping stall models with Bengali signboards
│   │   └── MelaTextures.js     # Procedural banner and stall canopy textures
│   ├── mobile/
│   │   ├── isMobile.js         # Mobile device capability detection
│   │   ├── mobile.css          # Virtual joystick & orientation overlay styling
│   │   ├── MobileControlsManager.js # Mobile input coordinator
│   │   ├── OrientationLock.js  # Mandatory landscape orientation enforcer
│   │   ├── TouchLookController.js # Right-hand touch swipe camera rotation
│   │   └── VirtualJoystick.js  # Analog touch joystick
│   ├── styles/
│   │   └── main.css            # Minimalist full-viewport layout & loading screen CSS
│   ├── world/
│   │   ├── Exterior.js         # Bishnupur terracotta pandal exterior architecture
│   │   ├── ExteriorTextures.js # Procedural terracotta relief tile textures
│   │   ├── FestivalSky.js      # Procedural autumn twilight sky dome
│   │   ├── Ground.js           # Mela ground geometry and brick apron
│   │   ├── Interior.js         # Pandal interior colonnade, ceiling beams & chandeliers
│   │   └── ReferenceObject.js  # Spatial reference guides
│   └── main.js                 # Application lifecycle orchestrator
├── tests/                      # Automated browser QA & telemetry verification suites
├── index.html                  # Minimal HTML shell
├── package.json
└── vite.config.js              # Production chunking and dev server configuration
```

---

## 📜 License

This project is licensed under the MIT License.
