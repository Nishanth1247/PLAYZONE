// BIDBATTLE 4.0 — Curated Presets with 6 Tournaments & 4 Fixed Contenders

export const FIXED_TEAMS = [
  { id: 'team-nishanth', name: 'Nishanth', shortName: 'NIS', color: '#9147FF', logo: '👑', initialPurse: 100, purse: 100 },
  { id: 'team-ajmal', name: 'Ajmal', shortName: 'AJM', color: '#00D9FF', logo: '⚡', initialPurse: 100, purse: 100 },
  { id: 'team-praneeth', name: 'Praneeth', shortName: 'PRA', color: '#FF8A35', logo: '🔥', initialPurse: 100, purse: 100 },
  { id: 'team-nagulan', name: 'Nagulan', shortName: 'NAG', color: '#B7F34A', logo: '🛡️', initialPurse: 100, purse: 100 },
];

// Price band calculation based on rating
export function getBasePriceByRating(rating) {
  const r = Number(rating) || 80;
  if (r >= 95) return 5.0;
  if (r >= 90) return 4.0;
  if (r >= 85) return 3.0;
  if (r >= 80) return 2.0;
  return 1.0;
}

// Pure Fisher-Yates array shuffle for offline fairness
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Dynamic score label helper based on tournament theme and preset
export function getScoreMetricLabel(category = '', presetId = '') {
  const pId = (presetId || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (pId.includes('imdb') || cat.includes('imdb') || cat.includes('movie')) {
    return 'IMDb Rating';
  }
  if (pId.includes('queen') || pId.includes('legend') || cat.includes('character') || cat.includes('queen')) {
    return 'Character Impact Score';
  }
  if (pId.includes('tamil-hero-auction') || (cat.includes('tamil') && !cat.includes('queen') && !cat.includes('legend'))) {
    return 'Fanbase Score';
  }
  if (cat.includes('mcu') || cat.includes('marvel') || cat.includes('superhero')) {
    return 'Power Score';
  }
  if (cat.includes('pan') || cat.includes('india')) {
    return 'Stardom Score';
  }
  return 'Hero Rating';
}

export const AUCTION_PRESETS = [
  // 1. TAMIL HERO AUCTION (Superstars)
  {
    id: 'tamil-hero-auction',
    name: 'Tamil Hero Auction',
    category: 'Tamil Cinema',
    badgeCategory: 'Cinema Superstars',
    scoreLabel: 'Fanbase Score',
    description: 'Battle for Kollywood supremacy! Bid on 32 legendary Tamil cinema superstars with passionate mass fanbases.',
    theme: {
      primary: '#FFD027',
      secondary: '#9147FF',
      badgeText: 'Cinema Gold & Purple',
      cardGlow: 'hover:border-[#FFD027] hover:shadow-[0_0_35px_rgba(255,208,39,0.35)]',
      gradient: 'from-[#FFD027]/20 via-[#9147FF]/20 to-transparent',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.20,
      customIncrements: [0.20, 0.50, 1.00, 2.00],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'tam-1', name: 'Rajinikanth', role: 'Superstar', category: 'Vintage Legend', basePrice: 5.0, rating: 99, desc: 'The one and only Superstar. Unmatched charisma, mass swag, and generational fanbase.' },
      { id: 'tam-2', name: 'Kamal Haasan', role: 'Ulaga Nayagan', category: 'Vintage Legend', basePrice: 5.0, rating: 98, desc: 'Universal hero, encyclopedic acting master, and pan-Indian cinema icon.' },
      { id: 'tam-3', name: 'Vijay', role: 'Thalapathy', category: 'Tier 1 Titan', basePrice: 5.0, rating: 99, desc: 'Box-office storm and king of opening day collections with a colossal youth & family fanbase.' },
      { id: 'tam-4', name: 'Ajith Kumar', role: 'AK / Thala', category: 'Tier 1 Titan', basePrice: 5.0, rating: 98, desc: 'Ultimate racer and undisputed mass crowd-puller with passionate, fiercely loyal followers.' },
      { id: 'tam-5', name: 'Suriya', role: 'Nadippin Nayagan', category: 'Versatile Superstar', basePrice: 5.0, rating: 95, desc: 'Transformative powerhouse actor celebrated for Rolex, Soorarai Pottru, and Singam.' },
      { id: 'tam-6', name: 'Vikram', role: 'Chiyaan', category: 'Versatile Superstar', basePrice: 4.0, rating: 94, desc: 'Chameleon of Indian cinema, known for mind-bending physical transformations and intensity.' },
      { id: 'tam-7', name: 'Dhanush', role: 'Asuran', category: 'National Award Performer', basePrice: 5.0, rating: 95, desc: 'Multiple National Award winner, global star, and charismatic song & script powerhouse.' },
      { id: 'tam-8', name: 'Sivakarthikeyan', role: 'Prince SK', category: 'Box Office Star', basePrice: 4.0, rating: 93, desc: 'Self-made superstar with immense family & children reach, delivering blockbuster after blockbuster.' },
      { id: 'tam-9', name: 'Vijay Sethupathi', role: 'Makkal Selvan', category: 'People’s Star', basePrice: 4.0, rating: 94, desc: 'The most naturally effortless actor in modern cinema, commanding pan-India respect.' },
      { id: 'tam-10', name: 'Silambarasan TR', role: 'STR / Simbu', category: 'Mass Youth Icon', basePrice: 4.0, rating: 92, desc: 'Born prodigy, energetic dancer, and cult youth sensation with unbreakable fan loyalty.' },
      { id: 'tam-11', name: 'Karthi', role: 'Charismatic Performer', category: 'Consistent Hitmaker', basePrice: 4.0, rating: 92, desc: 'Unflinchingly reliable performer from Kaithi and Paruthiveeran to Ponniyin Selvan.' },
      { id: 'tam-12', name: 'Jayam Ravi', role: 'Action Hero', category: 'Mainstream Star', basePrice: 3.0, rating: 88, desc: 'Handsome, experimental hero acclaimed for Thani Oruvan and Ponniyin Selvan.' },
      { id: 'tam-13', name: 'R. Madhavan', role: 'Maddy', category: 'Pan-India Veteran', basePrice: 4.0, rating: 90, desc: 'Irresistible romantic hero turned critically acclaimed director and pan-India star.' },
      { id: 'tam-14', name: 'Arya', role: 'Action Hero', category: 'Action & Fitness', basePrice: 3.0, rating: 85, desc: 'Sturdy action performer acclaimed for Sarpatta Parambarai and Naan Kadavul.' },
      { id: 'tam-15', name: 'Vishal', role: 'Puratchi Thalapathy', category: 'Action Specialist', basePrice: 2.0, rating: 84, desc: 'Hard-hitting action star famous for high-octane stunts and Sandakozhi.' },
      { id: 'tam-16', name: 'Jiiva', role: 'Versatile Hero', category: 'Youth Performer', basePrice: 2.0, rating: 83, desc: 'Natural romantic and comic timing seen in Siva Manasula Sakthi and Ko.' },
      { id: 'tam-17', name: 'Siddharth', role: 'Youth Icon', category: 'Romantic Hero', basePrice: 2.0, rating: 84, desc: 'Boy-next-door charm with powerhouse dramatic chops in Chithha and Boys.' },
      { id: 'tam-18', name: 'Arvind Swamy', role: 'Vintage & Modern Icon', category: 'Classic Legend', basePrice: 3.0, rating: 89, desc: 'Evergreen heartthrob of Roja & Bombay who returned as the suave villain in Thani Oruvan.' },
      { id: 'tam-19', name: 'Prabhu Deva', role: 'Indian Michael Jackson', category: 'Dance Legend', basePrice: 3.0, rating: 88, desc: 'Legendary dancer, choreographer, and director whose infectious screen energy is timeless.' },
      { id: 'tam-20', name: 'SJ Suryah', role: 'Monster Performer', category: 'Cult Phenomenon', basePrice: 4.0, rating: 92, desc: 'Electrifying screen presence whose quirky delivery and manic energy stole Mark Antony.' },
      { id: 'tam-21', name: 'Vadivelu', role: 'Vaigai Puyal', category: 'Comedy King', basePrice: 5.0, rating: 96, desc: 'The undisputed soul of Tamil pop-culture memes and emotional brilliance in Maamannan.' },
      { id: 'tam-22', name: 'Santhanam', role: 'Comedy Superstar', category: 'Leading Hero', basePrice: 3.0, rating: 87, desc: 'Sharp one-line wit who successfully transitioned from king of comedy to full-fledged lead.' },
      { id: 'tam-23', name: 'Vijay Antony', role: 'Thriller Specialist', category: 'Concept Star', basePrice: 3.0, rating: 86, desc: 'Music maestro turned bankable concept thriller hero with Bichagadu/Pichaikkaran fame.' },
      { id: 'tam-24', name: 'Ashok Selvan', role: 'Romantic & Thriller Star', category: 'Rising Star', basePrice: 3.0, rating: 85, desc: 'Smart script selector celebrated for Por Thozhil, Oh My Kadavule, and Blue Star.' },
      { id: 'tam-25', name: 'Manikandan', role: 'Grown Star', category: 'Method Performer', basePrice: 2.0, rating: 84, desc: 'Remarkable natural acting in Good Night, Lover, and Jai Bhim.' },
      { id: 'tam-26', name: 'Harish Kalyan', role: 'Romantic Heartthrob', category: 'Youth Star', basePrice: 2.0, rating: 83, desc: 'Charming romantic lead in Pyaar Prema Kaadhal, Parking, and Lubber Pandhu.' },
      { id: 'tam-27', name: 'Kavin', role: 'Youth Wavemaker', category: 'Breakout Star', basePrice: 3.0, rating: 86, desc: 'Tremendous grassroots youth following with blockbusters like Dada and Star.' },
      { id: 'tam-28', name: 'Pradeep Ranganathan', role: 'Gen-Z Phenom', category: 'Director-Hero', basePrice: 3.0, rating: 87, desc: 'Instant sensation director-actor who delivered the youth cult blockbuster Love Today.' },
      { id: 'tam-29', name: 'Atharvaa', role: 'Athletic Hero', category: 'Action & Drama', basePrice: 2.0, rating: 82, desc: 'Dedicated physical performer known for Paradesi and Imaikkaa Nodigal.' },
      { id: 'tam-30', name: 'Gautham Karthik', role: 'Action Performer', category: 'Mainstream', basePrice: 2.0, rating: 80, desc: 'Energetic actor featured in Kadal, Rangoon, and Pathu Thala.' },
      { id: 'tam-31', name: 'Sathyaraj', role: 'Puratchi Kalaignar', category: 'Veteran Giant', basePrice: 4.0, rating: 90, desc: 'Revered veteran star and the iconic Kattappa of Baahubali fame.' },
      { id: 'tam-32', name: 'Prakash Raj', role: 'National Award Titan', category: 'Veteran Giant', basePrice: 4.0, rating: 91, desc: '5-time National Award winner whose commanding screen dominance elevates any film.' },
    ]
  },

  // 2. MCU SUPERHERO AUCTION
  {
    id: 'mcu-superhero-auction',
    name: 'MCU Superhero Auction',
    category: 'MCU Superheroes',
    badgeCategory: 'Marvel Cinematic',
    scoreLabel: 'Power Score',
    description: 'Assemble Earth’s mightiest protectors! Bid on 32 MCU movie superhero characters ranked by cinematic combat power.',
    theme: {
      primary: '#00D9FF',
      secondary: '#EF4444',
      badgeText: 'Cosmic Blue & Crimson',
      cardGlow: 'hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.35)]',
      gradient: 'from-[#00D9FF]/20 via-[#EF4444]/20 to-transparent',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.20,
      customIncrements: [0.20, 0.50, 1.00, 2.00],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'mcu-1', name: 'Scarlet Witch (Wanda)', role: 'Reality Warper', category: 'Cosmic / Mystic', basePrice: 5.0, rating: 99, desc: 'MCU movie version: Master of Chaos Magic, Darkhold knowledge, and reality-altering hexes.' },
      { id: 'mcu-2', name: 'Thor Odinson', role: 'God of Thunder', category: 'Cosmic God', basePrice: 5.0, rating: 98, desc: 'MCU movie version: Awakened lightning powers, wielding Stormbreaker and divine Asgardian resilience.' },
      { id: 'mcu-3', name: 'Captain Marvel (Carol)', role: 'Binary Powerhouse', category: 'Cosmic Force', basePrice: 5.0, rating: 97, desc: 'MCU movie version: Infused with Space Stone energy, capable of destroying warships single-handedly.' },
      { id: 'mcu-4', name: 'Doctor Strange (Stephen)', role: 'Master of Mystic Arts', category: 'Mystic', basePrice: 5.0, rating: 97, desc: 'MCU movie version: Mirror dimensions, Eldritch shields, and dimensional portals.' },
      { id: 'mcu-5', name: 'Hulk (Bruce Banner)', role: 'Gamma Juggernaut', category: 'Avenger Heavy', basePrice: 5.0, rating: 95, desc: 'MCU movie version: Enormous physical strength, devastating leap attacks, and near-invulnerability.' },
      { id: 'mcu-6', name: 'Iron Man (Tony Stark)', role: 'Nano-Tech Genius', category: 'Tech Pioneer', basePrice: 4.0, rating: 94, desc: 'MCU movie version: Mark 85 nanotechnology armor, repulsors, and unmatched battlefield intellect.' },
      { id: 'mcu-7', name: 'Loki (God of Stories)', role: 'Timeline Sovereign', category: 'Cosmic God', basePrice: 5.0, rating: 96, desc: 'MCU series/movie version: Time-slipping mastery, holding the multiverse branches together.' },
      { id: 'mcu-8', name: 'Captain America (Steve)', role: 'Super Soldier', category: 'Ground Tactician', basePrice: 4.0, rating: 92, desc: 'MCU movie version: Vibranium shield mastery, tactical leadership, and worthy to wield Mjolnir.' },
      { id: 'mcu-9', name: 'Spider-Man (Peter Parker)', role: 'Agile Web-Slinger', category: 'Street to Cosmic', basePrice: 4.0, rating: 91, desc: 'MCU movie version: Iron Spider nanotech legs, enhanced Spider-Sense, and acrobatic brilliance.' },
      { id: 'mcu-10', name: 'Black Panther (T’Challa)', role: 'Vibranium King', category: 'Wakandan Royal', basePrice: 4.0, rating: 90, desc: 'MCU movie version: Kinetic energy absorbing Vibranium habit and Heart-Shaped Herb reflexes.' },
      { id: 'mcu-11', name: 'Vision', role: 'Synthetic Synthezoid', category: 'Mind Stone Tier', basePrice: 4.0, rating: 93, desc: 'MCU movie version: Vibranium cellular body, solar beam projection, and density phasing.' },
      { id: 'mcu-12', name: 'Shang-Chi', role: 'Ten Rings Master', category: 'Martial Mystic', basePrice: 4.0, rating: 92, desc: 'MCU movie version: Ancient martial arts combined with the mystical, projectile-deflecting Ten Rings.' },
      { id: 'mcu-13', name: 'Wolverine (Logan)', role: 'Adamantium Berserker', category: 'Mutant Vanguard', basePrice: 4.0, rating: 93, desc: 'MCU movie version: Indestructible skeleton, lethal claws, and rapid regenerative healing.' },
      { id: 'mcu-14', name: 'Deadpool (Wade Wilson)', role: 'Immortal Mercenary', category: 'Wildcard Mutant', basePrice: 4.0, rating: 90, desc: 'MCU movie version: Extreme regeneration factor, fourth-wall combat agility, and twin katanas.' },
      { id: 'mcu-15', name: 'Namor (K’uk’ulkan)', role: 'Feathered Serpent God', category: 'Talokan Mutant', basePrice: 4.0, rating: 93, desc: 'MCU movie version: Winged ankle flight, Vibranium piercing spear, and underwater godlike strength.' },
      { id: 'mcu-16', name: 'Ant-Man (Scott Lang)', role: 'Pym Particle Specialist', category: 'Quantum Heavy', basePrice: 3.0, rating: 88, desc: 'MCU movie version: Pym shrinking and Giant-Man transformations capable of crushing Leviathans.' },
      { id: 'mcu-17', name: 'Moon Knight (Marc)', role: 'Avatar of Khonshu', category: 'Mystic Avatar', basePrice: 3.0, rating: 89, desc: 'MCU movie version: Moon dart arsenal and superhuman durability under the night sky.' },
      { id: 'mcu-18', name: 'She-Hulk (Jen Walters)', role: 'Gamma Powerhouse', category: 'Avenger Heavy', basePrice: 3.0, rating: 89, desc: 'MCU movie version: Full conscious control over superhuman gamma strength and thunderous claps.' },
      { id: 'mcu-19', name: 'War Machine (Rhodey)', role: 'Heavy Artillery', category: 'Military Armor', basePrice: 3.0, rating: 88, desc: 'MCU movie version: Heavily armored military suit packed with mini-guns and repulsors.' },
      { id: 'mcu-20', name: 'Winter Soldier (Bucky)', role: 'Infiltration Assassin', category: 'Super Soldier', basePrice: 3.0, rating: 87, desc: 'MCU movie version: Vibranium bionic arm, peerless marksmanship, and hand-to-hand combat prowess.' },
      { id: 'mcu-21', name: 'Falcon / Cap (Sam)', role: 'Airborne Sentinel', category: 'Aerial Avenger', basePrice: 3.0, rating: 86, desc: 'MCU movie version: Wakandan Vibranium flight suit, Redwing recon drones, and Steve Rogers’ shield.' },
      { id: 'mcu-22', name: 'Daredevil (Matt Murdock)', role: 'Man Without Fear', category: 'Street Champion', basePrice: 3.0, rating: 85, desc: 'MCU movie/series version: Hyper-developed radar sense, acrobatic combat, and indomitable grit.' },
      { id: 'mcu-23', name: 'Black Widow (Natasha)', role: 'Master Operative', category: 'Infiltration', basePrice: 2.0, rating: 84, desc: 'MCU movie version: Master spy, electric widow’s bite gauntlets, and elite combat reflexes.' },
      { id: 'mcu-24', name: 'Hawkeye (Clint Barton)', role: 'Sharpshooter Master', category: 'Marksman', basePrice: 2.0, rating: 83, desc: 'MCU movie version: Never misses a shot; equipped with explosive, EMP, and acid trick arrows.' },
      { id: 'mcu-25', name: 'Groot', role: 'Flora Colossus', category: 'Guardians Cosmic', basePrice: 3.0, rating: 88, desc: 'MCU movie version: Rapid branch extension, wooden shield cocooning, and immense regenerative power.' },
      { id: 'mcu-26', name: 'Rocket Raccoon', role: 'Tactical Engineer', category: 'Guardians Cosmic', basePrice: 3.0, rating: 86, desc: 'MCU movie version: Cosmic weapons inventor capable of designing hadron enforcers and gravity traps.' },
      { id: 'mcu-27', name: 'Star-Lord (Peter Quill)', role: 'Cosmic Gunslinger', category: 'Guardians Cosmic', basePrice: 3.0, rating: 85, desc: 'MCU movie version: Dual element blasters, jet-boot propulsion, and cunning intergalactic tactics.' },
      { id: 'mcu-28', name: 'Gamora', role: 'Galaxy Assassin', category: 'Guardians Cosmic', basePrice: 3.0, rating: 86, desc: 'MCU movie version: Enhanced strength, master swordswoman, trained as Thanos’s deadliest warrior.' },
      { id: 'mcu-29', name: 'Nebula', role: 'Cybernetic Weapon', category: 'Guardians Cosmic', basePrice: 3.0, rating: 85, desc: 'MCU movie version: Nanite-healing cybernetic limbs, energy blades, and relentless tactical persistence.' },
      { id: 'mcu-30', name: 'Valkyrie (Brunnhilde)', role: 'Asgardian King', category: 'Asgardian Elite', basePrice: 3.0, rating: 89, desc: 'MCU movie version: Dragonfang blade master, Pegasus aerial knight, and Asgardian resilience.' },
      { id: 'mcu-31', name: 'Wasp (Hope van Dyne)', role: 'Pym Winged Stinger', category: 'Quantum Heavy', basePrice: 3.0, rating: 87, desc: 'MCU movie version: Bio-energy blasters, flight wings, and shrink-and-grow kinetic combos.' },
      { id: 'mcu-32', name: 'Adam Warlock', role: 'Sovereign Sovereign', category: 'Cosmic Heavy', basePrice: 5.0, rating: 95, desc: 'MCU movie version: Superhuman flight, devastating quantum energy blasts, and high durability.' },
    ]
  },

  // 3. PAN INDIA HERO AUCTION
  {
    id: 'pan-india-hero-auction',
    name: 'Pan India Hero Auction',
    category: 'Pan-India Cinema',
    badgeCategory: 'Indian Cinema Titans',
    scoreLabel: 'Stardom Score',
    description: 'The mega spectacle of Indian entertainment! Bid on 32 pan-India box-office kings from Bollywood, Tollywood, Kollywood, Mollywood, and Sandalwood.',
    theme: {
      primary: '#FF8A35',
      secondary: '#FF4FA3',
      badgeText: 'Vibrant Orange & Neon Pink',
      cardGlow: 'hover:border-[#FF8A35] hover:shadow-[0_0_35px_rgba(255,138,53,0.35)]',
      gradient: 'from-[#FF8A35]/20 via-[#FF4FA3]/20 to-transparent',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.25,
      customIncrements: [0.25, 0.50, 1.00, 2.50],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'pan-1', name: 'Shah Rukh Khan', role: 'King Khan', category: 'Bollywood', basePrice: 5.0, rating: 99, desc: 'The Badshah of Bollywood. Global cultural icon with historic 1000-Crore blockbusters Pathaan and Jawan.' },
      { id: 'pan-2', name: 'Prabhas', role: 'Rebel Star', category: 'Tollywood', basePrice: 5.0, rating: 98, desc: 'The undisputed pioneer of modern pan-India cinema through Baahubali, Salaar, and Kalki 2898 AD.' },
      { id: 'pan-3', name: 'Allu Arjun', role: 'Icon Star', category: 'Tollywood', basePrice: 5.0, rating: 98, desc: 'National Award winner and wildfire pan-India phenomenon with historic craze for Pushpa.' },
      { id: 'pan-4', name: 'Rajinikanth', role: 'Superstar', category: 'Kollywood', basePrice: 5.0, rating: 99, desc: 'The pan-Indian godfather of mass mania with legendary box-office pull from Robot to Jailer.' },
      { id: 'pan-5', name: 'Vijay', role: 'Thalapathy', category: 'Kollywood', basePrice: 5.0, rating: 98, desc: 'Monolithic box-office juggernaut whose every film shatters opening day records across the country.' },
      { id: 'pan-6', name: 'Yash', role: 'Rocking Star', category: 'Sandalwood', basePrice: 5.0, rating: 97, desc: 'The face of Sandalwood’s pan-Indian revolution with the monumental KGF chapters and Toxic.' },
      { id: 'pan-7', name: 'Jr NTR', role: 'Man of Masses', category: 'Tollywood', basePrice: 5.0, rating: 97, desc: 'Electrifying dancer, ferocious actor, and global star celebrated for RRR and Devara.' },
      { id: 'pan-8', name: 'Ram Charan', role: 'Mega Power Star', category: 'Tollywood', basePrice: 5.0, rating: 97, desc: 'The fierce Oscar-winning heartbeat of RRR, Rangasthalam, and Game Changer.' },
      { id: 'pan-9', name: 'Hrithik Roshan', role: 'Greek God of Cinema', category: 'Bollywood', basePrice: 5.0, rating: 95, desc: 'Peak athletic dancer, action star, and charismatic face of War, Krrish, and Fighter.' },
      { id: 'pan-10', name: 'Salman Khan', role: 'Bhaijaan', category: 'Bollywood', basePrice: 5.0, rating: 96, desc: 'Decades of unparalleled mass hysteria with the Tiger and Bajrangi Bhaijaan franchises.' },
      { id: 'pan-11', name: 'Ranbir Kapoor', role: 'Rockstar to Animal', category: 'Bollywood', basePrice: 5.0, rating: 96, desc: 'Generational acting force whose blockbuster Animal generated thunderous nationwide records.' },
      { id: 'pan-12', name: 'Mohanlal', role: 'The Complete Actor', category: 'Mollywood', basePrice: 5.0, rating: 97, desc: 'Natural acting titan and pioneer of Malayalam mega-blockbusters like Pulimurugan and Lucifer.' },
      { id: 'pan-13', name: 'Mammootty', role: 'Megastar', category: 'Mollywood', basePrice: 5.0, rating: 96, desc: '3-time National Award winning powerhouse continuously redefining experimental cinema with Bramayugam.' },
      { id: 'pan-14', name: 'Kamal Haasan', role: 'Ulaga Nayagan', category: 'Kollywood', basePrice: 5.0, rating: 97, desc: 'Living cinematic encyclopedia who broke all records with Vikram and Kalki 2898 AD.' },
      { id: 'pan-15', name: 'Ajith Kumar', role: 'AK / Thala', category: 'Kollywood', basePrice: 5.0, rating: 96, desc: 'High-speed mass idol known for pure screen charisma, Mankatha, and Good Bad Ugly.' },
      { id: 'pan-16', name: 'Mahesh Babu', role: 'Superstar', category: 'Tollywood', basePrice: 5.0, rating: 96, desc: 'The prince of Telugu cinema with spotless charm, blockbuster track records, and SSMB29 teaming with Rajamouli.' },
      { id: 'pan-17', name: 'Aamir Khan', role: 'Mr. Perfectionist', category: 'Bollywood', basePrice: 5.0, rating: 95, desc: 'The mastermind behind Dangal and 3 Idiots, setting all-time global Indian box-office records.' },
      { id: 'pan-18', name: 'Rishab Shetty', role: 'Kantara Divine Hero', category: 'Sandalwood', basePrice: 4.0, rating: 94, desc: 'National Award winning creator whose folklore epic Kantara mesmerized audiences worldwide.' },
      { id: 'pan-19', name: 'Suriya', role: 'Rolex / Kanguva', category: 'Kollywood', basePrice: 4.0, rating: 94, desc: 'Deeply respected pan-India performer whose cameo in Vikram sent theaters into shockwaves.' },
      { id: 'pan-20', name: 'Vikram', role: 'Chiyaan', category: 'Kollywood', basePrice: 4.0, rating: 93, desc: 'Celebrated for Anniyan, I, and Thangalaan, a true chameleon loved across all borders.' },
      { id: 'pan-21', name: 'Dhanush', role: 'Asuran / Captain Miller', category: 'Kollywood', basePrice: 4.0, rating: 94, desc: 'Global star who effortlessly commands Bollywood, Kollywood, and Hollywood screens.' },
      { id: 'pan-22', name: 'Ranveer Singh', role: 'High Voltage Star', category: 'Bollywood', basePrice: 4.0, rating: 93, desc: 'Boundless kinetic energy, acclaimed for Padmaavat, Bajirao Mastani, and Dhurandhar.' },
      { id: 'pan-23', name: 'Fahadh Faasil', role: 'FaFa / Shanu', category: 'Mollywood', basePrice: 5.0, rating: 96, desc: 'The coolest pan-India icon whose hypnotic performances in Aavesham, Pushpa, and Vikram won the nation.' },
      { id: 'pan-24', name: 'Prithviraj Sukumaran', role: 'Salaar / Aadujeevitham', category: 'Mollywood', basePrice: 4.0, rating: 94, desc: 'Visionary actor-director acclaimed for Salaar (Varadha) and the monumental The Goat Life.' },
      { id: 'pan-25', name: 'Dulquer Salmaan', role: 'Pan-India Charmer', category: 'Mollywood', basePrice: 4.0, rating: 92, desc: 'Seamlessly fluent pan-India heartthrob with massive hits in Sita Ramam, Lucky Baskhar, and Kurup.' },
      { id: 'pan-26', name: 'Vijay Deverakonda', role: 'Rowdy Star', category: 'Tollywood', basePrice: 4.0, rating: 90, desc: 'Raw, unapologetic attitude star who ignited a nationwide youth wave with Arjun Reddy.' },
      { id: 'pan-27', name: 'Nani', role: 'Natural Star', category: 'Tollywood', basePrice: 4.0, rating: 92, desc: 'The master of heartful storytelling and mass reinvention in Dasara, Hi Nanna, and Saripodhaa Sanivaaram.' },
      { id: 'pan-28', name: 'Sivakarthikeyan', role: 'SK / Major Mukund', category: 'Kollywood', basePrice: 4.0, rating: 93, desc: 'Riding sky-high on national acclaim following the mega patriotic blockbuster Amaran.' },
      { id: 'pan-29', name: 'Karthi', role: 'Dilli / Vandiyathevan', category: 'Kollywood', basePrice: 4.0, rating: 91, desc: 'The backbone of the Lokesh Cinematic Universe (LCU) via Kaithi and epic historic drama Ponniyin Selvan.' },
      { id: 'pan-30', name: 'Ajay Devgn', role: 'Singham / Maidaan', category: 'Bollywood', basePrice: 4.0, rating: 92, desc: 'Quiet intensity and iron-willed action superstar behind the legendary Singham and Drishyam franchises.' },
      { id: 'pan-31', name: 'Ravi Teja', role: 'Mass Maharaja', category: 'Tollywood', basePrice: 3.0, rating: 89, desc: 'Inexhaustible comedic and action stamina celebrated across the Telugu speaking diaspora.' },
      { id: 'pan-32', name: 'Shahid Kapoor', role: 'Kabir Singh', category: 'Bollywood', basePrice: 4.0, rating: 91, desc: 'Charming dance sensation turned intense drama powerhouse with Farzi and Kabir Singh.' },
    ]
  },

  // 4. TOURNAMENT A: TAMIL HEROINE CHARACTER AUCTION (TAMIL QUEEN AUCTION)
  {
    id: 'tamil-queen-auction',
    name: 'Tamil Queen Auction',
    category: 'Tamil Heroine Characters',
    badgeCategory: 'Iconic Queens & Heroines',
    scoreLabel: 'Character Impact Score',
    description: 'Honor the most unforgettable, commanding, and culturally resonant female characters in Tamil cinema history!',
    theme: {
      primary: '#FFD027', // Cinema Gold
      secondary: '#9147FF', // Electric Purple
      accent: '#FF4FA3', // Pink
      badgeText: 'Cinema Gold & Electric Purple',
      cardGlow: 'hover:border-[#FFD027] hover:shadow-[0_0_35px_rgba(255,208,39,0.35)]',
      gradient: 'from-[#FFD027]/25 via-[#9147FF]/20 to-[#FF4FA3]/15',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.20,
      customIncrements: [0.20, 0.50, 1.00, 2.00],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'tq-1', name: 'Neelambari', movie: 'Padayappa', actor: 'Ramya Krishnan', role: 'Commanding Aristocrat', category: 'Iconic Antagonist', basePrice: 5.0, rating: 99, desc: 'The ultimate ego-driven, regal powerhouse who matched Rajinikanth scene for scene with legendary arrogance.' },
      { id: 'tq-2', name: 'Nandini', movie: 'Ponniyin Selvan', actor: 'Aishwarya Rai Bachchan', role: 'Queen of Pazhuvur', category: 'Vengeful Mastermind', basePrice: 5.0, rating: 98, desc: 'Lethally bewitching empress driven by heartbreak and revenge, plotting the downfall of the Chola empire.' },
      { id: 'tq-3', name: 'Ganga / Chandramukhi', movie: 'Chandramukhi', actor: 'Jyothika', role: 'Possessed Classical Dancer', category: 'Split Personality', basePrice: 5.0, rating: 97, desc: 'The chilling, electrifying transformation that terrified and captivated millions with the iconic roar: "Ra Ra"!' },
      { id: 'tq-4', name: 'Kundavai', movie: 'Ponniyin Selvan', actor: 'Trisha Krishnan', role: 'Princess of Cholas', category: 'Royal Strategist', basePrice: 5.0, rating: 96, desc: 'The diplomatic brain and regal pride of the Chola dynasty whose sharp statecraft steered kings and warriors.' },
      { id: 'tq-5', name: 'Jessie', movie: 'Vinnaithaandi Varuvaayaa', actor: 'Trisha Krishnan', role: 'Romantic Protagonist', category: 'Modern Cult Classic', basePrice: 5.0, rating: 95, desc: 'The enigmatic, conflicted Malayali Christian girl whose hesitations and charm defined modern Tamil romance.' },
      { id: 'tq-6', name: 'Jaanu (Janaki Devi)', movie: '96', actor: 'Trisha Krishnan', role: 'Nostalgic Soulmate', category: 'Timeless Romance', basePrice: 5.0, rating: 95, desc: 'The yellow kurta soul of high school love, carrying decades of unspoken longing in a single poignant night.' },
      { id: 'tq-7', name: 'Divya', movie: 'Mouna Ragam', actor: 'Revathi', role: 'Defiant Modern Woman', category: 'Classic Protagonist', basePrice: 5.0, rating: 95, desc: 'Mani Ratnam’s landmark protagonist who boldly asserted her emotional agency and demanded divorce in 1980s cinema.' },
      { id: 'tq-8', name: 'Thenmozhi (Shobana)', movie: 'Thiruchitrambalam', actor: 'Nithya Menen', role: 'Candid Best Friend', category: 'Empathetic Heart', basePrice: 4.0, rating: 94, desc: 'National Award-winning masterclass in warmth, natural banter, and quiet emotional resilience.' },
      { id: 'tq-9', name: 'Bommi (Sundari)', movie: 'Soorarai Pottru', actor: 'Aparna Balamurali', role: 'Bakery Entrepreneur', category: 'Equal Partner', basePrice: 4.0, rating: 93, desc: 'National Award-winning fiery young entrepreneur who stood shoulder-to-shoulder with Nedumaaran to reach the skies.' },
      { id: 'tq-10', name: 'Shalini', movie: 'Alaipayuthey', actor: 'Shalini', role: 'Independent Medic', category: 'Urban Romance', basePrice: 4.0, rating: 94, desc: 'Authentic, courageous portrait of young love, secret marriage, and the emotional realities of cohabitation.' },
      { id: 'tq-11', name: 'Muthazhagu', movie: 'Paruthiveeran', actor: 'Priyamani', role: 'Untamed Village Belle', category: 'Rural Tragedy', basePrice: 4.0, rating: 94, desc: 'National Award-winning raw depiction of fearless, stubborn devotion that met a shattering, immortal climax.' },
      { id: 'tq-12', name: 'Anjali', movie: 'Anjali', actor: 'Baby Shamili', role: 'Special Child', category: 'Emotional Icon', basePrice: 4.0, rating: 93, desc: 'Mani Ratnam’s heart-melting innocent who transformed fear and prejudice into boundless community love.' },
      { id: 'tq-13', name: 'Selvi', movie: 'Vada Chennai', actor: 'Aishwarya Rajesh', role: 'North Madras Firebrand', category: 'Grounded Rebel', basePrice: 4.0, rating: 91, desc: 'Razor-tongued, fearless North Chennai woman whose pride and protective grit anchors Anbu’s destiny.' },
      { id: 'tq-14', name: 'Archana', movie: 'Mozhi', actor: 'Jyothika', role: 'Deaf-Mute Artist', category: 'Inspiring Protagonist', basePrice: 4.0, rating: 93, desc: 'Fiercely self-sufficient woman who rejects pity, commands self-respect, and welcomes love only on equal terms.' },
      { id: 'tq-15', name: 'Kokila', movie: 'Kolamaavu Kokila', actor: 'Nayanthara', role: 'Deadpan Drug Mule', category: 'Dark Comedy Queen', basePrice: 4.0, rating: 93, desc: 'Deceptively timid, innocent girl who outsmarts ruthless drug cartels and armed squads with ice-cold cunning.' },
      { id: 'tq-16', name: 'Maya / Kalpana', movie: 'Ghajini', actor: 'Asin', role: 'Selfless Model & Samaritan', category: 'Tragic Anchor', basePrice: 4.0, rating: 92, desc: 'Brimming with irrepressible joy and altruism, her brutal murder ignited Sanjay Ramasamy’s vengeful crusade.' },
      { id: 'tq-17', name: 'Sudha', movie: 'Kannathil Muthamittal', actor: 'Simran', role: 'Adoptive Mother', category: 'Maternal Hero', basePrice: 4.0, rating: 92, desc: 'Profound, selfless maternal courage that crossed war zones to help her adopted daughter embrace her truth.' },
      { id: 'tq-18', name: 'Kalyani', movie: 'Iruvar', actor: 'Aishwarya Rai Bachchan', role: 'Enigmatic Actress', category: 'Vintage Muse', basePrice: 4.0, rating: 91, desc: 'Dual masterwork in Mani Ratnam’s political classic, echoing the tragic glamour and grace of vintage cinema.' },
      { id: 'tq-19', name: 'Thamarai', movie: 'Kaakha Kaakha', actor: 'Jyothika', role: 'Empathetic Schoolteacher', category: 'Romantic Anchor', basePrice: 4.0, rating: 91, desc: 'Radiant, steadfast educator who gently penetrated the armored heart of ACP Anbuselvan.' },
      { id: 'tq-20', name: 'Paapa (Jyothi)', movie: 'Super Deluxe', actor: 'Ramya Krishnan', role: 'Protective Mother', category: 'Complex Realism', basePrice: 4.0, rating: 90, desc: 'Former adult film actress facing hypocritical societal shaming with extraordinary defiance and maternal warmth.' },
      { id: 'tq-21', name: 'Sana', movie: 'Endhiran', actor: 'Aishwarya Rai Bachchan', role: 'Medical Student', category: 'Sci-Fi Muse', basePrice: 4.0, rating: 90, desc: 'The radiant catalyst whose kiss sparked human emotion in Chitti the Robot and threw Chennai into robo-chaos.' },
      { id: 'tq-22', name: 'Arundhati (Jejamma)', movie: 'Arundhati', actor: 'Anushka Shetty', role: 'Warrior Queen Reincarnation', category: 'Mythic Heroine', basePrice: 5.0, rating: 96, desc: 'Fierce royal lineage protector who returns to bury the demonic sorcerer Pasupathy into ash.' },
      { id: 'tq-23', name: 'Devasena', movie: 'Baahubali: The Conclusion', actor: 'Anushka Shetty', role: 'Warrior Princess of Kuntala', category: 'Unyielding Sovereign', basePrice: 5.0, rating: 97, desc: 'Unbending pride and archer brilliance who stood chained for 25 years without breaking her royal spirit.' },
      { id: 'tq-24', name: 'Maya Mathews', movie: 'Maya', actor: 'Nayanthara', role: 'Asylum Spirit & Mother', category: 'Supernatural Horror', basePrice: 3.0, rating: 89, desc: 'Spine-tingling dual performance that cemented Nayanthara’s undisputed reign as the Lady Superstar.' },
      { id: 'tq-25', name: 'Ramya', movie: 'Sillunu Oru Kaadhal', actor: 'Bhumika Chawla', role: 'Poised College Flame', category: 'Nostalgic Romance', basePrice: 3.0, rating: 88, desc: 'Graceful and tender former flame whose memory beautifully enriches Kundan and Ishu’s bond.' },
      { id: 'tq-26', name: 'Selvi (Kaala)', movie: 'Kaala', actor: 'Easwari Rao', role: 'Matriarch of Dharavi', category: 'Family Anchor', basePrice: 3.0, rating: 88, desc: 'Feisty, loving, and commanding wife of Kaala who rules the household with pure affection and dignity.' },
      { id: 'tq-27', name: 'Vasanthi', movie: '36 Vayadhinile', actor: 'Jyothika', role: 'Visionary Homemaker', category: 'Empowerment Icon', basePrice: 3.0, rating: 88, desc: 'The transformative symbol of housewives reclaiming their buried potential and leading organic revolutions.' },
      { id: 'tq-28', name: 'Avanthika', movie: 'Baahubali', actor: 'Tamannaah Bhatia', role: 'Guerilla Rebel Soldier', category: 'Rebel Warrior', basePrice: 3.0, rating: 86, desc: 'Fierce blade-wielding rebel dedicated to liberating Queen Devasena from the fortresses of Mahishmati.' },
      { id: 'tq-29', name: 'Yazhini', movie: 'Iraivi', actor: 'Kamalinee Mukherjee', role: 'Exasperated Modern Wife', category: 'Grounded Drama', basePrice: 3.0, rating: 86, desc: 'Deeply moving portrayal of an educated woman breaking away from an alcoholic husband to reclaim her dignity.' },
      { id: 'tq-30', name: 'Draupathi', movie: 'Pariyerum Perumal', actor: 'Anandhi', role: 'Law Student Companion', category: 'Guileless Soul', basePrice: 3.0, rating: 89, desc: 'Innocent, pure-hearted young woman whose genuine affection defies deep-seated ancestral caste lines.' },
      { id: 'tq-31', name: 'Hamsavalli', movie: 'Deiva Thirumagal', actor: 'Anushka Shetty', role: 'Compassionate Advocate', category: 'Legal Crusader', basePrice: 3.0, rating: 87, desc: 'Steadfast legal counsel fighting for a developmentally challenged father’s right to love his child.' },
      { id: 'tq-32', name: 'Leelavathi', movie: 'Aandavan Kattalai', actor: 'Ritika Singh', role: 'Investigative Journalist', category: 'Plucky Heroine', basePrice: 3.0, rating: 85, desc: 'Sharp, principled press reporter navigating Chennai’s fake passport underground alongside Gandhi.' },
    ]
  },

  // 5. TOURNAMENT B: TAMIL HERO CHARACTER AUCTION (TAMIL LEGENDS AUCTION)
  {
    id: 'tamil-legends-auction',
    name: 'Tamil Legends Auction',
    category: 'Tamil Hero Characters',
    badgeCategory: 'Iconic Male Legends',
    scoreLabel: 'Character Impact Score',
    description: 'Recruit the greatest male protagonists, vigilantes, masterminds, and mass icons in Tamil cinematic lore!',
    theme: {
      primary: '#00D9FF', // Electric Blue
      secondary: '#EF4444', // Crimson
      accent: '#FFD700', // Metallic Gold
      badgeText: 'Electric Blue & Crimson',
      cardGlow: 'hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.35)]',
      gradient: 'from-[#00D9FF]/20 via-[#EF4444]/20 to-[#FFD700]/15',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.20,
      customIncrements: [0.20, 0.50, 1.00, 2.00],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'tl-1', name: 'Velu Nayakar', movie: 'Nayakan', actor: 'Kamal Haasan', role: 'Dharavi Don & Godfather', category: 'Underworld Patriarch', basePrice: 5.0, rating: 99, desc: 'Time Magazine All-Time classic; the moral grey king of Dharavi: "Neenga Nallavara Kettavara?"' },
      { id: 'tl-2', name: 'Surya', movie: 'Thalapathi', actor: 'Rajinikanth', role: 'Slum Champion & Loyal Warrior', category: 'Modern Karna', basePrice: 5.0, rating: 99, desc: 'Mani Ratnam’s fierce, golden-hearted street fighter whose loyalty to Deva transcends life and law.' },
      { id: 'tl-3', name: 'Senapathy', movie: 'Indian', actor: 'Kamal Haasan', role: 'Varma Kalai Anti-Corruption Vigilante', category: 'Ancient Warrior', basePrice: 5.0, rating: 98, desc: 'Veteran INA freedom fighter who mercilessly uses lethal nerve strikes against corrupt officials.' },
      { id: 'tl-4', name: 'Rolex', movie: 'Vikram', actor: 'Suriya', role: 'Drug Syndicate Emperor', category: 'Ruthless Overlord', basePrice: 5.0, rating: 98, desc: 'A volcanic 3-minute cameo that sent theaters into manic frenzy: "Just call me Rolex, sir!"' },
      { id: 'tl-5', name: 'Agent Vikram (Karnan)', movie: 'Vikram', actor: 'Kamal Haasan', role: 'Black Ops Ghost Commander', category: 'Spec-Ops Leader', basePrice: 5.0, rating: 98, desc: 'Fierce grandfather and covert ops titan returning from the shadows to obliterate drug cartels.' },
      { id: 'tl-6', name: 'Vinayak Mahadev', movie: 'Mankatha', actor: 'Ajith Kumar', role: 'Corrupt Suspended ACP', category: 'Unapologetic Anti-Hero', basePrice: 5.0, rating: 98, desc: 'Ajith’s legendary 50th film anti-hero: ruthless, money-obsessed, and gloriously evil.' },
      { id: 'tl-7', name: 'Chitti (Robot)', movie: 'Endhiran', actor: 'Rajinikanth', role: '1 Terahertz Android Weapon', category: 'Sci-Fi Juggernaut', basePrice: 5.0, rating: 98, desc: 'Shankar’s mega android creation; from innocent helper to red-chip magnetic world destroyer.' },
      { id: 'tl-8', name: 'Leo Das (Parthiban)', movie: 'Leo', actor: 'Vijay', role: 'Quiet Baker & Lethal Gangster', category: 'LCU Enforcer', basePrice: 5.0, rating: 97, desc: 'A peaceful Himachal cafe owner struggling to bury the bloody legacy of his twin-pistol gangster past.' },
      { id: 'tl-9', name: 'Sakthivel (Velu)', movie: 'Ghilli', actor: 'Vijay', role: 'Kabaddi Sprinter & Protector', category: 'Mass Youth Hero', basePrice: 5.0, rating: 97, desc: 'The high-voltage, fast-talking kabaddi ace who sprinted across Madurai to rescue his girl.' },
      { id: 'tl-10', name: 'Aditha Karikalan', movie: 'Ponniyin Selvan', actor: 'Vikram', role: 'Tormented Crown Prince', category: 'Chola Battle General', basePrice: 5.0, rating: 97, desc: 'Fierce battle-scarred warrior prince whose lethal sword hides an unhealable ache for Nandini.' },
      { id: 'tl-11', name: 'Sanjay Ramasamy', movie: 'Ghajini', actor: 'Suriya', role: '15-Minute Memory Avenger', category: 'Psychological Fighter', basePrice: 5.0, rating: 96, desc: 'Billionaire turned tattooed monster of pure vengeance, tracking his lover’s killers with Polaroid clues.' },
      { id: 'tl-12', name: 'Dilli', movie: 'Kaithi', actor: 'Karthi', role: 'Prisoner & Biryani Brawler', category: 'LCU Titan', basePrice: 5.0, rating: 96, desc: 'Quiet, devout ex-convict steering a truck through gangs and gatling guns to hug his daughter.' },
      { id: 'tl-13', name: 'JD (John Durairaj)', movie: 'Master', actor: 'Vijay', role: 'Charismatic Juvenile Dean', category: 'Reformed Professor', basePrice: 5.0, rating: 96, desc: 'Alcoholic college professor who embraces sober responsibility to shield young boys from evil.' },
      { id: 'tl-14', name: 'Bhavani', movie: 'Master', actor: 'Vijay Sethupathi', role: 'Cold-Blooded Syndicate Kingpin', category: 'Iron-Fist Boss', basePrice: 5.0, rating: 96, desc: 'Brutally pragmatic villain with an iron fist, sinister smile, and zero remorse.' },
      { id: 'tl-15', name: 'Vedha', movie: 'Vikram Vedha', actor: 'Vijay Sethupathi', role: 'Philosophical Gangster', category: 'Riddle Master Don', basePrice: 5.0, rating: 96, desc: 'White-bearded underworld storytelling sage who shatters the police’s simplistic moral binaries.' },
      { id: 'tl-16', name: 'Khaali', movie: 'Mullum Malarum', actor: 'Rajinikanth', role: 'Proud Winch Operator', category: 'Defiant Common Man', basePrice: 5.0, rating: 96, desc: 'Mahendran’s masterpiece hero: raw, fiercely protective brother with unyielding self-respect.' },
      { id: 'tl-17', name: 'Muthupandi', movie: 'Ghilli', actor: 'Prakash Raj', role: 'Obsessive Madurai Factionist', category: 'Cult Antagonist', basePrice: 5.0, rating: 96, desc: 'Unforgettable, terrifying yet hilarious villain whose obsessive love "Chellam" became Tamil folklore.' },
      { id: 'tl-18', name: 'Anbu', movie: 'Vada Chennai', actor: 'Dhanush', role: 'Carrom Champion turned Leader', category: 'North Madras Hero', basePrice: 5.0, rating: 95, desc: 'Innocent young sportsman pushed by systemic betrayal into rising as the defender of his hood.' },
      { id: 'tl-19', name: 'Vandhiyathevan', movie: 'Ponniyin Selvan', actor: 'Karthi', role: 'Chola Messenger & Spy', category: 'Agile Adventurer', basePrice: 5.0, rating: 95, desc: 'Witty, fearless warrior whose charm and athletic escape skills kept the Chola empire alive.' },
      { id: 'tl-20', name: 'Santhanam', movie: 'Vikram', actor: 'Vijay Sethupathi', role: 'Golden-Toothed Drug Lord', category: 'Vicious Family Boss', basePrice: 5.0, rating: 95, desc: 'Lethal cartel leader balancing three wives, brutal cocaine rage, and raw muscle authority.' },
      { id: 'tl-21', name: 'Dhanushkodi', movie: 'Maanadu', actor: 'SJ Suryah', role: 'Time-Loop Corrupt DCP', category: 'Maniac Antagonist', basePrice: 5.0, rating: 95, desc: 'High-octane corrupt cop whose exasperated loop meltdowns: "Thalaivare!" spawned immortal memes.' },
      { id: 'tl-22', name: 'Chithan', movie: 'Pithamagan', actor: 'Vikram', role: 'Cemetery Orphan & Beast', category: 'Primal Soul', basePrice: 5.0, rating: 95, desc: 'National Award-winning speechless graveyard orphan possessing raw animalistic fury and loyal love.' },
      { id: 'tl-23', name: 'Sethu (Chiyaan)', movie: 'Sethu', actor: 'Vikram', role: 'College Ringleader', category: 'Tragic Rebel', basePrice: 4.0, rating: 94, desc: 'Aggressive street boss whose transformative heartbreak redefined tragedy in Tamil cinema.' },
      { id: 'tl-24', name: 'Amar', movie: 'Vikram', actor: 'Fahadh Faasil', role: 'Black Ops Commander', category: 'LCU Ghost Hunter', basePrice: 4.0, rating: 94, desc: 'Clinical, unsparing intelligence officer whose investigation leads him into the heart of darkness.' },
      { id: 'tl-25', name: 'Michael (Abdul Khaaliq)', movie: 'Maanadu', actor: 'Silambarasan TR', role: 'Time-Loop Commoner', category: 'Sci-Fi Protagonist', basePrice: 4.0, rating: 94, desc: 'Ordinary man caught in a relentless time loop fighting to halt a communal riot and assassination.' },
      { id: 'tl-26', name: 'Assault Sethu', movie: 'Jigarthanda', actor: 'Bobby Simha', role: 'Madurai Gangster turned Actor', category: 'Meta Cinema Don', basePrice: 4.0, rating: 94, desc: 'National Award-winning terrifying yet comedic Madurai gangster whose acting dreams alter his fate.' },
      { id: 'tl-27', name: 'Karnan', movie: 'Karnan', actor: 'Dhanush', role: 'Sword-Wielding Village Champion', category: 'Folk Rebel', basePrice: 4.0, rating: 94, desc: 'Mari Selvaraj’s rural savior fighting with a drawn sword for a bus stop and human dignity.' },
      { id: 'tl-28', name: 'Vikram', movie: 'Vikram Vedha', actor: 'R. Madhavan', role: 'Encounter Specialist Cop', category: 'Black-and-White Justice', basePrice: 4.0, rating: 93, desc: 'Upright, clinical police assassin forced to question the bloody gray morality of his encounters.' },
      { id: 'tl-29', name: 'Pariyan', movie: 'Pariyerum Perumal', actor: 'Kathir', role: 'Law Student with Karuppi', category: 'Human Dignity Fighter', basePrice: 4.0, rating: 93, desc: 'Gentle, persevering youth who refuses to respond to brutal caste oppression with hatred.' },
      { id: 'tl-30', name: 'Deva', movie: 'Ayan', actor: 'Suriya', role: 'Custom Smuggling Genius', category: 'High-Tech Courier', basePrice: 4.0, rating: 92, desc: 'Laser-sharp, highly educated smuggler who treats customs evasion like an adrenaline sport.' },
      { id: 'tl-31', name: 'Michael Rayappan (Bigil)', movie: 'Bigil', actor: 'Vijay', role: 'Elder Slum Don & Mentor', category: 'Father-Son Legend', basePrice: 4.0, rating: 92, desc: 'Rayappan the stuttering, protective neighborhood godfather alongside Bigil the fiery coach.' },
      { id: 'tl-32', name: 'Billa (David Billa)', movie: 'Billa', actor: 'Ajith Kumar', role: 'International Underworld Don', category: 'Slick Crime Boss', basePrice: 5.0, rating: 95, desc: 'The pinnacle of slick international gangster swagger, bespoke three-piece suits, and icy stares.' },
    ]
  },

  // 6. TOURNAMENT C: TAMIL MOVIE IMDb AUCTION
  {
    id: 'tamil-movie-imdb-auction',
    name: 'Tamil Cinema IMDb Auction',
    category: 'Tamil Cinema Movies',
    badgeCategory: 'IMDb Masterpieces',
    scoreLabel: 'IMDb Rating',
    description: 'Bid on 32 all-time greatest, critically acclaimed Tamil masterpieces using actual verified IMDb ratings normalized for battle!',
    theme: {
      primary: '#FFD700', // Gold
      secondary: '#EF4444', // Deep Red
      accent: '#9147FF', // Electric Purple
      badgeText: 'IMDb Gold & Deep Crimson',
      cardGlow: 'hover:border-[#FFD700] hover:shadow-[0_0_35px_rgba(255,215,0,0.35)]',
      gradient: 'from-[#FFD700]/25 via-[#EF4444]/20 to-black',
    },
    currency: { symbol: '₹', name: 'INR (Crores / Lakhs)', unit: 'Cr', factor: 1 },
    rules: {
      minIncrement: 0.20,
      customIncrements: [0.20, 0.50, 1.00, 2.00],
      minSquadSize: 4,
      maxSquadSize: 8,
      countdownDuration: 20,
      soundEffects: true,
      autoNext: false,
      antiSelfBidding: true,
      allowReAuction: true,
      randomEvents: true,
      hideRatingsDuringAuction: false,
    },
    teams: FIXED_TEAMS.map(t => ({ ...t, initialPurse: 100, purse: 100 })),
    items: [
      { id: 'tm-1', name: 'Jai Bhim', year: 2021, director: 'T.J. Gnanavel', genre: 'Crime / Drama / Legal', imdbRating: 8.8, rating: 88, imdbId: 'tt15097216', imdbUrl: 'https://www.imdb.com/title/tt15097216/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Legal Drama', category: 'Critically Acclaimed', desc: 'Suriya stars in the gripping true-life courtroom crusade fought by Justice Chandru for oppressed tribal rights.' },
      { id: 'tm-2', name: 'Nayakan', year: 1987, director: 'Mani Ratnam', genre: 'Crime / Drama', imdbRating: 8.7, rating: 87, imdbId: 'tt0093603', imdbUrl: 'https://www.imdb.com/title/tt0093603/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Crime Epic', category: 'All-Time Classic', desc: 'Kamal Haasan’s timeless underworld saga chosen among Time Magazine\'s All-Time 100 Best Films.' },
      { id: 'tm-3', name: 'Soorarai Pottru', year: 2020, director: 'Sudha Kongara', genre: 'Biography / Drama', imdbRating: 8.7, rating: 87, imdbId: 'tt10189514', imdbUrl: 'https://www.imdb.com/title/tt10189514/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Biographical Triumph', category: 'National Award Winner', desc: 'National Award-winning triumph of Nedumaaran making aviation affordable for every common Indian.' },
      { id: 'tm-4', name: 'Pariyerum Perumal', year: 2018, director: 'Mari Selvaraj', genre: 'Drama', imdbRating: 8.7, rating: 87, imdbId: 'tt8063004', imdbUrl: 'https://www.imdb.com/title/tt8063004/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Social Drama', category: 'Masterpiece', desc: 'Poignant, unsparing masterpiece tracking a young law student\'s confrontation with generational caste prejudice.' },
      { id: 'tm-5', name: 'Ratsasan', year: 2018, director: 'Ram Kumar', genre: 'Crime / Mystery / Thriller', imdbRating: 8.7, rating: 87, imdbId: 'tt7060344', imdbUrl: 'https://www.imdb.com/title/tt7060344/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Psycho Thriller', category: 'Cult Thriller', desc: 'Spine-chilling serial killer psychological thriller that set the gold standard for Indian crime cinema.' },
      { id: 'tm-6', name: 'Anbe Sivam', year: 2003, director: 'Sundar C.', genre: 'Adventure / Comedy / Drama', imdbRating: 8.6, rating: 86, imdbId: 'tt0367495', imdbUrl: 'https://www.imdb.com/title/tt0367495/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Philosophical Road Movie', category: 'All-Time Classic', desc: 'Kamal Haasan and Madhavan in a heartwarming road-trip exploring humanism, communism, and divine empathy.' },
      { id: 'tm-7', name: 'Thevar Magan', year: 1992, director: 'Bharathan', genre: 'Action / Drama', imdbRating: 8.6, rating: 86, imdbId: 'tt0105574', imdbUrl: 'https://www.imdb.com/title/tt0105574/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Rural Tragedy', category: 'All-Time Classic', desc: 'Kamal Haasan and Sivaji Ganesan in an epic tragedy of rural feudalism, blood feuds, and filial sacrifice.' },
      { id: 'tm-8', name: 'Kadaisi Vivasayi', year: 2021, director: 'M. Manikandan', genre: 'Drama', imdbRating: 8.6, rating: 86, imdbId: 'tt14207908', imdbUrl: 'https://www.imdb.com/title/tt14207908/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Agrarian Masterpiece', category: 'National Award Winner', desc: 'National Award winner; poetic portrait of an 85-year-old traditional farmer and his sacred ancestral soil.' },
      { id: 'tm-9', name: 'Sarpatta Parambarai', year: 2021, director: 'Pa. Ranjith', genre: 'Action / Drama / Sport', imdbRating: 8.6, rating: 86, imdbId: 'tt11301942', imdbUrl: 'https://www.imdb.com/title/tt11301942/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Sports Epic', category: 'Critically Acclaimed', desc: 'Electrifying 1970s North Madras boxing clan rivalry set against the dramatic backdrop of the Emergency.' },
      { id: 'tm-10', name: 'Thalapathi', year: 1991, director: 'Mani Ratnam', genre: 'Action / Crime / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt0101649', imdbUrl: 'https://www.imdb.com/title/tt0101649/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Underworld Brotherhood', category: 'All-Time Classic', desc: 'Rajinikanth and Mammootty in a modern Mahabharata adaptation with Ilaiyaraaja’s immortal soundtrack.' },
      { id: 'tm-11', name: 'Vikram Vedha', year: 2017, director: 'Pushkar-Gayathri', genre: 'Action / Crime / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt6148156', imdbUrl: 'https://www.imdb.com/title/tt6148156/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Neo-Noir Duel', category: 'Blockbuster Classic', desc: 'Philosophical gangster-cop duel drawing from Vikramathithan folklore with R. Madhavan and Vijay Sethupathi.' },
      { id: 'tm-12', name: '96', year: 2018, director: 'C. Prem Kumar', genre: 'Drama / Romance', imdbRating: 8.5, rating: 85, imdbId: 'tt7014212', imdbUrl: 'https://www.imdb.com/title/tt7014212/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Romantic Nostalgia', category: 'Cult Romance', desc: 'Intoxicatingly nostalgic school reunion romance powered by Vijay Sethupathi, Trisha, and Govind Vasantha’s music.' },
      { id: 'tm-13', name: 'Kaithi', year: 2019, director: 'Lokesh Kanagaraj', genre: 'Action / Crime / Thriller', imdbRating: 8.5, rating: 85, imdbId: 'tt9900782', imdbUrl: 'https://www.imdb.com/title/tt9900782/', verifiedDate: '2024-11', basePrice: 3.0, role: 'One-Night Action', category: 'LCU Genesis', desc: 'A songless, single-night drug cartel siege that laid the foundation for the massive Lokesh Cinematic Universe.' },
      { id: 'tm-14', name: 'Asuran', year: 2019, director: 'Vetrimaaran', genre: 'Action / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt9477520', imdbUrl: 'https://www.imdb.com/title/tt9477520/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Revenge Tragedy', category: 'National Award Winner', desc: 'National Award winner; Dhanush’s blood-soaked meditation on caste warfare and the supreme weapon of education.' },
      { id: 'tm-15', name: 'Vada Chennai', year: 2018, director: 'Vetrimaaran', genre: 'Action / Crime / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt1630138', imdbUrl: 'https://www.imdb.com/title/tt1630138/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Gangland Saga', category: 'Cult Classic', desc: 'The definitive North Madras underworld political epic spanning three decades of betrayal and survival.' },
      { id: 'tm-16', name: 'Mahanadhi', year: 1994, director: 'Santhana Bharathi', genre: 'Crime / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt0141566', imdbUrl: 'https://www.imdb.com/title/tt0141566/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Hard-Hitting Tragedy', category: 'All-Time Classic', desc: 'Kamal Haasan’s harrowing emotional pilgrimage through financial betrayal, prison, and familial redemption.' },
      { id: 'tm-17', name: 'Maharaja', year: 2024, director: 'Nithilan Saminathan', genre: 'Action / Crime / Drama', imdbRating: 8.5, rating: 85, imdbId: 'tt26338190', imdbUrl: 'https://www.imdb.com/title/tt26338190/', verifiedDate: '2024-11', basePrice: 3.0, role: 'Non-Linear Thriller', category: '2024 Sensation', desc: 'Vijay Sethupathi’s 50th film; an astonishing non-linear revenge puzzle tracking a stolen dustbin named Lakshmi.' },
      { id: 'tm-18', name: 'Visaranai', year: 2015, director: 'Vetrimaaran', genre: 'Crime / Drama / Thriller', imdbRating: 8.4, rating: 84, imdbId: 'tt4951456', imdbUrl: 'https://www.imdb.com/title/tt4951456/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Custodial Drama', category: 'India Oscar Entry', desc: 'Venice Film Festival sensation depicting police custodial torture, bureaucratic corruption, and existential dread.' },
      { id: 'tm-19', name: 'Iruvar', year: 1997, director: 'Mani Ratnam', genre: 'Biography / Drama', imdbRating: 8.4, rating: 84, imdbId: 'tt0119385', imdbUrl: 'https://www.imdb.com/title/tt0119385/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Political Cinema', category: 'Mani Ratnam Magnum Opus', desc: 'Mani Ratnam\'s magnum opus chronicling cinema and Dravidian politics through Mohanlal and Prakash Raj.' },
      { id: 'tm-20', name: 'Kannathil Muthamittal', year: 2002, director: 'Mani Ratnam', genre: 'Action / Drama / War', imdbRating: 8.4, rating: 84, imdbId: 'tt0316090', imdbUrl: 'https://www.imdb.com/title/tt0316090/', verifiedDate: '2024-11', basePrice: 2.0, role: 'War Drama', category: '6 National Awards', desc: 'Heartbreaking 6-time National Award-winning odyssey of an adopted girl searching for her mother in Sri Lanka.' },
      { id: 'tm-21', name: 'Meiyazhagan', year: 2024, director: 'C. Prem Kumar', genre: 'Comedy / Drama', imdbRating: 8.4, rating: 84, imdbId: 'tt31464459', imdbUrl: 'https://www.imdb.com/title/tt31464459/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Soulful Reunion', category: '2024 Masterpiece', desc: 'Soul-stirring lyrical drama on roots, kindness, and ancestral longing starring Karthi and Arvind Swamy.' },
      { id: 'tm-22', name: 'Super Deluxe', year: 2019, director: 'Thiagarajan Kumararaja', genre: 'Crime / Drama / Thriller', imdbRating: 8.3, rating: 83, imdbId: 'tt7019942', imdbUrl: 'https://www.imdb.com/title/tt7019942/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Hyperlink Indie', category: 'Modern Cult Masterpiece', desc: 'Hyperlink cinematic tour de force intersecting faith, morality, and an extraterrestrial lens on humanity.' },
      { id: 'tm-23', name: 'Jigarthanda', year: 2014, director: 'Karthik Subbaraj', genre: 'Action / Comedy / Crime', imdbRating: 8.3, rating: 83, imdbId: 'tt3569782', imdbUrl: 'https://www.imdb.com/title/tt3569782/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Meta Gangster Comedy', category: 'Modern Classic', desc: 'Meta-cinema classic where an aspiring director infiltrates a Madurai gangster\'s crew to make a crime film.' },
      { id: 'tm-24', name: 'Vikram', year: 2022, director: 'Lokesh Kanagaraj', genre: 'Action / Crime / Thriller', imdbRating: 8.3, rating: 83, imdbId: 'tt9179430', imdbUrl: 'https://www.imdb.com/title/tt9179430/', verifiedDate: '2024-11', basePrice: 2.0, role: 'High-Octane Blockbuster', category: 'Industry Hit', desc: 'Kamal Haasan’s monumental resurgence, uniting Fahadh Faasil, Vijay Sethupathi, and Suriya’s Rolex.' },
      { id: 'tm-25', name: 'Soodhu Kavvum', year: 2013, director: 'Nalan Kumarasamy', genre: 'Comedy / Crime', imdbRating: 8.3, rating: 83, imdbId: 'tt2877108', imdbUrl: 'https://www.imdb.com/title/tt2877108/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Black Comedy', category: 'Cult Classic', desc: 'Hilarious dark comedy heist involving an imaginary girlfriend and an amateur kidnapping crew.' },
      { id: 'tm-26', name: 'Maanadu', year: 2021, director: 'Venkat Prabhu', genre: 'Action / Sci-Fi / Thriller', imdbRating: 8.2, rating: 82, imdbId: 'tt10595282', imdbUrl: 'https://www.imdb.com/title/tt10595282/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Time Loop Thriller', category: 'Blockbuster', desc: 'High-concept political assassination time loop pitting Silambarasan TR against an unhinged SJ Suryah.' },
      { id: 'tm-27', name: 'Jigarthanda DoubleX', year: 2023, director: 'Karthik Subbaraj', genre: 'Action / Comedy / Drama', imdbRating: 8.2, rating: 82, imdbId: 'tt24076326', imdbUrl: 'https://www.imdb.com/title/tt24076326/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Western Tribal Epic', category: 'Cinematic Triumph', desc: 'Tribute to Clint Eastwood, Satyajit Ray, and indigenous tribal resistance starring Raghava Lawrence and SJ Suryah.' },
      { id: 'tm-28', name: 'Aandavan Kattalai', year: 2016, director: 'M. Manikandan', genre: 'Comedy / Drama', imdbRating: 8.2, rating: 82, imdbId: 'tt6137682', imdbUrl: 'https://www.imdb.com/title/tt6137682/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Social Satire', category: 'Acclaimed Comedy', desc: 'Delightful, humane social satire on fake passport syndicates, London dreams, and suburban tenant struggles.' },
      { id: 'tm-29', name: 'Chithha', year: 2023, director: 'S.U. Arun Kumar', genre: 'Crime / Drama / Thriller', imdbRating: 8.2, rating: 82, imdbId: 'tt27532349', imdbUrl: 'https://www.imdb.com/title/tt27532349/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Emotional Thriller', category: 'Hard-Hitting Hit', desc: 'Profoundly sensitive and nerve-wracking thriller about an uncle\'s desperate quest to protect his niece.' },
      { id: 'tm-30', name: 'Gargi', year: 2022, director: 'Gautham Ramachandran', genre: 'Drama / Thriller', imdbRating: 8.1, rating: 81, imdbId: 'tt17163820', imdbUrl: 'https://www.imdb.com/title/tt17163820/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Legal Thriller', category: 'Critically Acclaimed', desc: 'Sai Pallavi’s emotionally gutting courtroom fight for justice in the face of public condemnation.' },
      { id: 'tm-31', name: 'Karnan', year: 2021, director: 'Mari Selvaraj', genre: 'Action / Drama', imdbRating: 8.1, rating: 81, imdbId: 'tt11545620', imdbUrl: 'https://www.imdb.com/title/tt11545620/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Folk Rebellion', category: 'National Hit', desc: 'Mythic rebellion of a village denied a bus stop, featuring Dhanush and Santhosh Narayanan’s folk score.' },
      { id: 'tm-32', name: 'Hey Ram', year: 2000, director: 'Kamal Haasan', genre: 'Crime / Drama / History', imdbRating: 8.0, rating: 80, imdbId: 'tt0222012', imdbUrl: 'https://www.imdb.com/title/tt0222012/', verifiedDate: '2024-11', basePrice: 2.0, role: 'Historical Drama', category: 'Cult Magnum Opus', desc: 'Daring alternate history masterpiece examining partition trauma, fanaticism, and Mahatma Gandhi.' },
    ]
  }
];

export const RANDOM_EVENTS = [
  {
    id: 'sponsorship_boost',
    title: '💰 SPONSORSHIP CASH INJECTION!',
    desc: 'A blockbuster brand sponsor has entered the arena! One franchise receives a surprise bonus to their purse!',
    type: 'purse_boost',
    apply(auction) {
      if (!auction.teams || auction.teams.length === 0) return null;
      const targetTeam = auction.teams[Math.floor(Math.random() * auction.teams.length)];
      const bonus = auction.currency.symbol === '₹' ? 5 : 500;
      targetTeam.purse += bonus;
      return {
        team: targetTeam,
        message: `${targetTeam.name} received +${auction.currency.symbol}${bonus} sponsorship boost!`
      };
    }
  },
  {
    id: 'bidding_war_frenzy',
    title: '🔥 BIDDING WAR FRENZY!',
    desc: 'The league commissioner subsidizes the current lot! High voltage bidding on this lot!',
    type: 'frenzy',
    apply() {
      return {
        message: `High voltage bidding! All bids on the current lot will reset timer and hype the arena!`
      };
    }
  },
  {
    id: 'mystery_stat_reveal',
    title: '⭐ BLOCKBUSTER FORM!',
    desc: 'Trade analysts confirm this entry has achieved +3 bonus ratings in cinematic impact!',
    type: 'scout_boost',
    apply(auction, currentItem) {
      if (currentItem) {
        currentItem.rating = Math.min(100, (currentItem.rating || 90) + 3);
        if (currentItem.imdbRating) {
          currentItem.imdbRating = Math.min(10.0, Number((currentItem.imdbRating + 0.3).toFixed(1)));
        }
      }
      return {
        message: `${currentItem?.name || 'Current Entry'} gained bonus rating points!`
      };
    }
  }
];
