/* ==========================================================================
   PALITANA & KOLKATA CONCERT HARMONIUM STUDIO — MASTER ENGINE (script.js)
   Pure Web Audio API Acoustic DSP Reed Synthesizer, 60fps Bellows Fluid
   Physics, Multi-Touch Glissando Matrix, 22-Shruti Tuning, Live Studio
   Recorder & Interactive Raga Academy Tutor.
   ========================================================================== */

'use strict';

(() => {
  /* ========================================================================
     1. PERSISTENT STUDIO CONFIGURATION & STATE
     ======================================================================== */
  const STORAGE_KEY = 'sur_sangam_harmonium_pro_v2';

  const DEFAULT_SETTINGS = {
    tuningSystem: '22shruti',      // '22shruti' | '12tet'
    concertPitch: 440.0,           // 432.0 to 444.0 Hz
    transposeSemitones: 0,         // -4 to +4 semitones (Scale Changer)
    femaleDetuneCents: 3.5,        // 0 to +10 cents Kolkata chorus beating
    reverbRoom: 'room',            // 'dry' | 'room' | 'hall'
    mechNoiseVolume: 60,           // 0 to 100%
    bellowsStiffness: 50,          // 10 to 100%
    airLeakMultiplier: 1.0,        // 0.4x to 2.0x
    micSensitivity: 70,            // 10 to 100%
    tiltNeutralAngle: 0.0,         // Calibrated zero-point angle in degrees
    labelMode: 'both',             // 'both' | 'sargam' | 'western' | 'blank'
    keyZoomPx: 36,                 // 36 = Fit All 37 Keys on Screen (Zero Scroll)
    graphicsMode: 'high'           // 'high' | 'battery'
  };

  let settings = loadSettings();

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // Ignore storage quota errors in restricted webviews
    }
  }

  // Helper to check if CSS auto-rotated the UI because phone is held in Portrait
  function isPortraitRotatedMode() {
    return window.innerHeight > window.innerWidth;
  }

  /* ========================================================================
     2. PURE INDIAN 22-SHRUTI JUST INTONATION RATIOS & SCALE CHANGER NAMES
     ======================================================================== */
  // Pure harmonic ratios relative to Madhya Sa (Index 0 = C)
  const SHRUTI_RATIOS_12 = [
    1.0,          // 0: Sa (Shadja)          - 1/1
    16 / 15,      // 1: Komal Re (Rishabh)   - 16/15
    9 / 8,        // 2: Shuddha Re           - 9/8 (Chatushruti)
    6 / 5,        // 3: Komal Ga (Gandhar)   - 6/5
    5 / 4,        // 4: Shuddha Ga           - 5/4 (Antara Gandhar)
    4 / 3,        // 5: Shuddha Ma (Madhyam) - 4/3
    45 / 32,      // 6: Tivra Ma             - 45/32 (Prati Madhyam)
    3 / 2,        // 7: Pa (Pancham)         - 3/2
    8 / 5,        // 8: Komal Dha (Dhaivat)  - 8/5
    27 / 16,      // 9: Shuddha Dha          - 27/16
    9 / 5,        // 10: Komal Ni (Nishad)   - 9/5 (Kaisiki)
    15 / 8        // 11: Shuddha Ni          - 15/8 (Kakali)
  ];

  const SCALE_CHANGER_NAMES = {
    '-4': 'Kali 4 (G# / Ab)',
    '-3': 'Safed 6 (A)',
    '-2': 'Kali 5 (A# / Bb)',
    '-1': 'Safed 7 (B)',
    '0': 'Safed 1 (C)',
    '1': 'Kali 1 (C# / Db)',
    '2': 'Safed 2 (D)',
    '3': 'Kali 2 (D# / Eb)',
    '4': 'Safed 3 (E)'
  };

  /* ========================================================================
     3. RAGA & ALANKAR ACADEMY DATABASE (5 ALANKARS + 6 CLASSICAL RAGAS)
     ======================================================================== */
  const ACADEMY_LESSONS = {
    alankar1: {
      category: 'BEGINNER ALANKAR EXERCISE 1',
      title: 'Alankar 1: Shuddha Swara Ascent (Bilawal Scale)',
      mood: 'Foundation Finger Independence',
      desc: 'The foundational seven-note scale (Saptak) using all natural (Shuddha) white keys from Madhya Sa (C4) to Taar Sa (C5). Maintain steady bellows pressure around 65% PSI so every swara sings clearly.',
      aroha: 'सा रे ग म प ध नि सां  (C4 D4 E4 F4 G4 A4 B4 C5)',
      avaroha: 'सां नि ध प म ग रे सा  (C5 B4 A4 G4 F4 E4 D4 C4)',
      pakad: 'सा रे ग म प, म ग रे सा',
      vadi: 'All Shuddha Swaras (Bilawal Thaat)',
      allowedMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      sequence: [60, 62, 64, 65, 67, 69, 71, 72, 72, 71, 69, 67, 65, 64, 62, 60]
    },
    alankar2: {
      category: 'BEGINNER ALANKAR EXERCISE 2',
      title: 'Alankar 2: Twin-Swara Double Pulse (Duguun)',
      mood: 'Bellows & Finger Articulation',
      desc: 'Strike each swara twice cleanly to master rapid reed valve articulation without starving the air chamber.',
      aroha: 'सासा रेरे गग मम पप धध निनि सांसां',
      avaroha: 'सांसां निनि धध पप मम गग रेरे सासा',
      pakad: 'सासा गग पप सांसां',
      vadi: 'Rhythmic Twin-Stroke Exercise',
      allowedMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      sequence: [60, 60, 62, 62, 64, 64, 65, 65, 67, 67, 69, 69, 71, 71, 72, 72, 71, 71, 69, 69, 67, 67, 65, 65, 64, 64, 62, 62, 60, 60]
    },
    alankar3: {
      category: 'BEGINNER ALANKAR EXERCISE 3',
      title: 'Alankar 3: Three-Note Pyramid (Tisra Jati Triplets)',
      mood: 'Thumb-Under Crossover Technique',
      desc: 'Step forward three swaras, then step back one. Essential for building fluid hand crossovers across the 3-octave reed bed.',
      aroha: 'सारेग, रेगम, गमप, मपध, पधनि, धनिसां',
      avaroha: 'सांनिध, निधप, धपम, पमग, मगरे, गरेसा',
      pakad: 'सारेग रेगम गमप',
      vadi: 'Triplet Wave Pattern',
      allowedMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      sequence: [
        60, 62, 64,  62, 64, 65,  64, 65, 67,  65, 67, 69,  67, 69, 71,  69, 71, 72,
        72, 71, 69,  71, 69, 67,  69, 67, 65,  67, 65, 64,  65, 64, 62,  64, 62, 60
      ]
    },
    alankar4: {
      category: 'BEGINNER ALANKAR EXERCISE 4',
      title: 'Alankar 4: Four-Note Chatushra Cascade',
      mood: 'Teental 4-Beat Alignment',
      desc: 'Four-note rolling groups that lock naturally into the 16-beat Teental Tabla accompaniment.',
      aroha: 'सारेगम, रेगमप, गमपध, मपधनि, पधनिसां',
      avaroha: 'सांनिधप, निधपम, धपमग, पमगरे, मगरेसा',
      pakad: 'सारेगम पधनिसां',
      vadi: 'Chatushra 4-Beat Phrase',
      allowedMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      sequence: [
        60, 62, 64, 65,  62, 64, 65, 67,  64, 65, 67, 69,  65, 67, 69, 71,  67, 69, 71, 72,
        72, 71, 69, 67,  71, 69, 67, 65,  69, 67, 65, 64,  67, 65, 64, 62,  65, 64, 62, 60
      ]
    },
    alankar5: {
      category: 'BEGINNER ALANKAR EXERCISE 5',
      title: 'Alankar 5: Skipping Thirds (Swara-Antaral Meend)',
      mood: 'Interval Jumps & Ear Training',
      desc: 'Leap across alternate swaras (Sa-Ga, Re-Ma, Ga-Pa) to master harmonium interval spacing.',
      aroha: 'साग, रेम, गप, मध, पनि, धसां',
      avaroha: 'सांध, निप, धम, पग, मरे, गसा',
      pakad: 'साग रेम गप मध',
      vadi: 'Harmonic Thirds Exercise',
      allowedMidis: [60, 62, 64, 65, 67, 69, 71, 72],
      sequence: [
        60, 64,  62, 65,  64, 67,  65, 69,  67, 71,  69, 72,
        72, 69,  71, 67,  69, 65,  67, 64,  65, 62,  64, 60
      ]
    },
    yaman: {
      category: 'CLASSICAL CONCERT RAGA (KALYAN THAAT)',
      title: 'Raga Yaman (Sampurna Evening Raga)',
      mood: 'First Prahar of Night • Serene & Devotional',
      desc: 'One of the grandest ragas of Hindustani classical music. Characterized by Tivra Ma (F#4) while all other swaras are Shuddha. Traditionally begins from Mandra Ni (B3) ascending avoiding Sa and Pa in signature phrases.',
      aroha: 'नि़ रे ग म́ ध नि सां  (B3 D4 E4 F#4 A4 B4 C5)',
      avaroha: 'सां नि ध प म́ ग रे सा  (C5 B4 A4 G4 F#4 E4 D4 C4)',
      pakad: 'नि़ रे ग रे, प म́ ग रे, नि़ रे सा',
      vadi: 'Vadi: Ga (E4) • Samvadi: Ni (B4)',
      allowedMidis: [59, 60, 62, 64, 66, 67, 69, 71, 72],
      sequence: [59, 62, 64, 66, 69, 71, 72, 71, 69, 67, 66, 64, 62, 59, 62, 60]
    },
    bhupali: {
      category: 'CLASSICAL CONCERT RAGA (AUDAV PENTATONIC)',
      title: 'Raga Bhupali (Mohanam Pentatonic)',
      mood: 'Early Evening • Peaceful & Luminous',
      desc: 'A five-note (Audav-Audav) raga belonging to Kalyan Thaat that completely omits Madhyam (Ma) and Nishad (Ni). Uses only Sa, Re, Ga, Pa, and Dha.',
      aroha: 'सा रे ग प ध सां  (C4 D4 E4 G4 A4 C5)',
      avaroha: 'सां ध प ग रे सा  (C5 A4 G4 E4 D4 C4)',
      pakad: 'ग रे सा ध़, सा रे ग, प ग, ध प ग रे सा',
      vadi: 'Vadi: Ga (E4) • Samvadi: Dha (A4)',
      allowedMidis: [57, 60, 62, 64, 67, 69, 72, 74],
      sequence: [60, 62, 64, 67, 69, 72, 69, 67, 64, 62, 60, 57, 60, 62, 64, 62, 60]
    },
    bhairav: {
      category: 'CLASSICAL CONCERT RAGA (SANDHIPRAKASH)',
      title: 'Raga Bhairav (Adi-Raga of Dawn)',
      mood: 'Sunrise • Majestic, Meditative & Awed',
      desc: 'The primordial morning raga associated with Lord Shiva. Combines Komal Re (C#4) and Komal Dha (G#4) with strong Shuddha Ga (E4) and Shuddha Ni (B4). Apply slow oscillations (Andolan) on Komal Re and Komal Dha.',
      aroha: 'सा रेunderline ग म प धunderline नि सां  (C4 C#4 E4 F4 G4 G#4 B4 C5)',
      avaroha: 'सां नि धunderline प म ग रेunderline सा  (C5 B4 G#4 G4 F4 E4 C#4 C4)',
      pakad: 'ग म धunderline धunderline प, ग म रेunderline रेunderline सा',
      vadi: 'Vadi: Komal Dha (G#4) • Samvadi: Komal Re (C#4)',
      allowedMidis: [60, 61, 64, 65, 67, 68, 71, 72],
      sequence: [60, 61, 64, 65, 67, 68, 71, 72, 71, 68, 67, 65, 64, 65, 61, 60]
    },
    desh: {
      category: 'CLASSICAL CONCERT RAGA (KHAMAJ THAAT)',
      title: 'Raga Desh (Monsoon & Vande Mataram Raga)',
      mood: 'Late Evening / Monsoon • Romantic & Joyful',
      desc: 'Famous as the melody of India’s national song "Vande Mataram". Ascends pentatonically with Shuddha Ni (B4) and descends heptatonically featuring sweet Komal Ni (A#4).',
      aroha: 'सा रे म प नि सां  (C4 D4 F4 G4 B4 C5)',
      avaroha: 'सां निunderline ध प, द म ग रे, ग नि़ सा  (C5 A#4 A4 G4 F4 E4 D4 B3 C4)',
      pakad: 'रे म प निunderline ध प, म ग रे, ग नि़ सा',
      vadi: 'Vadi: Re (D4) • Samvadi: Pa (G4)',
      allowedMidis: [59, 60, 62, 64, 65, 67, 69, 70, 71, 72],
      sequence: [60, 62, 65, 67, 71, 72, 70, 69, 67, 65, 64, 62, 64, 59, 60]
    },
    shivranjani: {
      category: 'CLASSICAL CONCERT RAGA (PENTATONIC PATHOS)',
      title: 'Raga Shivranjani (Komal Ga Audav)',
      mood: 'Late Night • Soulful, Melancholic & Deep',
      desc: 'Identical to Raga Bhupali except Shuddha Ga (E4) is replaced by Komal Ga (D#4). That single semitone shift transforms bright joy into deep, poignant emotion.',
      aroha: 'सा रे गunderline प ध सां  (C4 D4 D#4 G4 A4 C5)',
      avaroha: 'सां ध प गunderline रे सा  (C5 A4 G4 D#4 D4 C4)',
      pakad: 'सा रे गunderline, प ध प गunderline, रे सा ध़ सा',
      vadi: 'Vadi: Pa (G4) • Samvadi: Sa (C4)',
      allowedMidis: [57, 60, 62, 63, 67, 69, 72],
      sequence: [60, 62, 63, 67, 69, 72, 69, 67, 63, 62, 60, 57, 60]
    },
    darbari: {
      category: 'CLASSICAL CONCERT RAGA (ASAVARI THAAT)',
      title: 'Raga Darbari Kanada (Tansen’s Royal Court Raga)',
      mood: 'Midnight • Regal, Profound & Grave',
      desc: 'Composed by Miyan Tansen for Emperor Akbar. Uses Komal Ga (D#4), Komal Dha (G#4), and Komal Ni (A#4) with heavy, dignified Gamak oscillation and Vakra (zig-zag) phrasing.',
      aroha: 'सा रे गunderline, म प धunderline निunderline सां  (C4 D4 D#4 F4 G4 G#4 A#4 C5)',
      avaroha: 'सां, धunderline निunderline प, म प गunderline, म रे सा',
      pakad: 'गunderline गunderline रे सा, ध़underline नि़underline सा रे सा',
      vadi: 'Vadi: Re (D4) • Samvadi: Pa (G4)',
      allowedMidis: [56, 58, 60, 62, 63, 65, 67, 68, 70, 72],
      sequence: [60, 62, 63, 63, 62, 60, 56, 58, 60, 62, 65, 67, 68, 70, 72, 68, 70, 67, 65, 67, 63, 65, 62, 60]
    }
  };

  /* ========================================================================
     4. ACOUSTIC DSP REED SYNTHESIS & CONVOLUTION ENGINE (WEB AUDIO API)
     ======================================================================== */
  let audioCtx = null;
  let isAudioInitialized = false;

  // Master Audio Buses & Nodes
  let masterBellowsGain = null;
  let bellowsExpressionFilter = null;
  let brassSaturationShaper = null;
  let cabinetConvolver = null;
  let dryGainNode = null;
  let wetReverbGain = null;
  let masterLimiter = null;
  let analyserNode = null;
  let recorderDestNode = null;

  // Continuous Air-Hiss & Tremolo LFO Nodes
  let airHissGainNode = null;
  let tremoloLfoOsc = null;
  let tremoloDepthGain = null;
  let sharedNoiseBuffer = null;

  // Active Voices & Drones
  const activeVoices = new Map(); // midi -> VoiceInstance
  const activeDrones = new Map(); // 'droneSa' | 'dronePa' | 'droneMa' -> DroneInstance

  // Active Pull-Stop & Coupler States
  const stopState = {
    bass: true,
    male: true,
    female: true,
    tremolo: false,
    droneSa: false,
    dronePa: false,
    droneMa: false,
    coupler: true
  };

  // Microtonal Meend Pitch Bend State (-100 to +100 cents)
  let currentPitchBendCents = 0;

  // Initialize Web Audio Context & Complete DSP Signal Chain
  function initAudioEngine() {
    if (isAudioInitialized && audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass({ latencyHint: 'interactive' });

    // Pre-allocate 2-second White Noise Buffer for Key-Clack & Bellows Air Hiss
    sharedNoiseBuffer = createWhiteNoiseBuffer(audioCtx, 2.0);

    // 1. Bellows Expression Low-Pass Filter (400Hz starved -> 4500Hz full PSI)
    bellowsExpressionFilter = audioCtx.createBiquadFilter();
    bellowsExpressionFilter.type = 'lowpass';
    bellowsExpressionFilter.frequency.value = 1800;
    bellowsExpressionFilter.Q.value = 0.85;

    // 2. Brass-Reed Harmonic Saturation WaveShaper
    brassSaturationShaper = audioCtx.createWaveShaper();
    brassSaturationShaper.curve = createBrassSaturationCurve(28);
    brassSaturationShaper.oversample = '2x';

    // 3. Master Bellows Pressure Gain (0.0 when reservoir is empty!)
    masterBellowsGain = audioCtx.createGain();
    masterBellowsGain.gain.value = 0.0;

    // 4. Burmese Teak Wooden Cabinet Convolver & Wet/Dry Mix
    cabinetConvolver = audioCtx.createConvolver();
    cabinetConvolver.buffer = generateTeakCabinetImpulse(audioCtx, settings.reverbRoom);

    dryGainNode = audioCtx.createGain();
    wetReverbGain = audioCtx.createGain();
    updateReverbMixNodes();

    // 5. Master Brickwall Compressor/Limiter (Prevents polyphonic clipping)
    masterLimiter = audioCtx.createDynamicsCompressor();
    masterLimiter.threshold.value = -6.0;
    masterLimiter.knee.value = 12.0;
    masterLimiter.ratio.value = 8.0;
    masterLimiter.attack.value = 0.003;
    masterLimiter.release.value = 0.12;

    // 6. Real-Time Oscilloscope Analyser & Live Recorder Destination
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.75;

    if (typeof audioCtx.createMediaStreamDestination === 'function') {
      recorderDestNode = audioCtx.createMediaStreamDestination();
    }

    // Connect Master Signal Path:
    bellowsExpressionFilter.connect(brassSaturationShaper);
    brassSaturationShaper.connect(masterBellowsGain);

    masterBellowsGain.connect(dryGainNode);
    masterBellowsGain.connect(cabinetConvolver);
    cabinetConvolver.connect(wetReverbGain);

    dryGainNode.connect(masterLimiter);
    wetReverbGain.connect(masterLimiter);

    masterLimiter.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
    if (recorderDestNode) {
      masterLimiter.connect(recorderDestNode);
    }

    // 7. Global Tremolo Baffle LFO (5.8 Hz air modulation)
    tremoloLfoOsc = audioCtx.createOscillator();
    tremoloLfoOsc.type = 'sine';
    tremoloLfoOsc.frequency.value = 5.8;

    tremoloDepthGain = audioCtx.createGain();
    tremoloDepthGain.gain.value = stopState.tremolo ? 14.0 : 0.0;
    tremoloLfoOsc.connect(tremoloDepthGain);
    tremoloLfoOsc.start();

    // 8. Continuous Bellows Air-Hiss Generator
    setupContinuousAirHiss();

    // Sync any active Surpeti Drone Stops
    syncAllDroneVoices();

    isAudioInitialized = true;
  }

  // Generate White Noise AudioBuffer
  function createWhiteNoiseBuffer(ctx, durationSeconds) {
    const length = Math.floor(ctx.sampleRate * durationSeconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2.0 - 1.0;
    }
    return buffer;
  }

  // Soft-Clipping Warm Brass Reed Saturation Curve
  function createBrassSaturationCurve(driveAmount) {
    const samples = 8192;
    const curve = new Float32Array(samples);
    const k = driveAmount;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x)) + 0.03 * x * x;
    }
    return curve;
  }

  // Procedural Burmese Teak Soundboard & Acoustic Room Impulse Response
  function generateTeakCabinetImpulse(ctx, roomMode) {
    const sampleRate = ctx.sampleRate;
    let duration = 0.65;
    let decayRate = 5.5;

    if (roomMode === 'dry') {
      duration = 0.22;
      decayRate = 11.0;
    } else if (roomMode === 'hall') {
      duration = 1.65;
      decayRate = 2.6;
    }

    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * decayRate);
      const woodResonance =
        0.35 * Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 28) +
        0.25 * Math.sin(2 * Math.PI * 392 * t) * Math.exp(-t * 35) +
        0.18 * Math.sin(2 * Math.PI * 820 * t) * Math.exp(-t * 45);

      left[i] = ((Math.random() * 2 - 1) * env * 0.65) + woodResonance;
      right[i] = ((Math.random() * 2 - 1) * env * 0.65) - woodResonance * 0.85;
    }
    return impulse;
  }

  function updateReverbMixNodes() {
    if (!dryGainNode || !wetReverbGain) return;
    if (settings.reverbRoom === 'dry') {
      dryGainNode.gain.value = 0.92;
      wetReverbGain.gain.value = 0.14;
    } else if (settings.reverbRoom === 'room') {
      dryGainNode.gain.value = 0.82;
      wetReverbGain.gain.value = 0.34;
    } else {
      dryGainNode.gain.value = 0.72;
      wetReverbGain.gain.value = 0.56;
    }
  }

  // Continuous Subtle Air-Hiss Proportional to Bellows Velocity & Pressure
  function setupContinuousAirHiss() {
    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = sharedNoiseBuffer;
    noiseSrc.loop = true;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1950;
    bandpass.Q.value = 2.2;

    airHissGainNode = audioCtx.createGain();
    airHissGainNode.gain.value = 0.0;

    noiseSrc.connect(bandpass);
    bandpass.connect(airHissGainNode);
    airHissGainNode.connect(masterLimiter);
    noiseSrc.start();
  }

  // 15ms Mechanical Wooden Key-Clack & Stop-Thud Transient Generator
  function triggerMechanicalTransient(type = 'keydown') {
    if (!isAudioInitialized || !audioCtx || settings.mechNoiseVolume <= 0) return;

    const now = audioCtx.currentTime;
    const mechScale = (settings.mechNoiseVolume / 100) * 0.22;

    const noise = audioCtx.createBufferSource();
    noise.buffer = sharedNoiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    const env = audioCtx.createGain();

    if (type === 'keydown') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1150, now);
      filter.Q.setValueAtTime(3.2, now);
      env.gain.setValueAtTime(mechScale, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    } else if (type === 'keyup') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(620, now);
      env.gain.setValueAtTime(mechScale * 0.55, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
    } else if (type === 'stop') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);
      filter.Q.setValueAtTime(4.5, now);
      env.gain.setValueAtTime(mechScale * 1.35, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    }

    noise.connect(filter);
    filter.connect(env);
    env.connect(masterLimiter);

    noise.start(now);
    noise.stop(now + 0.05);
  }

  /* ========================================================================
     5. FREQUENCY CALCULATION (22-SHRUTI JUST INTONATION vs 12-TET + TRANSPOSE)
     ======================================================================== */
  function computeNoteFrequency(midiNote) {
    const transposedMidi = midiNote + settings.transposeSemitones;
    const a4 = settings.concertPitch;

    const tonicC4Midi = 60 + settings.transposeSemitones;
    const tonicC4Freq = a4 * Math.pow(2, (tonicC4Midi - 69) / 12);

    if (settings.tuningSystem === '12tet') {
      return a4 * Math.pow(2, (transposedMidi - 69) / 12);
    }

    const offsetFromTonic = midiNote - 60;
    const octaveShift = Math.floor(offsetFromTonic / 12);
    const degreeIndex = ((offsetFromTonic % 12) + 12) % 12;
    const shrutiRatio = SHRUTI_RATIOS_12[degreeIndex];

    return tonicC4Freq * shrutiRatio * Math.pow(2, octaveShift);
  }

  /* ========================================================================
     6. MULTI-REED HARMONIUM VOICE CLASS (BASS + MALE + FEMALE REEDS)
     ======================================================================== */
  class HarmoniumVoice {
    constructor(midi, isCoupledSlave = false) {
      this.midi = midi;
      this.isCoupledSlave = isCoupledSlave;
      this.baseFreq = computeNoteFrequency(midi);
      this.now = audioCtx.currentTime;

      this.voiceGain = audioCtx.createGain();
      this.voiceGain.gain.setValueAtTime(0.0001, this.now);
      const targetVoiceLevel = isCoupledSlave ? 0.24 : 0.34;
      this.voiceGain.gain.exponentialRampToValueAtTime(targetVoiceLevel, this.now + 0.022);

      this.oscillators = [];
      this.reedGains = {};

      // 1. BASS REED
      this.createReedBank('bass', {
        freqMultiplier: 0.5,
        detuneCents: -1.2,
        type: 'sawtooth',
        filterType: 'lowpass',
        filterFreq: 850,
        filterQ: 1.1,
        gainLevel: stopState.bass ? 0.42 : 0.0
      });

      // 2. MALE REED
      this.createReedBank('male', {
        freqMultiplier: 1.0,
        detuneCents: 0.0,
        type: 'sawtooth',
        filterType: 'bandpass',
        filterFreq: 1400,
        filterQ: 0.95,
        gainLevel: stopState.male ? 0.58 : 0.0
      });

      this.createReedBank('malePulse', {
        freqMultiplier: 1.0,
        detuneCents: 0.6,
        type: 'square',
        filterType: 'lowpass',
        filterFreq: 2100,
        filterQ: 0.7,
        gainLevel: stopState.male ? 0.22 : 0.0
      });

      // 3. FEMALE REED
      this.createReedBank('female', {
        freqMultiplier: 1.0,
        detuneCents: settings.femaleDetuneCents,
        type: 'sawtooth',
        filterType: 'peaking',
        filterFreq: 2400,
        filterQ: 1.4,
        gainLevel: stopState.female ? 0.48 : 0.0
      });

      this.voiceGain.connect(bellowsExpressionFilter);
    }

    createReedBank(name, cfg) {
      const osc = audioCtx.createOscillator();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(this.baseFreq * cfg.freqMultiplier, this.now);

      const initialDetune = cfg.detuneCents + currentPitchBendCents + physicsState.pitchSagCents;
      osc.detune.setValueAtTime(initialDetune, this.now);

      if (tremoloDepthGain) {
        tremoloDepthGain.connect(osc.detune);
      }

      const filter = audioCtx.createBiquadFilter();
      filter.type = cfg.filterType;
      filter.frequency.setValueAtTime(cfg.filterFreq, this.now);
      filter.Q.setValueAtTime(cfg.filterQ, this.now);
      if (cfg.filterType === 'peaking') {
        filter.gain.setValueAtTime(4.5, this.now);
      }

      const reedGain = audioCtx.createGain();
      reedGain.gain.setValueAtTime(cfg.gainLevel, this.now);

      osc.connect(filter);
      filter.connect(reedGain);
      reedGain.connect(this.voiceGain);

      osc.start(this.now);

      this.oscillators.push({ osc, baseDetune: cfg.detuneCents, freqMultiplier: cfg.freqMultiplier });
      this.reedGains[name] = reedGain;
    }

    updatePitchAndDetune() {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      this.baseFreq = computeNoteFrequency(this.midi);

      for (const item of this.oscillators) {
        item.osc.frequency.setTargetAtTime(this.baseFreq * item.freqMultiplier, now, 0.012);
        const totalDetune = item.baseDetune + currentPitchBendCents + physicsState.pitchSagCents;
        item.osc.detune.setTargetAtTime(totalDetune, now, 0.012);
      }
    }

    updateStopGains() {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      if (this.reedGains.bass) {
        this.reedGains.bass.gain.setTargetAtTime(stopState.bass ? 0.42 : 0.0, now, 0.02);
      }
      if (this.reedGains.male) {
        this.reedGains.male.gain.setTargetAtTime(stopState.male ? 0.58 : 0.0, now, 0.02);
      }
      if (this.reedGains.malePulse) {
        this.reedGains.malePulse.gain.setTargetAtTime(stopState.male ? 0.22 : 0.0, now, 0.02);
      }
      if (this.reedGains.female) {
        this.reedGains.female.gain.setTargetAtTime(stopState.female ? 0.48 : 0.0, now, 0.02);
      }
    }

    release() {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      this.voiceGain.gain.cancelScheduledValues(now);
      this.voiceGain.gain.setValueAtTime(Math.max(0.0001, this.voiceGain.gain.value), now);
      this.voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      setTimeout(() => {
        for (const item of this.oscillators) {
          try {
            item.osc.stop();
            item.osc.disconnect();
          } catch (e) {}
        }
        try {
          this.voiceGain.disconnect();
        } catch (e) {}
      }, 70);
    }
  }

  /* ========================================================================
     7. SURPETI DRONE SYNTHESIS (SA, PA, MA CONTINUOUS REEDS)
     ======================================================================== */
  const DRONE_MIDI_MAP = {
    droneSa: 48, // Mandra Sa (C3)
    dronePa: 55, // Mandra Pa (G3)
    droneMa: 53  // Mandra Shuddha Ma (F3)
  };

  function syncAllDroneVoices() {
    if (!isAudioInitialized || !audioCtx) return;

    Object.keys(DRONE_MIDI_MAP).forEach((droneKey) => {
      const shouldPlay = stopState[droneKey];
      const existing = activeDrones.get(droneKey);

      if (shouldPlay && !existing) {
        const midi = DRONE_MIDI_MAP[droneKey];
        const freq = computeNoteFrequency(midi);
        const now = audioCtx.currentTime;

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2.detune.setValueAtTime(2.5, now);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1150, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.08);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(bellowsExpressionFilter);

        osc1.start(now);
        osc2.start(now);

        activeDrones.set(droneKey, { osc1, osc2, gain, midi });
      } else if (!shouldPlay && existing) {
        const now = audioCtx.currentTime;
        existing.gain.gain.setTargetAtTime(0.0001, now, 0.04);
        setTimeout(() => {
          try {
            existing.osc1.stop();
            existing.osc2.stop();
            existing.gain.disconnect();
          } catch (e) {}
        }, 120);
        activeDrones.delete(droneKey);
      } else if (shouldPlay && existing) {
        const freq = computeNoteFrequency(existing.midi);
        const now = audioCtx.currentTime;
        existing.osc1.frequency.setTargetAtTime(freq, now, 0.02);
        existing.osc2.frequency.setTargetAtTime(freq * 2, now, 0.02);
      }
    });
  }

  /* ========================================================================
     8. KEY TRIGGERING, MECHANICAL OCTAVE COUPLER & POLYPHONY MANAGER
     ======================================================================== */
  const heldPrimaryMidis = new Set();

  function startNote(midi) {
    initAudioEngine();
    if (heldPrimaryMidis.has(midi)) return;

    heldPrimaryMidis.add(midi);
    triggerMechanicalTransient('keydown');

    if (!activeVoices.has(midi)) {
      activeVoices.set(midi, new HarmoniumVoice(midi, false));
    }

    const coupledMidi = midi + 12;
    if (stopState.coupler && coupledMidi <= 84 && !activeVoices.has(coupledMidi)) {
      activeVoices.set(coupledMidi, new HarmoniumVoice(coupledMidi, true));
    }

    updateKeyboardVisualState();
    updateTelemetryHUD(midi);
    checkTutorStepAdvance(midi);
  }

  function stopNote(midi) {
    if (!heldPrimaryMidis.has(midi)) return;
    heldPrimaryMidis.delete(midi);
    triggerMechanicalTransient('keyup');

    rebuildActiveVoicesFromHeldKeys();
    updateKeyboardVisualState();

    if (heldPrimaryMidis.size > 0) {
      const lastMidi = Array.from(heldPrimaryMidis).pop();
      updateTelemetryHUD(lastMidi);
    } else {
      clearTelemetryHUD();
    }
  }

  function rebuildActiveVoicesFromHeldKeys() {
    const requiredMidis = new Map();
    heldPrimaryMidis.forEach((primaryMidi) => {
      requiredMidis.set(primaryMidi, false);
      const coupled = primaryMidi + 12;
      if (stopState.coupler && coupled <= 84 && !requiredMidis.has(coupled)) {
        requiredMidis.set(coupled, true);
      }
    });

    for (const [midi, voice] of activeVoices.entries()) {
      if (!requiredMidis.has(midi)) {
        voice.release();
        activeVoices.delete(midi);
      }
    }

    for (const [midi, isSlave] of requiredMidis.entries()) {
      if (!activeVoices.has(midi) && isAudioInitialized) {
        activeVoices.set(midi, new HarmoniumVoice(midi, isSlave));
      }
    }
  }

  function updateKeyboardVisualState() {
    const allKeyEls = document.querySelectorAll('.key');
    allKeyEls.forEach((keyEl) => {
      const m = parseInt(keyEl.dataset.midi, 10);
      const isPrimary = heldPrimaryMidis.has(m);
      const isCoupled = stopState.coupler && heldPrimaryMidis.has(m - 12);

      keyEl.classList.toggle('active', isPrimary);
      keyEl.classList.toggle('coupled-active', !isPrimary && isCoupled);
    });
  }

  /* ========================================================================
     9. REAL-TIME 60FPS BELLOWS FLUID PHYSICS & 4 PUMPING SENSORS
     ======================================================================== */
  const physicsState = {
    reservoirPressure: 0.0,
    bellowsPosition: 0.0,
    bellowsVelocity: 0.0,
    pitchSagCents: 0.0,
    autoPumpEnabled: false,
    micPumpEnabled: false,
    tiltPumpEnabled: false,
    isDraggingBellows: false,
    lastDragCoord: 0,
    lastTiltAngle: 0,
    currentRawTiltAngle: 0
  };

  let micStream = null;
  let micAnalyser = null;
  let micDataArray = null;

  function injectBellowsAir(amount, visualCompressionTarget = null) {
    const stiffnessFactor = 1.15 - (settings.bellowsStiffness / 150);
    const delta = Math.max(0, amount * stiffnessFactor);
    physicsState.bellowsVelocity = Math.min(1.0, physicsState.bellowsVelocity + delta * 3.5);
    physicsState.reservoirPressure = Math.min(1.0, physicsState.reservoirPressure + delta);

    if (visualCompressionTarget !== null) {
      physicsState.bellowsPosition = Math.max(0, Math.min(1, visualCompressionTarget));
    } else {
      physicsState.bellowsPosition = Math.min(1.0, physicsState.bellowsPosition + delta * 1.6);
    }
  }

  let lastPhysicsTime = performance.now();

  function runBellowsPhysicsLoop(nowTime) {
    const dt = Math.min(0.1, (nowTime - lastPhysicsTime) / 1000);
    lastPhysicsTime = nowTime;

    // 1. Auto-Pump Practice Mode
    if (physicsState.autoPumpEnabled) {
      const targetPressure = 0.82;
      physicsState.reservoirPressure += (targetPressure - physicsState.reservoirPressure) * 6.0 * dt;
      physicsState.bellowsPosition = 0.45 + 0.28 * Math.sin(nowTime * 0.0032);
      physicsState.bellowsVelocity = 0.25;
    }

    // 2. Microphone Blow Sensor Polling
    if (physicsState.micPumpEnabled && micAnalyser && micDataArray) {
      micAnalyser.getByteTimeDomainData(micDataArray);
      let sumSquares = 0;
      for (let i = 0; i < micDataArray.length; i++) {
        const norm = (micDataArray[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / micDataArray.length);
      const threshold = (105 - settings.micSensitivity) * 0.0012;
      if (rms > threshold) {
        const blowGain = (rms - threshold) * (settings.micSensitivity / 25) * dt * 4.2;
        injectBellowsAir(blowGain);
      }
    }

    // 3. Calculate Real-Time Air Consumption Rate
    const activeStopCount =
      (stopState.bass ? 1.25 : 0) +
      (stopState.male ? 1.0 : 0) +
      (stopState.female ? 1.0 : 0);

    const activeDroneCount =
      (stopState.droneSa ? 0.65 : 0) +
      (stopState.dronePa ? 0.65 : 0) +
      (stopState.droneMa ? 0.65 : 0);

    const openValveCount = activeVoices.size * Math.max(0.35, activeStopCount * 0.45) + activeDroneCount;
    const basePassiveLeak = 0.038;
    const valveDrainRate = openValveCount * 0.048;
    const totalDrainRate = (basePassiveLeak + valveDrainRate) * settings.airLeakMultiplier;

    if (!physicsState.autoPumpEnabled) {
      physicsState.reservoirPressure = Math.max(0.0, physicsState.reservoirPressure - totalDrainRate * dt);
    }

    if (!physicsState.isDraggingBellows && !physicsState.autoPumpEnabled) {
      const springSpeed = 1.4 + (settings.bellowsStiffness / 45);
      physicsState.bellowsPosition = Math.max(0.0, physicsState.bellowsPosition - springSpeed * dt * 0.35);
    }

    physicsState.bellowsVelocity = Math.max(0.0, physicsState.bellowsVelocity - 3.2 * dt);

    // 4. Expressive Audio Dynamics, Filter Brightness & Starvation Pitch Sag
    const p = physicsState.reservoirPressure;

    if (p > 0.001 && p < 0.18) {
      const starveRatio = (0.18 - p) / 0.18;
      physicsState.pitchSagCents = -26.0 * (starveRatio * starveRatio);
    } else {
      physicsState.pitchSagCents = 0.0;
    }

    if (isAudioInitialized && audioCtx) {
      const now = audioCtx.currentTime;
      const anyReedStopOpen = stopState.bass || stopState.male || stopState.female;
      const anySoundAllowed = anyReedStopOpen || stopState.droneSa || stopState.dronePa || stopState.droneMa;

      const effectiveGain = (p <= 0.003 || !anySoundAllowed)
        ? 0.0
        : Math.pow(p, 0.78) * 0.95;

      masterBellowsGain.gain.setTargetAtTime(effectiveGain, now, 0.018);

      const cutoffHz = 400 + Math.pow(p, 1.15) * 4100;
      bellowsExpressionFilter.frequency.setTargetAtTime(cutoffHz, now, 0.02);

      const mechScale = settings.mechNoiseVolume / 100;
      const hissLevel = (p * 0.012 + physicsState.bellowsVelocity * 0.025) * mechScale;
      airHissGainNode.gain.setTargetAtTime(hissLevel, now, 0.025);

      if (activeVoices.size > 0) {
        for (const voice of activeVoices.values()) {
          voice.updatePitchAndDetune();
        }
      }
    }

    renderBellowsAndGaugeUI(p, physicsState.bellowsPosition);
    renderOscilloscopeFrame();

    requestAnimationFrame(runBellowsPhysicsLoop);
  }

  /* ========================================================================
     10. UI RENDERING: BELLOWS FOLDS, PSI GAUGE & OSCILLOSCOPE CANVAS
     ======================================================================== */
  const elPressureNeedle = document.getElementById('pressure-needle');
  const elPressureBarFill = document.getElementById('pressure-bar-fill');
  const elHudPsiValue = document.getElementById('hud-psi-value');
  const elBellowsFolds = document.getElementById('bellows-folds');
  const elBellowsHandle = document.getElementById('bellows-handle');
  const elScopeCanvas = document.getElementById('hud-oscilloscope');
  const scopeCtx = elScopeCanvas ? elScopeCanvas.getContext('2d') : null;
  let scopeFrameCounter = 0;

  function renderBellowsAndGaugeUI(pressure, bellowsPos) {
    const pct = Math.round(pressure * 100);

    const angleDeg = -75 + pressure * 150;
    if (elPressureNeedle) {
      elPressureNeedle.style.transform = `translateX(-50%) rotate(${angleDeg.toFixed(1)}deg)`;
    }
    if (elPressureBarFill) {
      elPressureBarFill.style.width = `${pct}%`;
    }
    if (elHudPsiValue) {
      elHudPsiValue.textContent = `${pct}% PSI`;
    }

    if (elBellowsFolds && elBellowsHandle) {
      const scaleY = 1.0 - bellowsPos * 0.42;
      elBellowsFolds.style.transform = `scaleY(${scaleY.toFixed(3)})`;
      const paddleOffsetPx = -bellowsPos * 58;
      elBellowsHandle.style.transform = `translateY(${paddleOffsetPx.toFixed(1)}px)`;
    }
  }

  const scopeBuffer = new Uint8Array(512);

  function renderOscilloscopeFrame() {
    if (!scopeCtx || !elScopeCanvas) return;

    scopeFrameCounter++;
    if (settings.graphicsMode === 'battery' && scopeFrameCounter % 3 !== 0) return;

    const w = elScopeCanvas.width;
    const h = elScopeCanvas.height;

    scopeCtx.fillStyle = 'rgba(5, 18, 10, 0.38)';
    scopeCtx.fillRect(0, 0, w, h);

    scopeCtx.lineWidth = 1.8;
    scopeCtx.strokeStyle = '#3bff9d';
    scopeCtx.beginPath();

    if (!isAudioInitialized || !analyserNode || physicsState.reservoirPressure <= 0.005) {
      scopeCtx.moveTo(0, h / 2);
      scopeCtx.lineTo(w, h / 2);
      scopeCtx.stroke();
      return;
    }

    analyserNode.getByteTimeDomainData(scopeBuffer);
    const sliceWidth = w / scopeBuffer.length;
    let x = 0;

    for (let i = 0; i < scopeBuffer.length; i++) {
      const v = scopeBuffer[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) {
        scopeCtx.moveTo(x, y);
      } else {
        scopeCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    scopeCtx.stroke();
  }

  /* ========================================================================
     11. TELEMETRY HUD UPDATES (ACTIVE SWARA & EXACT FREQUENCY HZ)
     ======================================================================== */
  const elHudSwara = document.getElementById('hud-active-swara');
  const elHudFreq = document.getElementById('hud-active-freq');

  function updateTelemetryHUD(midi) {
    const keyEl = document.querySelector(`.key[data-midi="${midi}"]`);
    const freq = computeNoteFrequency(midi) * Math.pow(2, currentPitchBendCents / 1200);

    if (keyEl && elHudSwara) {
      const sargam = keyEl.dataset.sargam || '';
      const note = keyEl.dataset.note || '';
      elHudSwara.textContent = `${sargam} (${note})`;
    }
    if (elHudFreq) {
      elHudFreq.textContent = `${freq.toFixed(1)} Hz`;
    }
  }

  function clearTelemetryHUD() {
    if (elHudSwara) elHudSwara.textContent = '—';
    if (elHudFreq) elHudFreq.textContent = '0.0 Hz';
  }

  /* ========================================================================
     12. MULTI-TOUCH POINTER MATRIX, GLISSANDO (MEEND) & KAN-SWAR RIBBON
     ======================================================================== */
  const pointerToKeyMap = new Map();

  function setupKeyboardMultiTouch() {
    const keyboardEl = document.getElementById('harmonium-keyboard');
    const viewportEl = document.getElementById('keyboard-viewport');
    if (!keyboardEl || !viewportEl) return;

    viewportEl.classList.add('scroll-locked');

    keyboardEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      initAudioEngine();
      try {
        keyboardEl.setPointerCapture(e.pointerId);
      } catch (err) {}

      const keyEl = findKeyElementAtPoint(e.clientX, e.clientY);
      if (keyEl) {
        const midi = parseInt(keyEl.dataset.midi, 10);
        const startVerticalCoord = isPortraitRotatedMode() ? e.clientX : e.clientY;
        pointerToKeyMap.set(e.pointerId, { midi, startCoord: startVerticalCoord });
        startNote(midi);
      }
    });

    keyboardEl.addEventListener('pointermove', (e) => {
      if (!pointerToKeyMap.has(e.pointerId)) return;
      e.preventDefault();

      const tracked = pointerToKeyMap.get(e.pointerId);
      const keyEl = findKeyElementAtPoint(e.clientX, e.clientY);

      const currentVerticalCoord = isPortraitRotatedMode() ? e.clientX : e.clientY;
      const deltaV = tracked.startCoord - currentVerticalCoord;
      const verticalBend = Math.max(-100, Math.min(100, deltaV * 1.4));
      setPitchBendCents(verticalBend);

      if (keyEl) {
        const newMidi = parseInt(keyEl.dataset.midi, 10);
        if (newMidi !== tracked.midi) {
          const oldMidi = tracked.midi;
          tracked.midi = newMidi;
          tracked.startCoord = currentVerticalCoord;

          if (!isMidiHeldByAnotherPointer(oldMidi, e.pointerId)) {
            stopNote(oldMidi);
          }
          startNote(newMidi);
        }
      }
    });

    const handlePointerRelease = (e) => {
      if (!pointerToKeyMap.has(e.pointerId)) return;
      const tracked = pointerToKeyMap.get(e.pointerId);
      pointerToKeyMap.delete(e.pointerId);

      if (!isMidiHeldByAnotherPointer(tracked.midi, e.pointerId)) {
        stopNote(tracked.midi);
      }

      if (pointerToKeyMap.size === 0) {
        setPitchBendCents(0);
      }
    };

    keyboardEl.addEventListener('pointerup', handlePointerRelease);
    keyboardEl.addEventListener('pointercancel', handlePointerRelease);
  }

  function findKeyElementAtPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    return el.closest('.key');
  }

  function isMidiHeldByAnotherPointer(midi, excludePointerId) {
    for (const [pid, data] of pointerToKeyMap.entries()) {
      if (pid !== excludePointerId && data.midi === midi) return true;
    }
    return false;
  }

  // Dedicated Microtonal Kan-Swar / Meend Touch Ribbon (±100 cents)
  function setupMeendRibbon() {
    const ribbon = document.getElementById('meend-touch-strip');
    if (!ribbon) return;

    let ribbonPointerId = null;

    const updateRibbonFromEvent = (e) => {
      const rect = ribbon.getBoundingClientRect();
      let norm = 0.5;
      if (isPortraitRotatedMode()) {
        norm = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
      } else {
        norm = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
      }
      const cents = (norm - 0.5) * 200;
      setPitchBendCents(cents);
    };

    ribbon.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      ribbonPointerId = e.pointerId;
      try {
        ribbon.setPointerCapture(e.pointerId);
      } catch (err) {}
      updateRibbonFromEvent(e);
    });

    ribbon.addEventListener('pointermove', (e) => {
      if (e.pointerId !== ribbonPointerId) return;
      updateRibbonFromEvent(e);
    });

    const releaseRibbon = (e) => {
      if (e.pointerId !== ribbonPointerId) return;
      ribbonPointerId = null;
      setPitchBendCents(0);
    };

    ribbon.addEventListener('pointerup', releaseRibbon);
    ribbon.addEventListener('pointercancel', releaseRibbon);
  }

  function setPitchBendCents(cents) {
    currentPitchBendCents = Math.max(-100, Math.min(100, cents));
    const thumb = document.getElementById('meend-thumb-indicator');
    if (thumb) {
      const pct = 50 + (currentPitchBendCents / 200) * 100;
      thumb.style.left = `${pct.toFixed(1)}%`;
    }
    for (const voice of activeVoices.values()) {
      voice.updatePitchAndDetune();
    }
    if (heldPrimaryMidis.size > 0) {
      const lastMidi = Array.from(heldPrimaryMidis).pop();
      updateTelemetryHUD(lastMidi);
    }
  }

  /* ========================================================================
     13. BELLOWS PADDLE TOUCH, MIC BLOW & DEVICE TILT SENSORS
     ======================================================================== */
  function setupBellowsControls() {
    const chamber = document.getElementById('bellows-touch-zone');
    const modeTag = document.getElementById('bellows-mode-indicator');
    const btnAuto = document.getElementById('btn-pump-auto');
    const btnMic = document.getElementById('btn-pump-mic');
    const btnTilt = document.getElementById('btn-pump-tilt');

    if (chamber) {
      let activePumpPointer = null;

      chamber.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        initAudioEngine();
        activePumpPointer = e.pointerId;
        physicsState.isDraggingBellows = true;
        physicsState.lastDragCoord = isPortraitRotatedMode() ? e.clientX : e.clientY;
        try {
          chamber.setPointerCapture(e.pointerId);
        } catch (err) {}

        injectBellowsAir(0.16);
      });

      chamber.addEventListener('pointermove', (e) => {
        if (e.pointerId !== activePumpPointer) return;
        e.preventDefault();

        const rect = chamber.getBoundingClientRect();
        const currCoord = isPortraitRotatedMode() ? e.clientX : e.clientY;
        const dCoord = Math.abs(currCoord - physicsState.lastDragCoord);
        physicsState.lastDragCoord = currCoord;

        let normPos = 0.5;
        let spanSize = 120;
        if (isPortraitRotatedMode()) {
          spanSize = Math.max(80, rect.width);
          normPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / spanSize));
        } else {
          spanSize = Math.max(80, rect.height);
          normPos = 1.0 - Math.max(0, Math.min(1, (e.clientY - rect.top) / spanSize));
        }

        const airMoved = (dCoord / spanSize) * 0.68;
        injectBellowsAir(airMoved, normPos);
      });

      const endBellowsDrag = (e) => {
        if (e.pointerId !== activePumpPointer) return;
        activePumpPointer = null;
        physicsState.isDraggingBellows = false;
      };

      chamber.addEventListener('pointerup', endBellowsDrag);
      chamber.addEventListener('pointercancel', endBellowsDrag);
    }

    // 1. Auto-Pump Practice Mode Toggle
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        initAudioEngine();
        physicsState.autoPumpEnabled = !physicsState.autoPumpEnabled;
        btnAuto.setAttribute('aria-pressed', String(physicsState.autoPumpEnabled));
        updateBellowsModeLabel(modeTag);
      });
    }

    // 2. Microphone Blow Sensor Toggle
    if (btnMic) {
      btnMic.addEventListener('click', async () => {
        initAudioEngine();
        if (!physicsState.micPumpEnabled) {
          try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const micSource = audioCtx.createMediaStreamSource(micStream);
            micAnalyser = audioCtx.createAnalyser();
            micAnalyser.fftSize = 256;
            micDataArray = new Uint8Array(micAnalyser.frequencyBinCount);
            micSource.connect(micAnalyser);

            physicsState.micPumpEnabled = true;
            btnMic.setAttribute('aria-pressed', 'true');
          } catch (err) {
            alert('Microphone permission is required for Mic Blow bellows pumping.');
            physicsState.micPumpEnabled = false;
            btnMic.setAttribute('aria-pressed', 'false');
          }
        } else {
          if (micStream) {
            micStream.getTracks().forEach((t) => t.stop());
            micStream = null;
          }
          physicsState.micPumpEnabled = false;
          btnMic.setAttribute('aria-pressed', 'false');
        }
        updateBellowsModeLabel(modeTag);
      });
    }

    // 3. Device Tilt Sensor Toggle
    if (btnTilt) {
      btnTilt.addEventListener('click', async () => {
        initAudioEngine();
        if (!physicsState.tiltPumpEnabled) {
          if (
            typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
          ) {
            try {
              const perm = await DeviceOrientationEvent.requestPermission();
              if (perm !== 'granted') return;
            } catch (e) {}
          }
          physicsState.tiltPumpEnabled = true;
          btnTilt.setAttribute('aria-pressed', 'true');
        } else {
          physicsState.tiltPumpEnabled = false;
          btnTilt.setAttribute('aria-pressed', 'false');
        }
        updateBellowsModeLabel(modeTag);
      });
    }

    window.addEventListener('deviceorientation', (e) => {
      const tiltVal = (e.gamma !== null ? e.gamma : e.beta) || 0;
      physicsState.currentRawTiltAngle = tiltVal;

      const tiltReadout = document.getElementById('tilt-angle-readout');
      if (tiltReadout) {
        const calibrated = tiltVal - settings.tiltNeutralAngle;
        tiltReadout.textContent = `Tilt Angle: ${calibrated.toFixed(1)}°`;
      }

      if (!physicsState.tiltPumpEnabled) return;
      const deltaAngle = Math.abs(tiltVal - physicsState.lastTiltAngle);
      physicsState.lastTiltAngle = tiltVal;

      if (deltaAngle > 0.35 && deltaAngle < 25) {
        injectBellowsAir(deltaAngle * 0.018);
      }
    });
  }

  function updateBellowsModeLabel(modeTag) {
    if (!modeTag) return;
    if (physicsState.autoPumpEnabled) {
      modeTag.textContent = 'AUTO-PUMP ON';
    } else if (physicsState.micPumpEnabled) {
      modeTag.textContent = 'MIC BLOW SENSOR';
    } else if (physicsState.tiltPumpEnabled) {
      modeTag.textContent = 'TILT ROCK SENSOR';
    } else {
      modeTag.textContent = 'TOUCH PUMP';
    }
  }

  /* ========================================================================
     14. 7 PULL-STOPS, MECHANICAL COUPLER & SCALE-CHANGER CONTROLS
     ======================================================================== */
  function setupCabinetStopsAndMechanics() {
    const stopButtons = [
      { id: 'stop-bass', key: 'bass' },
      { id: 'stop-male', key: 'male' },
      { id: 'stop-female', key: 'female' },
      { id: 'stop-tremolo', key: 'tremolo' },
      { id: 'stop-drone-sa', key: 'droneSa' },
      { id: 'stop-drone-pa', key: 'dronePa' },
      { id: 'stop-drone-ma', key: 'droneMa' }
    ];

    stopButtons.forEach(({ id, key }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      btn.addEventListener('click', () => {
        initAudioEngine();
        stopState[key] = !stopState[key];
        const active = stopState[key];

        btn.classList.toggle('pulled', active);
        btn.setAttribute('aria-pressed', String(active));
        triggerMechanicalTransient('stop');

        if (key === 'tremolo' && tremoloDepthGain && audioCtx) {
          tremoloDepthGain.gain.setTargetAtTime(active ? 14.0 : 0.0, audioCtx.currentTime, 0.03);
        } else if (key.startsWith('drone')) {
          syncAllDroneVoices();
        } else {
          for (const voice of activeVoices.values()) {
            voice.updateStopGains();
          }
        }
      });
    });

    // Mechanical Octave Coupler Switch (Jod)
    const btnCoupler = document.getElementById('btn-coupler-toggle');
    if (btnCoupler) {
      btnCoupler.addEventListener('click', () => {
        initAudioEngine();
        stopState.coupler = !stopState.coupler;
        btnCoupler.classList.toggle('active', stopState.coupler);
        btnCoupler.setAttribute('aria-pressed', String(stopState.coupler));
        triggerMechanicalTransient('stop');
        rebuildActiveVoicesFromHeldKeys();
        updateKeyboardVisualState();
      });
    }

    // Scale Changer Transpose Lever (-4 to +4 Semitones)
    const sliderScale = document.getElementById('slider-scale-changer');
    const btnScaleDown = document.getElementById('btn-scale-down');
    const btnScaleUp = document.getElementById('btn-scale-up');

    const applyScaleTranspose = (newVal) => {
      const clamped = Math.max(-4, Math.min(4, parseInt(newVal, 10) || 0));
      settings.transposeSemitones = clamped;
      saveSettings();

      if (sliderScale) sliderScale.value = String(clamped);
      const modalSlider = document.getElementById('slider-modal-transpose');
      if (modalSlider) modalSlider.value = String(clamped);

      const scaleLabel = SCALE_CHANGER_NAMES[String(clamped)] || 'Safed 1 (C)';
      const hudLabel = document.getElementById('hud-scale-label');
      const modalOut = document.getElementById('out-modal-transpose');
      if (hudLabel) hudLabel.textContent = scaleLabel;
      if (modalOut) modalOut.textContent = `${clamped >= 0 ? '+' : ''}${clamped} (${scaleLabel})`;

      triggerMechanicalTransient('stop');
      for (const voice of activeVoices.values()) {
        voice.updatePitchAndDetune();
      }
      syncAllDroneVoices();
      if (tanpuraState.isPlaying) {
        updateTanpuraFrequencies();
      }
    };

    if (sliderScale) {
      sliderScale.addEventListener('input', (e) => applyScaleTranspose(e.target.value));
    }
    if (btnScaleDown) {
      btnScaleDown.addEventListener('click', () => applyScaleTranspose(settings.transposeSemitones - 1));
    }
    if (btnScaleUp) {
      btnScaleUp.addEventListener('click', () => applyScaleTranspose(settings.transposeSemitones + 1));
    }
  }

  /* ========================================================================
     15. SAPTAK VIEWPORT JUMP & GLISSANDO SCROLL LOCK
     ======================================================================== */
  function setupKeyboardNavigation() {
    const viewport = document.getElementById('keyboard-viewport');
    const btnMandra = document.getElementById('btn-scroll-mandra');
    const btnMadhya = document.getElementById('btn-scroll-madhya');
    const btnTaar = document.getElementById('btn-scroll-taar');
    const btnLock = document.getElementById('btn-lock-scroll');

    const scrollToSaptak = (saptak, activeBtn) => {
      if (!viewport) return;
      const targetKey = document.querySelector(`.key[data-saptak="${saptak}"]`);
      if (targetKey && settings.keyZoomPx > 38) {
        viewport.scrollTo({
          left: Math.max(0, targetKey.offsetLeft - 16),
          behavior: 'smooth'
        });
      }
      [btnMandra, btnMadhya, btnTaar].forEach((b) => b && b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
    };

    if (btnMandra) btnMandra.addEventListener('click', () => scrollToSaptak('mandra', btnMandra));
    if (btnMadhya) btnMadhya.addEventListener('click', () => scrollToSaptak('madhya', btnMadhya));
    if (btnTaar) btnTaar.addEventListener('click', () => scrollToSaptak('taar', btnTaar));

    if (btnLock && viewport) {
      btnLock.addEventListener('click', () => {
        const locked = viewport.classList.toggle('scroll-locked');
        btnLock.classList.toggle('locked', locked);
        btnLock.setAttribute('aria-pressed', String(locked));
        btnLock.innerHTML = locked ? '&#128274; GLISSANDO LOCKED' : '&#128275; SCROLL UNLOCKED';
      });
    }
  }

  /* ========================================================================
     16. ACCOMPANIMENT GENERATOR: ELECTRONIC TANPURA & TEENTAL TABLA
     ======================================================================== */
  const tanpuraState = {
    isPlaying: false,
    timerId: null,
    stepIndex: 0
  };

  const tablaState = {
    isPlaying: false,
    bpm: 120,
    timerId: null,
    beatIndex: 0
  };

  function setupAccompanimentGenerators() {
    const btnTanpura = document.getElementById('btn-tanpura-toggle');
    const btnTabla = document.getElementById('btn-tabla-toggle');
    const btnBpmDown = document.getElementById('btn-bpm-down');
    const btnBpmUp = document.getElementById('btn-bpm-up');
    const bpmDisplay = document.getElementById('hud-bpm-display');

    if (btnTanpura) {
      btnTanpura.addEventListener('click', () => {
        initAudioEngine();
        tanpuraState.isPlaying = !tanpuraState.isPlaying;
        btnTanpura.setAttribute('aria-pressed', String(tanpuraState.isPlaying));

        if (tanpuraState.isPlaying) {
          tanpuraState.stepIndex = 0;
          pluckNextTanpuraString();
          tanpuraState.timerId = setInterval(pluckNextTanpuraString, 950);
        } else {
          clearInterval(tanpuraState.timerId);
          tanpuraState.timerId = null;
        }
      });
    }

    if (btnTabla) {
      btnTabla.addEventListener('click', () => {
        initAudioEngine();
        tablaState.isPlaying = !tablaState.isPlaying;
        btnTabla.setAttribute('aria-pressed', String(tablaState.isPlaying));

        if (tablaState.isPlaying) {
          tablaState.beatIndex = 0;
          restartTablaLoop();
        } else {
          clearInterval(tablaState.timerId);
          tablaState.timerId = null;
        }
      });
    }

    const updateBpm = (delta) => {
      tablaState.bpm = Math.max(50, Math.min(240, tablaState.bpm + delta));
      if (bpmDisplay) {
        bpmDisplay.innerHTML = `${tablaState.bpm} <small>BPM</small>`;
      }
      if (tablaState.isPlaying) {
        restartTablaLoop();
      }
    };

    if (btnBpmDown) btnBpmDown.addEventListener('click', () => updateBpm(-5));
    if (btnBpmUp) btnBpmUp.addEventListener('click', () => updateBpm(5));
  }

  function pluckNextTanpuraString() {
    if (!isAudioInitialized || !audioCtx || !tanpuraState.isPlaying) return;

    const patternMidis = [55, 60, 60, 48];
    const midi = patternMidis[tanpuraState.stepIndex % 4];
    tanpuraState.stepIndex++;

    const freq = computeNoteFrequency(midi);
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2.001, now);

    const jawariFilter = audioCtx.createBiquadFilter();
    jawariFilter.type = 'bandpass';
    jawariFilter.frequency.setValueAtTime(freq * 3.5, now);
    jawariFilter.Q.setValueAtTime(1.8, now);

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.11, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0008, now + 2.6);

    osc1.connect(jawariFilter);
    osc2.connect(jawariFilter);
    jawariFilter.connect(env);
    env.connect(masterLimiter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.65);
    osc2.stop(now + 2.65);
  }

  function updateTanpuraFrequencies() {}

  function restartTablaLoop() {
    if (tablaState.timerId) clearInterval(tablaState.timerId);
    const intervalMs = (60 / tablaState.bpm) * 1000;
    triggerTablaBol();
    tablaState.timerId = setInterval(triggerTablaBol, intervalMs);
  }

  function triggerTablaBol() {
    if (!isAudioInitialized || !audioCtx || !tablaState.isPlaying) return;

    const beat = tablaState.beatIndex % 16;
    tablaState.beatIndex++;

    const now = audioCtx.currentTime;
    const isSam = beat === 0;
    const isKhali = beat >= 8 && beat <= 11;

    const dayanFreq = computeNoteFrequency(60);
    const dayanOsc = audioCtx.createOscillator();
    const dayanGain = audioCtx.createGain();
    dayanOsc.type = 'triangle';
    dayanOsc.frequency.setValueAtTime(dayanFreq * (isSam ? 1.02 : 1.0), now);
    dayanOsc.frequency.exponentialRampToValueAtTime(dayanFreq, now + 0.06);

    dayanGain.gain.setValueAtTime(isSam ? 0.24 : 0.14, now);
    dayanGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    dayanOsc.connect(dayanGain);
    dayanGain.connect(masterLimiter);
    dayanOsc.start(now);
    dayanOsc.stop(now + 0.25);

    if (!isKhali) {
      const bayanOsc = audioCtx.createOscillator();
      const bayanGain = audioCtx.createGain();
      bayanOsc.type = 'sine';
      bayanOsc.frequency.setValueAtTime(108, now);
      bayanOsc.frequency.exponentialRampToValueAtTime(66, now + 0.19);

      bayanGain.gain.setValueAtTime(isSam ? 0.32 : 0.22, now);
      bayanGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      bayanOsc.connect(bayanGain);
      bayanGain.connect(masterLimiter);
      bayanOsc.start(now);
      bayanOsc.stop(now + 0.29);
    }
  }

  /* ========================================================================
     17. BUILT-IN LIVE STUDIO AUDIO RECORDER & EXPORT
     ======================================================================== */
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;
  let recStartTime = 0;
  let recTimerInterval = null;
  let lastRecordedBlobUrl = null;
  let previewAudioEl = null;

  function setupStudioRecorder() {
    const btnRec = document.getElementById('btn-record-toggle');
    const btnPlay = document.getElementById('btn-record-play');
    const linkDownload = document.getElementById('btn-record-download');
    const elTimer = document.getElementById('rec-timer');
    const elRecLabel = document.getElementById('rec-btn-label');

    if (!btnRec) return;

    btnRec.addEventListener('click', () => {
      initAudioEngine();

      if (!isRecording) {
        if (!recorderDestNode || typeof MediaRecorder === 'undefined') {
          alert('MediaRecorder API is not supported in this browser.');
          return;
        }

        recordedChunks = [];
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
        }

        mediaRecorder = mimeType
          ? new MediaRecorder(recorderDestNode.stream, { mimeType })
          : new MediaRecorder(recorderDestNode.stream);

        mediaRecorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            recordedChunks.push(ev.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          if (lastRecordedBlobUrl) URL.revokeObjectURL(lastRecordedBlobUrl);
          lastRecordedBlobUrl = URL.createObjectURL(blob);

          if (btnPlay) btnPlay.disabled = false;
          if (linkDownload) {
            linkDownload.href = lastRecordedBlobUrl;
            const ext = (mediaRecorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
            linkDownload.download = `sur-sangam-harmonium-${Date.now()}.${ext}`;
            linkDownload.classList.remove('disabled');
          }
        };

        mediaRecorder.start(200);
        isRecording = true;
        recStartTime = Date.now();
        btnRec.setAttribute('aria-pressed', 'true');
        if (elRecLabel) elRecLabel.textContent = 'STOP';

        recTimerInterval = setInterval(() => {
          const secTotal = Math.floor((Date.now() - recStartTime) / 1000);
          const mins = String(Math.floor(secTotal / 60)).padStart(2, '0');
          const secs = String(secTotal % 60).padStart(2, '0');
          if (elTimer) elTimer.textContent = `${mins}:${secs}`;
        }, 500);
      } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        isRecording = false;
        clearInterval(recTimerInterval);
        btnRec.setAttribute('aria-pressed', 'false');
        if (elRecLabel) elRecLabel.textContent = 'REC';
      }
    });

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (!lastRecordedBlobUrl) return;
        if (previewAudioEl) {
          previewAudioEl.pause();
          previewAudioEl = null;
        }
        previewAudioEl = new Audio(lastRecordedBlobUrl);
        previewAudioEl.play();
      });
    }
  }

  /* ========================================================================
     18. PRO-SETTINGS MODAL CONTROLLER & LOCALSTORAGE PERSISTENCE
     ======================================================================== */
  function setupSettingsModal() {
    const modal = document.getElementById('modal-settings');
    const btnOpen = document.getElementById('btn-open-settings');
    const btnClose = document.getElementById('btn-close-settings');
    const btnReset = document.getElementById('btn-reset-settings');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    const selectTuning = document.getElementById('select-tuning-system');
    const sliderPitch = document.getElementById('slider-concert-pitch');
    const outPitch = document.getElementById('out-concert-pitch');
    const presetButtons = document.querySelectorAll('.pitch-preset-btn');
    const sliderModalTranspose = document.getElementById('slider-modal-transpose');
    const sliderDetune = document.getElementById('slider-reed-detune');
    const outDetune = document.getElementById('out-reed-detune');
    const selectReverb = document.getElementById('select-reverb-room');
    const sliderMech = document.getElementById('slider-mech-noise');
    const outMech = document.getElementById('out-mech-noise');
    const sliderStiff = document.getElementById('slider-bellows-stiffness');
    const outStiff = document.getElementById('out-bellows-stiffness');
    const sliderLeak = document.getElementById('slider-air-leak');
    const outLeak = document.getElementById('out-air-leak');
    const sliderMic = document.getElementById('slider-mic-sensitivity');
    const outMic = document.getElementById('out-mic-sensitivity');
    const btnCalibrateTilt = document.getElementById('btn-calibrate-tilt');
    const selectLabels = document.getElementById('select-label-mode');
    const sliderZoom = document.getElementById('slider-key-zoom');
    const outZoom = document.getElementById('out-key-zoom');
    const selectGraphics = document.getElementById('select-graphics-mode');

    const syncSettingsToUI = () => {
      if (selectTuning) selectTuning.value = settings.tuningSystem;
      if (sliderPitch) sliderPitch.value = String(settings.concertPitch);
      if (outPitch) outPitch.textContent = `${settings.concertPitch} Hz`;

      presetButtons.forEach((b) => {
        b.classList.toggle('active', parseFloat(b.dataset.pitch) === settings.concertPitch);
      });

      const scaleName = SCALE_CHANGER_NAMES[String(settings.transposeSemitones)] || 'Safed 1 (C)';
      if (sliderModalTranspose) sliderModalTranspose.value = String(settings.transposeSemitones);
      const sliderMainTranspose = document.getElementById('slider-scale-changer');
      if (sliderMainTranspose) sliderMainTranspose.value = String(settings.transposeSemitones);
      const hudScale = document.getElementById('hud-scale-label');
      if (hudScale) hudScale.textContent = scaleName;
      const outTranspose = document.getElementById('out-modal-transpose');
      if (outTranspose) {
        outTranspose.textContent = `${settings.transposeSemitones >= 0 ? '+' : ''}${settings.transposeSemitones} (${scaleName})`;
      }

      if (sliderDetune) sliderDetune.value = String(settings.femaleDetuneCents);
      if (outDetune) outDetune.textContent = `+${settings.femaleDetuneCents} cents`;
      if (selectReverb) selectReverb.value = settings.reverbRoom;
      if (sliderMech) sliderMech.value = String(settings.mechNoiseVolume);
      if (outMech) outMech.textContent = `${settings.mechNoiseVolume}%`;
      if (sliderStiff) sliderStiff.value = String(settings.bellowsStiffness);
      if (outStiff) outStiff.textContent = `${settings.bellowsStiffness}%`;
      if (sliderLeak) sliderLeak.value = String(settings.airLeakMultiplier);
      if (outLeak) outLeak.textContent = `${settings.airLeakMultiplier.toFixed(1)}x`;
      if (sliderMic) sliderMic.value = String(settings.micSensitivity);
      if (outMic) outMic.textContent = `${settings.micSensitivity}%`;
      if (selectLabels) selectLabels.value = settings.labelMode;
      if (sliderZoom) sliderZoom.value = String(settings.keyZoomPx);

      // Fit All 37 Keys on Screen when slider is <= 38px
      if (settings.keyZoomPx <= 38) {
        if (outZoom) outZoom.textContent = 'Fit All 37 Keys (No Scroll)';
        document.documentElement.style.setProperty('--white-key-width', 'calc((100% - 22px) / 22)');
        document.documentElement.style.setProperty('--black-key-width', '2.75%');
      } else {
        if (outZoom) outZoom.textContent = `${settings.keyZoomPx}px`;
        document.documentElement.style.setProperty('--white-key-width', `${settings.keyZoomPx}px`);
        document.documentElement.style.setProperty('--black-key-width', `calc(${settings.keyZoomPx}px * 0.62)`);
      }

      if (selectGraphics) selectGraphics.value = settings.graphicsMode;

      document.body.classList.remove('label-mode-both', 'label-mode-sargam', 'label-mode-western', 'label-mode-blank');
      document.body.classList.add(`label-mode-${settings.labelMode}`);
      document.body.classList.toggle('battery-saver', settings.graphicsMode === 'battery');

      const hudBadge = document.getElementById('hud-tuning-badge');
      if (hudBadge) {
        const sysName = settings.tuningSystem === '22shruti' ? '22-SHRUTI' : '12-TET';
        hudBadge.textContent = `${sysName} • ${settings.concertPitch}Hz`;
      }
    };

    syncSettingsToUI();

    if (selectTuning) {
      selectTuning.addEventListener('change', (e) => {
        settings.tuningSystem = e.target.value;
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) v.updatePitchAndDetune();
        syncAllDroneVoices();
      });
    }

    if (sliderPitch) {
      sliderPitch.addEventListener('input', (e) => {
        settings.concertPitch = parseFloat(e.target.value);
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) v.updatePitchAndDetune();
        syncAllDroneVoices();
      });
    }

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        settings.concertPitch = parseFloat(btn.dataset.pitch);
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) v.updatePitchAndDetune();
        syncAllDroneVoices();
      });
    });

    if (sliderModalTranspose) {
      sliderModalTranspose.addEventListener('input', (e) => {
        settings.transposeSemitones = parseInt(e.target.value, 10);
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) v.updatePitchAndDetune();
        syncAllDroneVoices();
      });
    }

    if (sliderDetune) {
      sliderDetune.addEventListener('input', (e) => {
        settings.femaleDetuneCents = parseFloat(e.target.value);
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) {
          if (v.oscillators[3]) v.oscillators[3].baseDetune = settings.femaleDetuneCents;
          v.updatePitchAndDetune();
        }
      });
    }

    if (selectReverb) {
      selectReverb.addEventListener('change', (e) => {
        settings.reverbRoom = e.target.value;
        saveSettings();
        syncSettingsToUI();
        if (isAudioInitialized && cabinetConvolver) {
          cabinetConvolver.buffer = generateTeakCabinetImpulse(audioCtx, settings.reverbRoom);
          updateReverbMixNodes();
        }
      });
    }

    if (sliderMech) {
      sliderMech.addEventListener('input', (e) => {
        settings.mechNoiseVolume = parseInt(e.target.value, 10);
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (sliderStiff) {
      sliderStiff.addEventListener('input', (e) => {
        settings.bellowsStiffness = parseInt(e.target.value, 10);
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (sliderLeak) {
      sliderLeak.addEventListener('input', (e) => {
        settings.airLeakMultiplier = parseFloat(e.target.value);
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (sliderMic) {
      sliderMic.addEventListener('input', (e) => {
        settings.micSensitivity = parseInt(e.target.value, 10);
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (btnCalibrateTilt) {
      btnCalibrateTilt.addEventListener('click', () => {
        settings.tiltNeutralAngle = physicsState.currentRawTiltAngle || 0;
        saveSettings();
        const tiltReadout = document.getElementById('tilt-angle-readout');
        if (tiltReadout) tiltReadout.textContent = 'Tilt Angle: 0.0° (Calibrated)';
      });
    }

    if (selectLabels) {
      selectLabels.addEventListener('change', (e) => {
        settings.labelMode = e.target.value;
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (sliderZoom) {
      sliderZoom.addEventListener('input', (e) => {
        settings.keyZoomPx = parseInt(e.target.value, 10);
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (selectGraphics) {
      selectGraphics.addEventListener('change', (e) => {
        settings.graphicsMode = e.target.value;
        saveSettings();
        syncSettingsToUI();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        settings = { ...DEFAULT_SETTINGS };
        saveSettings();
        syncSettingsToUI();
        for (const v of activeVoices.values()) v.updatePitchAndDetune();
        syncAllDroneVoices();
      });
    }
  }

  /* ========================================================================
     19. INTERACTIVE HELP, RAGA ACADEMY & VISUAL KEY-HIGHLIGHT TUTOR
     ======================================================================== */
  const tutorState = {
    activeLessonKey: 'alankar1',
    isTutorActive: false,
    stepIndex: 0,
    autoPlayTimer: null
  };

  function setupRagaAcademyModal() {
    const modal = document.getElementById('modal-academy');
    const btnOpen = document.getElementById('btn-open-academy');
    const btnClose = document.getElementById('btn-close-academy');

    if (btnOpen && modal) {
      btnOpen.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    const tabBtns = document.querySelectorAll('.academy-tab-btn');
    const tabPanels = document.querySelectorAll('.academy-tab-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.tab;
        tabBtns.forEach((b) => {
          const isMatch = b === btn;
          b.classList.toggle('active', isMatch);
          b.setAttribute('aria-selected', String(isMatch));
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle('hidden', panel.id !== targetId);
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });

    const lessonBtns = document.querySelectorAll('.lesson-item-btn');
    lessonBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        lessonBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.lesson;
        renderLessonDetail(key);
      });
    });

    const btnLaunchHighlight = document.getElementById('btn-launch-highlight');
    const btnModalAutoplay = document.getElementById('btn-modal-autoplay');
    const btnTutorAutoplay = document.getElementById('btn-tutor-autoplay');
    const btnTutorReset = document.getElementById('btn-tutor-reset');
    const btnTutorClose = document.getElementById('btn-tutor-close');

    if (btnLaunchHighlight) {
      btnLaunchHighlight.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
        startInteractiveTutor(tutorState.activeLessonKey, false);
      });
    }

    if (btnModalAutoplay) {
      btnModalAutoplay.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
        startInteractiveTutor(tutorState.activeLessonKey, true);
      });
    }

    if (btnTutorAutoplay) {
      btnTutorAutoplay.addEventListener('click', () => {
        if (tutorState.autoPlayTimer) {
          stopTutorAutoPlay();
        } else {
          startTutorAutoPlay();
        }
      });
    }

    if (btnTutorReset) {
      btnTutorReset.addEventListener('click', () => {
        stopTutorAutoPlay();
        tutorState.stepIndex = 0;
        highlightTutorKeysOnKeyboard();
      });
    }

    if (btnTutorClose) {
      btnTutorClose.addEventListener('click', () => {
        exitInteractiveTutor();
      });
    }
  }

  function renderLessonDetail(lessonKey) {
    const lesson = ACADEMY_LESSONS[lessonKey];
    if (!lesson) return;
    tutorState.activeLessonKey = lessonKey;

    const setElText = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setElText('detail-category-badge', lesson.category);
    setElText('detail-title', lesson.title);
    setElText('detail-time-mood', lesson.mood);
    setElText('detail-description', lesson.desc);
    setElText('detail-aroha', lesson.aroha);
    setElText('detail-avaroha', lesson.avaroha);
    setElText('detail-pakad', lesson.pakad);
    setElText('detail-vadi', lesson.vadi);
  }

  function startInteractiveTutor(lessonKey, autoPlayImmediately = false) {
    initAudioEngine();
    stopTutorAutoPlay();

    const lesson = ACADEMY_LESSONS[lessonKey];
    if (!lesson) return;

    tutorState.activeLessonKey = lessonKey;
    tutorState.isTutorActive = true;
    tutorState.stepIndex = 0;

    const strip = document.getElementById('tutor-guidance-strip');
    const titleEl = document.getElementById('tutor-active-title');
    const formulaEl = document.getElementById('tutor-active-formula');

    if (strip) strip.classList.remove('hidden');
    if (titleEl) titleEl.textContent = lesson.title;
    if (formulaEl) formulaEl.textContent = `Aroha: ${lesson.aroha}`;

    highlightTutorKeysOnKeyboard();

    if (autoPlayImmediately) {
      startTutorAutoPlay();
    }
  }

  function highlightTutorKeysOnKeyboard() {
    const lesson = ACADEMY_LESSONS[tutorState.activeLessonKey];
    const allKeys = document.querySelectorAll('.key');

    allKeys.forEach((k) => {
      k.classList.remove('raga-allowed', 'tutor-next-target');
    });

    if (!tutorState.isTutorActive || !lesson) return;

    lesson.allowedMidis.forEach((midi) => {
      const keyEl = document.querySelector(`.key[data-midi="${midi}"]`);
      if (keyEl) keyEl.classList.add('raga-allowed');
    });

    const targetMidi = lesson.sequence[tutorState.stepIndex % lesson.sequence.length];
    const targetKeyEl = document.querySelector(`.key[data-midi="${targetMidi}"]`);
    if (targetKeyEl) {
      targetKeyEl.classList.add('tutor-next-target');
      const sargam = targetKeyEl.dataset.sargam || '';
      const note = targetKeyEl.dataset.note || '';
      const nextSwaraEl = document.getElementById('tutor-next-swara');
      if (nextSwaraEl) {
        nextSwaraEl.textContent = `${sargam} (${note}) [${tutorState.stepIndex + 1}/${lesson.sequence.length}]`;
      }
    }
  }

  function checkTutorStepAdvance(pressedMidi) {
    if (!tutorState.isTutorActive || tutorState.autoPlayTimer) return;
    const lesson = ACADEMY_LESSONS[tutorState.activeLessonKey];
    if (!lesson) return;

    const targetMidi = lesson.sequence[tutorState.stepIndex % lesson.sequence.length];
    if (pressedMidi === targetMidi) {
      tutorState.stepIndex = (tutorState.stepIndex + 1) % lesson.sequence.length;
      highlightTutorKeysOnKeyboard();
    }
  }

  function startTutorAutoPlay() {
    stopTutorAutoPlay();
    initAudioEngine();

    if (physicsState.reservoirPressure < 0.5) {
      physicsState.reservoirPressure = 0.85;
    }

    const btnAuto = document.getElementById('btn-tutor-autoplay');
    if (btnAuto) btnAuto.textContent = '⏹ Stop Demo';

    const lesson = ACADEMY_LESSONS[tutorState.activeLessonKey];
    if (!lesson) return;

    let currentNoteMidi = null;

    const playStep = () => {
      if (!tutorState.isTutorActive) {
        stopTutorAutoPlay();
        return;
      }

      if (currentNoteMidi !== null) {
        stopNote(currentNoteMidi);
      }

      injectBellowsAir(0.22);

      const midi = lesson.sequence[tutorState.stepIndex % lesson.sequence.length];
      highlightTutorKeysOnKeyboard();
      startNote(midi);
      currentNoteMidi = midi;

      tutorState.stepIndex = (tutorState.stepIndex + 1) % lesson.sequence.length;
    };

    playStep();
    tutorState.autoPlayTimer = setInterval(playStep, 480);
  }

  function stopTutorAutoPlay() {
    if (tutorState.autoPlayTimer) {
      clearInterval(tutorState.autoPlayTimer);
      tutorState.autoPlayTimer = null;
    }
    Array.from(heldPrimaryMidis).forEach((m) => stopNote(m));
    const btnAuto = document.getElementById('btn-tutor-autoplay');
    if (btnAuto) btnAuto.textContent = '▶ Auto-Play Demo';
  }

  function exitInteractiveTutor() {
    stopTutorAutoPlay();
    tutorState.isTutorActive = false;
    const strip = document.getElementById('tutor-guidance-strip');
    if (strip) strip.classList.add('hidden');
    highlightTutorKeysOnKeyboard();
  }

  /* ========================================================================
     20. DESKTOP KEYBOARD SHORTCUTS, FULLSCREEN & ORIENTATION UNLOCK
     ======================================================================== */
  const KEYBOARD_MIDI_MAP = {
    KeyZ: 48, KeyS: 49, KeyX: 50, KeyD: 51, KeyC: 52, KeyV: 53,
    KeyG: 54, KeyB: 55, KeyH: 56, KeyN: 57, KeyJ: 58, KeyM: 59,
    KeyQ: 60, Digit2: 61, KeyW: 62, Digit3: 63, KeyE: 64, KeyR: 65,
    Digit5: 66, KeyT: 67, Digit6: 68, KeyY: 69, Digit7: 70, KeyU: 71,
    KeyI: 72, Digit9: 73, KeyO: 74, Digit0: 75, KeyP: 76, BracketLeft: 77,
    Equal: 78, BracketRight: 79
  };

  function setupDesktopKeyboardAndFullscreen() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        initAudioEngine();
        injectBellowsAir(0.22);
        return;
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        const btnAuto = document.getElementById('btn-pump-auto');
        if (btnAuto) btnAuto.click();
        return;
      }

      const midi = KEYBOARD_MIDI_MAP[e.code];
      if (midi !== undefined) {
        e.preventDefault();
        startNote(midi);
      }
    });

    window.addEventListener('keyup', (e) => {
      const midi = KEYBOARD_MIDI_MAP[e.code];
      if (midi !== undefined) {
        e.preventDefault();
        stopNote(midi);
      }
    });

    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnForceLandscape = document.getElementById('btn-force-landscape');
    const btnInitStudio = document.getElementById('btn-init-studio');
    const unlockBanner = document.getElementById('audio-unlock-banner');
    const orientationOverlay = document.getElementById('orientation-overlay');

    // Permanently ensure orientation blocker never blocks the view
    if (orientationOverlay) {
      orientationOverlay.classList.add('hidden');
      orientationOverlay.style.display = 'none';
    }

    const enterFullscreenAndLockLandscape = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape').catch(() => {});
        }
      } catch (err) {}
    };

    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', async () => {
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
            if (screen.orientation && screen.orientation.lock) {
              await screen.orientation.lock('landscape').catch(() => {});
            }
          } else if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } catch (e) {}
      });
    }

    if (btnForceLandscape) {
      btnForceLandscape.addEventListener('click', async () => {
        initAudioEngine();
        await enterFullscreenAndLockLandscape();
        if (orientationOverlay) orientationOverlay.style.display = 'none';
      });
    }

    if (btnInitStudio) {
      btnInitStudio.addEventListener('click', async () => {
        initAudioEngine();
        injectBellowsAir(0.75);
        triggerMechanicalTransient('stop');
        if (unlockBanner) unlockBanner.classList.add('hidden');
        try {
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape').catch(() => {});
          }
        } catch (e) {}
      });
    }
  }

  /* ========================================================================
     21. BOOTSTRAP CONCERT HARMONIUM WORKSTATION
     ======================================================================== */
  function initStudioWorkstation() {
    setupKeyboardMultiTouch();
    setupMeendRibbon();
    setupBellowsControls();
    setupCabinetStopsAndMechanics();
    setupKeyboardNavigation();
    setupAccompanimentGenerators();
    setupStudioRecorder();
    setupSettingsModal();
    setupRagaAcademyModal();
    setupDesktopKeyboardAndFullscreen();

    // Start 60fps Bellows Fluid Physics & Oscilloscope Loop
    requestAnimationFrame(runBellowsPhysicsLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudioWorkstation);
  } else {
    initStudioWorkstation();
  }
})();
