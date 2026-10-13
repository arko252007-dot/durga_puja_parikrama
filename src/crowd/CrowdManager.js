import * as THREE from 'three';
import { createCrowdMaterials } from './CrowdMaterials.js';
import { VisitorCharacter } from './VisitorCharacter.js';

/**
 * Crowd Waypoint Paths across the 4 key zones:
 * Zone A: Outside the pandal (plaza approach at Z = 14 to Z = 2)
 * Zone B: Entrance gateway & tunnel (Z = 0 to Z = -13, Y = 0.65m)
 * Zone C: Interior hall side aisles (Left nave X = -6.5 to -2.0; Right nave X = +2.0 to +6.5; Z = -15 to -32)
 * Zone D: Darshan viewing zone (Standing respectfully at Z = -32 to -34, clear of central sightline)
 */

// Route definitions: Array of 3D waypoints [x, y, z, waitTimeAtWaypointSeconds]
const CROWD_ROUTES = [
  // Route 1: Exterior right approach -> Entrance -> Right interior nave -> Darshan right -> Exit right
  [
    { x: 3.5, y: 0.0, z: 12.0, wait: 0 },
    { x: 2.2, y: 0.0, z: 5.0, wait: 0 },
    { x: 1.8, y: 0.65, z: -2.0, wait: 0 },
    { x: 1.8, y: 0.65, z: -8.0, wait: 0 },
    { x: 2.4, y: 0.65, z: -16.0, wait: 0 },
    { x: 3.0, y: 0.65, z: -24.0, wait: 1.5 },
    { x: 2.5, y: 0.65, z: -32.5, wait: 6.0 }, // Pauses to do Darshan
    { x: 3.8, y: 0.65, z: -30.0, wait: 0 },
    { x: 4.5, y: 0.65, z: -20.0, wait: 0 },
    { x: 2.4, y: 0.65, z: -10.0, wait: 0 },
    { x: 2.0, y: 0.65, z: 0.0, wait: 0 },
    { x: 3.8, y: 0.0, z: 8.0, wait: 0 },
  ],

  // Route 2: Exterior left approach -> Entrance -> Left interior nave -> Darshan left -> Exit left
  [
    { x: -3.2, y: 0.0, z: 13.0, wait: 0 },
    { x: -2.0, y: 0.0, z: 4.0, wait: 0 },
    { x: -1.8, y: 0.65, z: -2.0, wait: 0 },
    { x: -1.8, y: 0.65, z: -8.0, wait: 0 },
    { x: -2.5, y: 0.65, z: -16.0, wait: 0 },
    { x: -3.2, y: 0.65, z: -25.0, wait: 1.5 },
    { x: -2.5, y: 0.65, z: -32.5, wait: 7.0 }, // Pauses to do Darshan
    { x: -4.0, y: 0.65, z: -29.0, wait: 0 },
    { x: -4.8, y: 0.65, z: -19.0, wait: 0 },
    { x: -2.4, y: 0.65, z: -10.0, wait: 0 },
    { x: -2.0, y: 0.65, z: 0.0, wait: 0 },
    { x: -3.5, y: 0.0, z: 9.0, wait: 0 },
  ],

  // Route 3: Central aisle pilgrim entry (moves along right-hand side of alpona runner)
  [
    { x: 1.2, y: 0.0, z: 14.0, wait: 0 },
    { x: 1.2, y: 0.65, z: 1.0, wait: 0 },
    { x: 1.2, y: 0.65, z: -7.0, wait: 0 },
    { x: 1.4, y: 0.65, z: -15.0, wait: 0 },
    { x: 1.5, y: 0.65, z: -23.0, wait: 0 },
    { x: 1.6, y: 0.65, z: -32.0, wait: 8.0 }, // Central-right Darshan view
    { x: 2.8, y: 0.65, z: -27.0, wait: 2.0 },
    { x: 2.4, y: 0.65, z: -15.0, wait: 0 },
    { x: 1.6, y: 0.65, z: -3.0, wait: 0 },
    { x: 1.5, y: 0.0, z: 7.0, wait: 0 },
  ],

  // Route 4: Central aisle pilgrim entry (moves along left-hand side of alpona runner)
  [
    { x: -1.2, y: 0.0, z: 15.0, wait: 0 },
    { x: -1.2, y: 0.65, z: 1.0, wait: 0 },
    { x: -1.2, y: 0.65, z: -7.0, wait: 0 },
    { x: -1.4, y: 0.65, z: -15.0, wait: 0 },
    { x: -1.5, y: 0.65, z: -23.0, wait: 0 },
    { x: -1.6, y: 0.65, z: -32.0, wait: 7.5 }, // Central-left Darshan view
    { x: -2.8, y: 0.65, z: -27.0, wait: 2.0 },
    { x: -2.4, y: 0.65, z: -15.0, wait: 0 },
    { x: -1.6, y: 0.65, z: -3.0, wait: 0 },
    { x: -1.5, y: 0.0, z: 7.0, wait: 0 },
  ],

  // Route 5: Exterior Plaza Promenade (people waiting outside, admiring Bishnupur facade)
  [
    { x: -8.0, y: 0.0, z: 10.0, wait: 3.0 },
    { x: -5.0, y: 0.0, z: 7.0, wait: 2.0 },
    { x: -2.0, y: 0.0, z: 8.5, wait: 1.0 },
    { x: 2.0, y: 0.0, z: 8.5, wait: 1.0 },
    { x: 6.0, y: 0.0, z: 7.0, wait: 3.0 },
    { x: 8.0, y: 0.0, z: 11.0, wait: 2.0 },
    { x: 3.0, y: 0.0, z: 12.0, wait: 0 },
    { x: -3.0, y: 0.0, z: 12.0, wait: 0 },
  ],

  // Route 6: Interior Side Wing Exhibition (viewing terracotta relief panels along wall bays)
  [
    { x: 6.8, y: 0.65, z: -16.0, wait: 3.0 },
    { x: 7.2, y: 0.65, z: -22.0, wait: 4.0 },
    { x: 6.8, y: 0.65, z: -28.0, wait: 4.0 },
    { x: 5.0, y: 0.65, z: -32.0, wait: 6.0 }, // Far right Darshan
    { x: 6.0, y: 0.65, z: -26.0, wait: 2.0 },
    { x: 6.5, y: 0.65, z: -18.0, wait: 0 },
  ],

  // Route 7: Interior Left Side Wing Exhibition
  [
    { x: -6.8, y: 0.65, z: -16.0, wait: 3.0 },
    { x: -7.2, y: 0.65, z: -22.0, wait: 4.0 },
    { x: -6.8, y: 0.65, z: -28.0, wait: 4.0 },
    { x: -6.0, y: 0.65, z: -26.0, wait: 2.0 },
    { x: -6.5, y: 0.65, z: -18.0, wait: 0 },
  ],

  // Route 8: Mela Food Stall Promenade (browsing rolls, mishti, fuchka on left lane)
  [
    { x: -9.5, y: 0.0, z: 16.0, wait: 2.0 },
    { x: -10.5, y: 0.0, z: 20.0, wait: 4.0 }, // Browsing Kathi Roll counter
    { x: -10.8, y: 0.0, z: 26.0, wait: 4.5 }, // Browsing Bengali Mishti stall
    { x: -9.8, y: 0.0, z: 32.0, wait: 5.0 },  // Waiting for Fuchka
    { x: -6.0, y: 0.0, z: 34.0, wait: 1.0 },
    { x: -3.0, y: 0.0, z: 28.0, wait: 0 },
    { x: -4.0, y: 0.0, z: 18.0, wait: 0 },
  ],

  // Route 9: Mela Shopping & Craft Lane (browsing jewellery, dokra, toys on right lane)
  [
    { x: 9.5, y: 0.0, z: 16.0, wait: 2.0 },
    { x: 10.5, y: 0.0, z: 20.0, wait: 4.0 }, // Browsing Bengal Handicrafts
    { x: 10.8, y: 0.0, z: 26.0, wait: 5.0 }, // Browsing Shakha Pola bangles
    { x: 9.8, y: 0.0, z: 32.0, wait: 4.0 },  // Looking at mela toys
    { x: 6.0, y: 0.0, z: 34.0, wait: 1.0 },
    { x: 3.0, y: 0.0, z: 28.0, wait: 0 },
    { x: 4.0, y: 0.0, z: 18.0, wait: 0 },
  ],

  // Route 10: Rear Mela Promenade (Chai stall & Balloon game)
  [
    { x: -4.5, y: 0.0, z: 35.0, wait: 6.0 }, // Sipping hot bharer chai
    { x: 0.0, y: 0.0, z: 36.0, wait: 1.0 },
    { x: 4.5, y: 0.0, z: 35.0, wait: 5.0 },  // Playing balloon shoot game
    { x: 2.0, y: 0.0, z: 32.0, wait: 0 },
    { x: -2.0, y: 0.0, z: 32.0, wait: 0 },
  ],
];

// Dedicated Static / Standing Visitors (in conversation or devotional contemplation)
const STATIC_VISITORS = [
  // Plaza Exterior groups (talking, enjoying festival evening)
  { x: -6.5, y: 0.0, z: 6.5, rotY: 0.8, style: 1, action: 'chat' },
  { x: -6.0, y: 0.0, z: 7.0, rotY: -2.3, style: 3, action: 'chat' },
  { x: 5.5, y: 0.0, z: 6.0, rotY: -1.2, style: 0, action: 'stand' },
  { x: 6.2, y: 0.0, z: 5.6, rotY: 1.8, style: 2, action: 'stand' },
  { x: -4.0, y: 0.0, z: 10.5, rotY: 0.1, style: 3, action: 'lookUp' },

  // Mela Stalls Vendors & Customers
  { x: -11.5, y: 0.0, z: 18.2, rotY: Math.PI / 2, style: 1, action: 'vendor' }, // Roll stall vendor
  { x: -9.8, y: 0.0, z: 18.2, rotY: -Math.PI / 2, style: 3, action: 'customer' }, // Customer ordering roll
  { x: -11.8, y: 0.0, z: 24.8, rotY: Math.PI / 2, style: 0, action: 'vendor' }, // Mishti seller
  { x: -9.8, y: 0.0, z: 24.8, rotY: -Math.PI / 2, style: 2, action: 'customer' }, // Customer packing sweets
  { x: 11.5, y: 0.0, z: 18.2, rotY: -Math.PI / 2, style: 1, action: 'vendor' }, // Dokra artisan
  { x: 11.8, y: 0.0, z: 24.8, rotY: -Math.PI / 2, style: 0, action: 'vendor' }, // Bangle seller
  { x: 9.8, y: 0.0, z: 24.8, rotY: Math.PI / 2, style: 0, action: 'customer' }, // Woman trying bangles
  { x: -4.5, y: 0.0, z: 16.8, rotY: 0.5, style: 1, action: 'balloonBuyer' }, // Customer near balloon vendor

  // Interior Side Aisles (respectful contemplation beside columns)
  { x: -5.8, y: 0.65, z: -21.0, rotY: 0.4, style: 0, action: 'darshan' },
  { x: 5.8, y: 0.65, z: -21.0, rotY: -0.4, style: 1, action: 'darshan' },
  { x: -5.6, y: 0.65, z: -27.0, rotY: 0.25, style: 2, action: 'darshan' },
  { x: 5.6, y: 0.65, z: -27.0, rotY: -0.25, style: 3, action: 'darshan' },

  // Darshan Area Flanks (standing devotees with folded hands, safely clear of central aisle)
  { x: -3.2, y: 0.65, z: -33.2, rotY: 0.15, style: 0, action: 'pranam' },
  { x: 3.2, y: 0.65, z: -33.2, rotY: -0.15, style: 1, action: 'pranam' },
  { x: -1.8, y: 0.65, z: -33.8, rotY: 0.08, style: 2, action: 'pranam' },
  { x: 1.8, y: 0.65, z: -33.8, rotY: -0.08, style: 3, action: 'pranam' },
];

export function createCrowd(scene) {
  const group = new THREE.Group();
  group.name = 'PandalCrowd';

  const disposables = [];
  function registerGeom(geo) {
    disposables.push(geo);
    return geo;
  }

  // 1. Initialize procedural crowd materials
  const crowdMats = createCrowdMaterials();
  disposables.push({ dispose: crowdMats.dispose });

  // 2. Active Moving Agents (~36 visitors distributed across mela and pandal paths)
  const movingAgents = [];
  const TOTAL_MOVING = 36;

  for (let i = 0; i < TOTAL_MOVING; i++) {
    const routeIndex = i % CROWD_ROUTES.length;
    const route = CROWD_ROUTES[routeIndex];
    const styleIndex = (i * 3 + routeIndex) % 4;

    const character = new VisitorCharacter(crowdMats, registerGeom, styleIndex, i + 42);
    group.add(character.root);

    // Initial position along route based on fraction i / TOTAL_MOVING
    const startProgress = ((i + 0.3) / TOTAL_MOVING) * (route.length - 1);
    const startIndex = Math.floor(startProgress);
    const startFrac = startProgress - startIndex;

    const pA = route[startIndex];
    const pB = route[Math.min(startIndex + 1, route.length - 1)];

    const initPos = new THREE.Vector3(
      THREE.MathUtils.lerp(pA.x, pB.x, startFrac),
      THREE.MathUtils.lerp(pA.y, pB.y, startFrac),
      THREE.MathUtils.lerp(pA.z, pB.z, startFrac)
    );

    character.root.position.copy(initPos);

    movingAgents.push({
      character,
      route,
      currentIndex: startIndex,
      targetIndex: (startIndex + 1) % route.length,
      currentPos: initPos.clone(),
      waitTimeRemaining: 0,
      speed: character.walkSpeed,
      currentVelocity: 0,
    });
  }

  // 3. Static / Contemplating Visitors (13 figures)
  const staticAgents = [];
  STATIC_VISITORS.forEach((cfg, idx) => {
    const character = new VisitorCharacter(crowdMats, registerGeom, cfg.style, idx + 200);
    character.root.position.set(cfg.x, cfg.y, cfg.z);
    character.root.rotation.y = cfg.rotY;
    group.add(character.root);
    staticAgents.push(character);
  });

  scene.add(group);

  /**
   * Updates crowd positions, obstacle steering, and skeletal/limb articulation.
   * @param {number} delta Seconds since last frame
   */
  function update(delta) {
    // Limit max delta to prevent physics jumps on lag spikes
    const dt = Math.min(delta, 0.1);

    movingAgents.forEach((agent) => {
      const { character, route } = agent;

      if (agent.waitTimeRemaining > 0) {
        // Agent is pausing at waypoint (e.g. admiring Maa Durga or chatting)
        agent.waitTimeRemaining -= dt;
        agent.currentVelocity = THREE.MathUtils.lerp(agent.currentVelocity, 0, dt * 6.0);
        character.updateAnimation(dt, agent.currentVelocity);
        return;
      }

      const targetWP = route[agent.targetIndex];
      const targetVec = new THREE.Vector3(targetWP.x, targetWP.y, targetWP.z);
      const toTarget = targetVec.clone().sub(agent.currentPos);
      const dist = toTarget.length();

      if (dist < 0.35) {
        // Reached waypoint: advance to next
        agent.currentIndex = agent.targetIndex;
        agent.targetIndex = (agent.targetIndex + 1) % route.length;
        agent.waitTimeRemaining = targetWP.wait || 0;
        return;
      }

      // Smooth steering & acceleration
      agent.currentVelocity = THREE.MathUtils.lerp(agent.currentVelocity, agent.speed, dt * 3.5);
      const moveStep = agent.currentVelocity * dt;

      toTarget.normalize();
      agent.currentPos.addScaledVector(toTarget, Math.min(moveStep, dist));
      character.root.position.copy(agent.currentPos);

      // Smooth turning towards movement direction
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);
      let diff = targetAngle - character.root.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      character.root.rotation.y += diff * Math.min(dt * 5.0, 1.0);

      // Update character walking animation
      character.updateAnimation(dt, agent.currentVelocity);
    });

    // Update static visitors (breathing, subtle looking around, prayers)
    staticAgents.forEach((char) => {
      char.updateAnimation(dt, 0);
    });
  }

  return {
    group,
    update,
    movingCount: movingAgents.length,
    staticCount: staticAgents.length,
    totalCount: movingAgents.length + staticAgents.length,
    dispose: () => {
      scene.remove(group);
      disposables.forEach((d) => d.dispose && d.dispose());
    },
  };
}
