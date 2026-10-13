import * as THREE from 'three';

/**
 * SpatialAudioManager
 * 
 * Implements a high-fidelity 3D spatial soundscape for the Durga Puja world:
 * - Single THREE.AudioListener attached to camera for natural head-turning orientation.
 * - Outdoor Loudspeaker Network: Broadcasts Bengali Puja songs from 4 horn speaker locations.
 * - Songs Start at 00:59 (59.0s): Skips directly to the iconic chorus of Asha Bhosle and Mita Chatterjee tracks.
 * - Synchronized Bengali Vendor Audio: Starts at the exact same instant as the main music,
 *   with amplified gain (+14dB boost) and wide promenade spatial reach so calls are loud and crystal clear.
 * - Continuous Indoor/Outdoor Acoustic Treatment:
 *   - Walking into pandal smoothly muffles exterior music via BiquadFilter (20kHz -> 800Hz) and attenuates volume.
 *   - Walking back outside smoothly restores full treble clarity and loudness.
 * - Spatial Crowd Audio: Multiple distributed 3D murmur sources inside the pandal and along mela stall lanes.
 * - Robust First-Interaction Audio Unlock: Guarantees AudioContext resume on any click/touch/keypress.
 * - Clean teardown & memory management on dispose.
 */

export class SpatialAudioManager {
  /**
   * @param {THREE.Camera} camera
   * @param {THREE.Scene} scene
   * @param {HTMLElement} domElement
   */
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;

    this.isUnlocked = false;
    this.disposed = false;
    this.currentTrackIndex = 0;
    this.activeMusicSources = [];
    this.activeVendorSources = [];

    // Timing parameters:
    // Music starts at exactly 00:59 (59 seconds) as requested
    this.MUSIC_SKIP_SECONDS = 59.0;
    // Vendor calls start at 28.0s (peak active Bengali hawking shouts)
    this.VENDOR_SKIP_SECONDS = 28.0;

    // Acoustic parameters
    this.indoorFactor = 0.0; // 0.0 = outdoor, 1.0 = deep inside pandal
    this.wasSuspendedByBackground = false;

    // 1. Initialize Three.js AudioListener
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.audioContext = this.listener.context;

    // 2. Music Playlist (Supplied Bengali Puja Songs)
    const baseUrl = (import.meta.env && import.meta.env.BASE_URL) || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    this.playlist = [
      {
        title: 'Aar Koto Raat Eka Thakbo — Asha Bhosle',
        url: `${cleanBase}assets/audio/aar_koto_raat.mp3`,
        buffer: null,
      },
      {
        title: 'Gold Printer Sari Pore — Mita Chatterjee',
        url: `${cleanBase}assets/audio/gold_printer_sari.mp3`,
        buffer: null,
      },
    ];

    // 3. Vendor Audio Track (Supplied Bengali Vendors Calling Sound)
    this.vendorData = {
      title: '3 Bengali Vendors Calling Sound',
      url: `${cleanBase}assets/audio/vendor_calls.mp3`,
      buffer: null,
    };

    // 4. Master Buses & Acoustic Filter
    this.exteriorMuffleFilter = this.audioContext.createBiquadFilter();
    this.exteriorMuffleFilter.type = 'lowpass';
    this.exteriorMuffleFilter.frequency.setValueAtTime(20000, this.audioContext.currentTime);
    this.exteriorMuffleFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    this.exteriorMasterGain = this.audioContext.createGain();
    this.exteriorMasterGain.gain.setValueAtTime(1.0, this.audioContext.currentTime);

    // Route filter -> master gain -> destination
    this.exteriorMuffleFilter.connect(this.exteriorMasterGain);
    this.exteriorMasterGain.connect(this.audioContext.destination);

    // 5. Loudspeaker Network Rig (4 physical 3D speaker locations)
    this.speakerPositions = [
      { name: 'Toran Entrance Arch', pos: new THREE.Vector3(0, 6.2, 38.0) },
      { name: 'Pandal Facade Left Tower', pos: new THREE.Vector3(-7.5, 8.5, 0.0) },
      { name: 'Pandal Facade Right Tower', pos: new THREE.Vector3(7.5, 8.5, 0.0) },
      { name: 'Mela Promenade Central Pole', pos: new THREE.Vector3(0, 7.0, 18.0) },
    ];
    this.speakerNodes = [];

    // 6. Vendor Stall Positions (Mela Ground)
    this.stallPositions = [
      { name: 'Fuchka Stall', pos: new THREE.Vector3(-13.0, 1.5, 10.0) },
      { name: 'Kathi Roll Stall', pos: new THREE.Vector3(-13.0, 1.5, 18.0) },
      { name: 'Mishti Bhandar', pos: new THREE.Vector3(-13.0, 1.5, 26.0) },
      { name: 'Garam Chai Stall', pos: new THREE.Vector3(-13.0, 1.5, 34.0) },
      { name: 'Bengal Handicrafts', pos: new THREE.Vector3(13.0, 1.5, 18.0) },
      { name: 'Shakha Pola Bangles', pos: new THREE.Vector3(13.0, 1.5, 26.0) },
    ];
    this.vendorNodes = [];

    // 7. Crowd Chatter Nodes (Interior & Outdoor)
    this.crowdSources = [];

    // Setup physical models & spatial sound nodes
    this.setupLoudspeakers();
    this.setupVendorNodes();
    this.setupCrowdSoundscape();

    // Bind interaction unlock & mobile lifecycle stop events
    this.bindUnlockEvents();
    this.bindPageLifecycleEvents();

    // Preload all audio buffers in parallel
    this.loadingPromise = this.loadAllAudioBuffers();
  }

  /**
   * Sets up 3D spatial panner nodes for outdoor loudspeakers.
   * Pure spatial audio nodes without floating visual meshes.
   */
  setupLoudspeakers() {
    this.speakerPositions.forEach((sp) => {

      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 14.0;
      panner.maxDistance = 85.0;
      panner.rolloffFactor = 0.95;

      panner.positionX.setValueAtTime(sp.pos.x, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(sp.pos.y, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(sp.pos.z, this.audioContext.currentTime);

      const spGain = this.audioContext.createGain();
      spGain.gain.setValueAtTime(0.85, this.audioContext.currentTime);

      spGain.connect(panner);
      panner.connect(this.exteriorMuffleFilter);

      this.speakerNodes.push({
        name: sp.name,
        pos: sp.pos,
        inputGain: spGain,
        panner: panner,
      });
    });
  }

  /**
   * Sets up 3D spatial panner nodes for vendor calls in the mela ground.
   * Uses 3 distinct spatial zones (Left Food Stalls, Right Shopping Stalls, Rear Promenade Stalls)
   * with a single clean source to completely eliminate echo and phase delays.
   */
  setupVendorNodes() {
    this.vendorMasterGain = this.audioContext.createGain();
    this.vendorMasterGain.gain.setValueAtTime(2.2, this.audioContext.currentTime);
    this.vendorMasterGain.connect(this.exteriorMuffleFilter);

    this.stallPositions = [
      { name: 'Food Stalls Lane (Left)', pos: new THREE.Vector3(-13.0, 1.8, 24.0) },
      { name: 'Shopping Stalls Lane (Right)', pos: new THREE.Vector3(13.0, 1.8, 24.0) },
      { name: 'Rear Promenade Stalls', pos: new THREE.Vector3(0.0, 1.8, 38.0) },
    ];
    this.vendorNodes = [];

    this.stallPositions.forEach((stall) => {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 9.0;
      panner.maxDistance = 50.0;
      panner.rolloffFactor = 0.6; // Gentle natural falloff across mela

      panner.positionX.setValueAtTime(stall.pos.x, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(stall.pos.y, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(stall.pos.z, this.audioContext.currentTime);

      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(1.0, this.audioContext.currentTime);

      gain.connect(panner);
      panner.connect(this.vendorMasterGain);

      this.vendorNodes.push({
        name: stall.name,
        pos: stall.pos,
        gainNode: gain,
        panner: panner,
      });
    });
  }

  /**
   * Sets up 3D spatial crowd murmur nodes (interior and mela).
   */
  setupCrowdSoundscape() {
    this.crowdBusGain = this.audioContext.createGain();
    this.crowdBusGain.gain.setValueAtTime(0.75, this.audioContext.currentTime);
    this.crowdBusGain.connect(this.audioContext.destination);

    const crowdPositions = [
      { name: 'Interior Nave Left', pos: new THREE.Vector3(-4.5, 1.4, -20.0), isInterior: true },
      { name: 'Interior Nave Right', pos: new THREE.Vector3(4.5, 1.4, -20.0), isInterior: true },
      { name: 'Darshan Barricade Crowd', pos: new THREE.Vector3(0.0, 1.4, -32.5), isInterior: true },
      { name: 'Mela Food Stalls Lane', pos: new THREE.Vector3(-10.0, 1.4, 20.0), isInterior: false },
      { name: 'Mela Craft Stalls Lane', pos: new THREE.Vector3(10.0, 1.4, 20.0), isInterior: false },
      { name: 'Entrance Plaza Queue', pos: new THREE.Vector3(0.0, 1.4, 6.0), isInterior: false },
    ];

    const murmurBuffer = this.createCrowdMurmurBuffer();

    crowdPositions.forEach((cp, idx) => {
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 4.0;
      panner.maxDistance = 30.0;
      panner.rolloffFactor = 1.25;

      panner.positionX.setValueAtTime(cp.pos.x, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(cp.pos.y, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(cp.pos.z, this.audioContext.currentTime);

      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(cp.isInterior ? 0.35 : 0.45, this.audioContext.currentTime);

      gain.connect(panner);
      panner.connect(this.crowdBusGain);

      const source = this.audioContext.createBufferSource();
      source.buffer = murmurBuffer;
      source.loop = true;
      source.playbackRate.setValueAtTime(0.92 + (idx * 0.03), this.audioContext.currentTime);
      source.connect(gain);

      this.crowdSources.push({
        name: cp.name,
        pos: cp.pos,
        isInterior: cp.isInterior,
        gainNode: gain,
        source: source,
        started: false,
      });
    });
  }

  createCrowdMurmurBuffer() {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 6.0;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, frameCount, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < frameCount; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;

        const t = i / sampleRate;
        const mod1 = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.45 * t + (channel * 1.2));
        const mod2 = 0.7 + 0.3 * Math.sin(2 * Math.PI * 1.15 * t + channel);
        data[i] = pink * mod1 * mod2 * 0.4;
      }
    }
    return buffer;
  }

  /**
   * Preloads all audio buffers in parallel.
   */
  async loadAllAudioBuffers() {
    const loadTrack = async (item) => {
      try {
        const res = await fetch(item.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ab = await res.arrayBuffer();
        item.buffer = await this.audioContext.decodeAudioData(ab);
        console.log(`[Audio] Loaded track: "${item.title}" (${item.buffer.duration.toFixed(1)}s)`);
      } catch (err) {
        console.warn(`[Audio] Could not load track ${item.title}:`, err.message);
      }
    };

    const loadVendor = async () => {
      try {
        const res = await fetch(this.vendorData.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ab = await res.arrayBuffer();
        this.vendorData.buffer = await this.audioContext.decodeAudioData(ab);
        console.log(`[Audio] Loaded vendor calls: "${this.vendorData.title}" (${this.vendorData.buffer.duration.toFixed(1)}s)`);
      } catch (err) {
        console.warn('[Audio] Could not load vendor audio:', err.message);
      }
    };

    await Promise.all([
      ...this.playlist.map(t => loadTrack(t)),
      loadVendor()
    ]);

    // If user has already clicked/unlocked while loading was in flight, start both immediately in sync
    if (this.isUnlocked && !this.disposed) {
      this.startAllSounds();
    }
  }

  bindUnlockEvents() {
    const events = ['click', 'pointerdown', 'keydown', 'touchstart'];
    this.unlockHandler = () => {
      if (!document.hidden && !this.wasSuspendedByBackground) {
        this.unlockAudio();
      }
    };

    events.forEach((ev) => {
      window.addEventListener(ev, this.unlockHandler, { passive: true });
      document.addEventListener(ev, this.unlockHandler, { passive: true });
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement && !document.hidden) {
        this.unlockAudio();
      }
    });
  }

  /**
   * Listens to mobile & browser page lifecycle events to guarantee sound stops
   * immediately whenever the user quits the browser, switches apps, locks their screen,
   * or closes/backgrounds the tab.
   */
  bindPageLifecycleEvents() {
    this.onVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        this.pauseBackgroundAudio();
      } else if (document.visibilityState === 'visible') {
        this.resumeForegroundAudio();
      }
    };

    this.onPageHide = (event) => {
      this.pauseBackgroundAudio();
      if (!event.persisted) {
        this.stopMusic();
        this.stopVendorCalls();
      }
    };

    this.onFreeze = () => {
      this.pauseBackgroundAudio();
    };

    this.onUnload = () => {
      this.dispose();
    };

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('freeze', this.onFreeze);
    window.addEventListener('beforeunload', this.onUnload);
    window.addEventListener('unload', this.onUnload);
  }

  /**
   * Immediately silences and halts all audio processing when the mobile browser
   * is closed, quitted, minimized, locked, or backgrounded.
   */
  pauseBackgroundAudio() {
    if (this.disposed || !this.audioContext) return;
    this.wasSuspendedByBackground = true;

    // Zero all output master gains immediately to prevent any audio driver buffer bleed or pops
    try {
      const now = this.audioContext.currentTime;
      if (this.exteriorMasterGain && this.exteriorMasterGain.gain) {
        this.exteriorMasterGain.gain.cancelScheduledValues(0);
        this.exteriorMasterGain.gain.setValueAtTime(0.0, now);
        this.exteriorMasterGain.gain.value = 0.0;
      }
      if (this.vendorMasterGain && this.vendorMasterGain.gain) {
        this.vendorMasterGain.gain.cancelScheduledValues(0);
        this.vendorMasterGain.gain.setValueAtTime(0.0, now);
        this.vendorMasterGain.gain.value = 0.0;
      }
      if (this.crowdBusGain && this.crowdBusGain.gain) {
        this.crowdBusGain.gain.cancelScheduledValues(0);
        this.crowdBusGain.gain.setValueAtTime(0.0, now);
        this.crowdBusGain.gain.value = 0.0;
      }
    } catch (e) {}

    // Suspend AudioContext to halt hardware audio processing on mobile
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend().then(() => {
        console.log('[Audio] AudioContext suspended: phone browser quitted/backgrounded');
      }).catch((err) => {
        console.warn('[Audio] Failed to suspend AudioContext on background:', err);
      });
    }
  }

  /**
   * Resumes sound playback seamlessly when returning to the foreground tab.
   */
  resumeForegroundAudio() {
    if (this.disposed || !this.audioContext || !this.isUnlocked || !this.wasSuspendedByBackground) return;
    if (document.hidden || document.visibilityState === 'hidden') return;

    this.wasSuspendedByBackground = false;

    // Restore output master gains to active levels
    try {
      const now = this.audioContext.currentTime;
      if (this.exteriorMasterGain && this.exteriorMasterGain.gain) {
        this.exteriorMasterGain.gain.cancelScheduledValues(0);
        this.exteriorMasterGain.gain.setValueAtTime(1.0, now);
        this.exteriorMasterGain.gain.value = 1.0;
      }
      if (this.vendorMasterGain && this.vendorMasterGain.gain) {
        this.vendorMasterGain.gain.cancelScheduledValues(0);
        this.vendorMasterGain.gain.setValueAtTime(2.15, now);
        this.vendorMasterGain.gain.value = 2.15;
      }
      if (this.crowdBusGain && this.crowdBusGain.gain) {
        this.crowdBusGain.gain.cancelScheduledValues(0);
        this.crowdBusGain.gain.setValueAtTime(0.75, now);
        this.crowdBusGain.gain.value = 0.75;
      }
    } catch (e) {}

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('[Audio] AudioContext resumed: foreground active');
      }).catch((err) => {
        console.warn('[Audio] Failed to resume AudioContext on foreground:', err);
      });
    }
  }

  /**
   * Starts all audio sources immediately the exact second the loading screen finishes.
   */
  startSoundscapeOnLoad() {
    if (this.disposed) return;
    this.isUnlocked = true;

    // Start all sounds immediately at the exact current audio timestamp
    this.startAllSounds();

    // If already in the background/hidden, suspend immediately and wait for foreground
    if (document.hidden || document.visibilityState === 'hidden') {
      this.pauseBackgroundAudio();
      return;
    }

    // Attempt to resume the audio context immediately
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('[Audio] AudioContext running immediately on loading screen finish');
      }).catch((err) => {
        console.log('[Audio] Browser awaiting initial gesture for sound output:', err.message);
      });
    }

    // Bind reactive resume triggers across mouse, pointer, touch, keyboard and window focus
    const triggerEvents = ['pointerdown', 'mousedown', 'pointermove', 'mousemove', 'keydown', 'wheel', 'touchstart', 'click', 'focus'];
    const reactiveResume = () => {
      if (document.hidden || this.wasSuspendedByBackground) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('[Audio] AudioContext resumed and playing');
        }).catch(() => {});
      }
    };

    triggerEvents.forEach((ev) => {
      window.addEventListener(ev, reactiveResume, { passive: true });
      document.addEventListener(ev, reactiveResume, { passive: true });
    });

    // Short-interval polling in case browser grants activation via focus/tab switch
    const resumeInterval = setInterval(() => {
      if (this.disposed || this.audioContext.state === 'running') {
        clearInterval(resumeInterval);
      } else {
        if (!document.hidden && !this.wasSuspendedByBackground) {
          this.audioContext.resume().catch(() => {});
        }
      }
    }, 150);
  }

  unlockAudio() {
    if (this.isUnlocked || this.disposed || document.hidden || this.wasSuspendedByBackground) return;
    this.isUnlocked = true;

    const resumeAndStart = () => {
      if (this.disposed || document.hidden || this.wasSuspendedByBackground) return;
      console.log('[Audio] Audio started successfully');
      this.startAllSounds();
    };

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(resumeAndStart).catch((err) => {
        console.log('[Audio] Autoplay waiting for user gesture:', err.message);
      });
    } else {
      resumeAndStart();
    }
  }

  /**
   * Starts both main music and vendor audio at the EXACT SAME INSTANT.
   */
  startAllSounds() {
    if (!this.isUnlocked || this.disposed) return;
    const now = this.audioContext.currentTime;

    // 1. Start crowd murmur loops
    this.crowdSources.forEach((cs) => {
      if (!cs.started) {
        try {
          cs.source.start(now);
          cs.started = true;
        } catch (e) {}
      }
    });

    // 2. Start outdoor loudspeaker music track (starts immediately at now, from 00:59)
    this.playCurrentTrack(now);

    // 3. Start vendor calls at stalls (starts at the exact same instant time 'now')
    this.startVendorCalls(now);
  }

  /**
   * Plays the current track through all 4 outdoor loudspeakers,
   * starting at exactly 00:59 (59.0s) as requested.
   */
  playCurrentTrack(startTime) {
    if (!this.isUnlocked || this.disposed) return;

    this.stopMusic();

    const track = this.playlist[this.currentTrackIndex];
    if (!track || !track.buffer) {
      return;
    }

    const now = startTime || this.audioContext.currentTime;
    const startOffset = Math.min(this.MUSIC_SKIP_SECONDS, Math.max(0, track.buffer.duration - 10));

    console.log(`[Audio] Broadcasting "${track.title}" on loudspeakers from 00:59 (${startOffset}s offset)`);

    this.speakerNodes.forEach((speaker) => {
      const source = this.audioContext.createBufferSource();
      source.buffer = track.buffer;
      source.connect(speaker.inputGain);
      source.start(now, startOffset);
      this.activeMusicSources.push(source);
    });

    if (this.activeMusicSources.length > 0) {
      const primary = this.activeMusicSources[0];
      primary.onended = () => {
        if (this.disposed) return;
        this.activeMusicSources = [];
        setTimeout(() => {
          if (!this.disposed) {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.playCurrentTrack();
          }
        }, 2000);
      };
    }
  }

  /**
   * Starts amplified Bengali vendor calls at stalls simultaneously with music,
   * starting at offset 28.0s (peak active hawking calls).
   * Uses a single clean buffer source running at standard playbackRate = 1.0,
   * completely eliminating any echo, flanging, or multi-tap delay artifacts.
   */
  startVendorCalls(startTime) {
    if (!this.isUnlocked || this.disposed) return;
    if (!this.vendorData.buffer) return;
    if (this.activeVendorSources.length > 0) return;

    const buffer = this.vendorData.buffer;
    const now = startTime || this.audioContext.currentTime;
    const skipOffset = Math.min(this.VENDOR_SKIP_SECONDS, Math.max(0, buffer.duration - 10));

    console.log(`[Audio] Starting clean vendor calls (zero echo, normal pitch, offset ${skipOffset}s)`);

    // A single clean buffer source running at standard playbackRate = 1.0
    // Eliminates all phase flanging, multiple-tap delay, and chorus echo artifacts
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = skipOffset;
    source.loopEnd = buffer.duration;
    source.playbackRate.setValueAtTime(1.0, now);

    // Connect this single source to all vendor stall zone inputs
    this.vendorNodes.forEach((stallNode) => {
      source.connect(stallNode.gainNode);
    });

    source.start(now, skipOffset);
    this.activeVendorSources.push(source);
  }

  stopMusic() {
    this.activeMusicSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.activeMusicSources = [];
  }

  stopVendorCalls() {
    this.activeVendorSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.activeVendorSources = [];
  }

  /**
   * Per-frame acoustic update:
   * - Computes player indoor/outdoor depth relative to pandal entrance tunnel (Z = 0m to Z = -12m).
   * - Continuously adjusts low-pass filter frequency and volume for exterior loudspeakers.
   * - Balances interior vs exterior crowd chatter and vendor calls.
   * 
   * @param {THREE.Vector3} playerPosition
   */
  update(playerPosition) {
    if (!playerPosition || this.disposed || !this.isUnlocked || this.wasSuspendedByBackground || document.hidden) return;

    const z = playerPosition.z;
    const x = playerPosition.x;

    let targetIndoorFactor = 0.0;
    if (z <= -12.0 && Math.abs(x) <= 9.0) {
      targetIndoorFactor = 1.0;
    } else if (z < 0.0 && z > -12.0 && Math.abs(x) <= 7.0) {
      targetIndoorFactor = (-z) / 12.0;
    } else {
      targetIndoorFactor = 0.0;
    }

    this.indoorFactor += (targetIndoorFactor - this.indoorFactor) * 0.08;
    const currentTime = this.audioContext.currentTime;

    // 1. Exterior Loudspeaker Low-Pass Filter:
    // Outdoor: 20,000 Hz (full treble) -> Indoor: 800 Hz (warm muffled enclosure)
    const targetFreq = 20000 * Math.pow(800 / 20000, this.indoorFactor);
    this.exteriorMuffleFilter.frequency.setTargetAtTime(targetFreq, currentTime, 0.12);

    // 2. Exterior Music Gain:
    // Outdoor: 1.0 -> Indoor: 0.22 (muffled in background)
    const targetMusicGain = 1.0 - (this.indoorFactor * 0.78);
    this.exteriorMasterGain.gain.setTargetAtTime(targetMusicGain, currentTime, 0.12);

    // 3. Proximity to Shop Sections & Vendor Calls Gain:
    // Shop Sections layout:
    // Left Food Stalls: X ~ -13, Z in [16, 33] (Kolkata Kathi Roll, Bengali Mishti, Fuchka)
    // Right Shopping Stalls: X ~ 13, Z in [16, 33] (Handicrafts & Dokra, Shakha Pola, Toys)
    // Rear Promenade Stalls: Z ~ 38, X in [-6, 6] (Garam Chai, Balloon Shoot)
    const clampZLeft = Math.max(16, Math.min(33, z));
    const dLeft = Math.hypot(x - (-13), z - clampZLeft);

    const clampZRight = Math.max(16, Math.min(33, z));
    const dRight = Math.hypot(x - 13, z - clampZRight);

    const clampXRear = Math.max(-6, Math.min(6, x));
    const dRear = Math.hypot(x - clampXRear, z - 38);

    const minShopDist = Math.min(dLeft, dRight, dRear);

    // Closer to shop sections (minShopDist <= 2.5m): volume increases to 2.85 (crisp, vibrant hawker calls)
    // Going out from shop sections (minShopDist >= 14m): volume is a little very little lower (2.15, ~24% lower)
    const tDist = Math.max(0, Math.min(1, (minShopDist - 2.5) / 11.5));
    const smoothT = tDist * tDist * (3 - 2 * tDist);
    const proximityGain = 2.85 - (smoothT * 0.70);

    // Apply indoor muffle factor when entering pandal interior
    if (this.vendorMasterGain) {
      const targetVendorGain = proximityGain * (1.0 - (this.indoorFactor * 0.90));
      this.vendorMasterGain.gain.setTargetAtTime(targetVendorGain, currentTime, 0.12);
    }

    // Directional zone emphasis for pinpoint 3D spatial localization
    if (this.vendorNodes.length >= 3) {
      // Left Food Zone: louder when browsing left food lane
      const leftWeight = Math.max(0.35, Math.min(1.0, 0.7 - (x / 20.0)));
      this.vendorNodes[0].gainNode.gain.setTargetAtTime(leftWeight, currentTime, 0.12);

      // Right Shopping Zone: louder when browsing right shopping lane
      const rightWeight = Math.max(0.35, Math.min(1.0, 0.7 + (x / 20.0)));
      this.vendorNodes[1].gainNode.gain.setTargetAtTime(rightWeight, currentTime, 0.12);

      // Rear Promenade Zone: louder when browsing rear chai/balloon lane
      const rearWeight = Math.max(0.25, Math.min(1.0, (z - 20.0) / 18.0));
      this.vendorNodes[2].gainNode.gain.setTargetAtTime(rearWeight, currentTime, 0.12);
    }

    // 4. Crowd Chatter Balance:
    // Inside pandal: interior chatter elevated (0.75), outdoor chatter drops
    // Outside mela: outdoor chatter near stalls prominent (0.60), interior chatter muted
    this.crowdSources.forEach((cs) => {
      let targetCrowdGain = 0.0;
      if (cs.isInterior) {
        targetCrowdGain = 0.12 + (this.indoorFactor * 0.63);
      } else {
        targetCrowdGain = 0.55 - (this.indoorFactor * 0.45);
      }
      cs.gainNode.gain.setTargetAtTime(targetCrowdGain, currentTime, 0.15);
    });
  }

  dispose() {
    this.disposed = true;
    this.pauseBackgroundAudio();

    if (this.onVisibilityChange) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    if (this.onPageHide) {
      window.removeEventListener('pagehide', this.onPageHide);
    }
    if (this.onFreeze) {
      window.removeEventListener('freeze', this.onFreeze);
    }
    if (this.onUnload) {
      window.removeEventListener('beforeunload', this.onUnload);
      window.removeEventListener('unload', this.onUnload);
    }

    this.stopMusic();
    this.stopVendorCalls();

    this.crowdSources.forEach((cs) => {
      try {
        cs.source.stop();
        cs.source.disconnect();
      } catch (e) {}
    });

    if (this.loudspeakerGroup && this.loudspeakerGroup.parent) {
      this.loudspeakerGroup.parent.remove(this.loudspeakerGroup);
    }

    try {
      this.exteriorMuffleFilter.disconnect();
      this.exteriorMasterGain.disconnect();
      this.vendorMasterGain.disconnect();
      this.crowdBusGain.disconnect();
    } catch (e) {}

    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().catch(() => {});
      }
    } catch (e) {}

    console.log('[Audio] SpatialAudioManager disposed cleanly');
  }
}
