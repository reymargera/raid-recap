import {PlayerStats} from "@/warcraft-logs/model/player-stats";

export interface Award {
    readonly name: string;
    readonly description: string;
    readonly stat: (p: PlayerStats) => number;
    readonly playerFilter?: (p: PlayerStats) => boolean;
    readonly background?: string;
    readonly supportsAveraging?: boolean;
}

const attendance: Award = {
    name: "The True Hero",
    description: 'Total Number Of Appearances Across All Raid Nights',
    stat: (p) => p.appearances('Boss'),
    supportsAveraging: false,
    background: 'undermine/undermine-broll-1.webp',
}

const mostDeathsOnBoss: Award = {
    name: 'Floor POV',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    stat: (p) => p.deaths('Boss'),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-2.webp',
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga',
    description: 'Most Damage Done To Bosses',
    stat: (p) => p.damageDone('Boss'),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-4.webp',
};

const mostHealingOnBoss: Award = {
    name: 'Lifebinder',
    description: 'Most Healing Done On Boss Encounters',
    stat: (p) => p.healingDone('Boss'),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-5.webp',
};

const mostHealthStonesUsed: Award = {
    name: 'Cookie Monster',
    description: 'Most Health Stones Consumed Throughout All Encounters',
    stat: (p) => p.healthStonesUsed(),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-3.webp',
};

const mostPotionsUsed: Award = {
    name: 'Hydro Homie',
    description: 'Most Potions Consumed Throughout All Encounters',
    stat: (p) => p.potionsUsed(),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-1.webp',
};

const mostCasts: Award = {
    name: 'Face Roller',
    description: 'Most Casts Throughout All Encounters',
    stat: (p) => p.casts(),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-2.webp',
};

const mostInterrupts: Award = {
    name: 'Wannabe Librarian',
    description: 'Most Interrupts Throughout All Encounters',
    stat: (p) => p.interrupts(),
    supportsAveraging: true,
    background: 'undermine/stix-1.webp',
};

const mostDispels: Award = {
    name: '24/7 Urgent Care Clinic',
    description: 'Most Dispels Throughout All Encounters',
    stat: (p) => p.dispels(),
    supportsAveraging: true,
    background: 'undermine/oab-1.webp'
};

const mostDamageTaken: Award = {
    name: 'Didn\'t Hear No Bell',
    description: 'Most Damage Taken On Boss Encounters',
    stat: (p) => p.damageTaken('Boss'),
    supportsAveraging: true,
    background: 'undermine/mugzee-1.webp',
};

const mostDamageReduced: Award = {
    name: 'Tis But A Flesh Wound',
    description: 'Most Damage Reduced On Boss Encounters',
    stat: (p) => p.damageAbsorbed('Boss'),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-1.webp',
};

const mostPowerInfusions: Award = {
    name: 'PI Princess',
    description: 'Most Power Infusions Given',
    stat: (p) => p.powerInfusions('Boss'),
    playerFilter: (p) => p.playerClass.toLowerCase() !== 'priest',
    supportsAveraging: true,
    background: 'undermine/undermine-broll-2.webp',
};

const mostFriendlyFire: Award = {
    name: 'Double Agent',
    description: 'Most Friendly Fire Damage Done',
    stat: (p) => p.friendlyFireDamageDone('Boss'),
    supportsAveraging: false,
    background: 'undermine/rik-1.webp',
};

const mostFriendlyFireDamageTaken: Award = {
    name: 'I Can\'t Believe You\'ve Done This',
    description: 'Most Friendly Fire Damage Taken',
    stat: (p) => p.friendlyFireDamageTaken('Boss'),
    supportsAveraging: false,
    background: 'undermine/rik-2.webp',
};

const mostMechanicsGiven: Award = {
    name: 'Mechanics Magnet',
    description: 'Target Of Mechanics That Result In DPS Loss',
    stat: (p) => p.mechanicsTaken('Boss'),
    supportsAveraging: true,
    background: 'undermine/undermine-broll-4.webp',
};

const disenchanted: Award = {
    name: 'Disenchanted',
    description: 'Number Of Deaths From Arcano-Matrix Atomizer Energy Field',
    stat: (p) => p.getSeaontalStat('atomizerDeaths', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/plexus-1.webp',
};

const trapCardActivated: Award = {
    name: 'Trap Card Activated',
    description: 'Number Of Times Stepped On Displacement Matrix Traps',
    stat: (p) => p.getSeaontalStat('displacementMatrixApplications', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/plexus-2.webp',
};

const tangledUp: Award = {
    name: 'Tangled Up',
    description: 'Number Of Times Caught In Lair Weaving',
    stat: (p) => p.getSeaontalStat('lairWeavingApplications', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/loomithar-1.webp',
};

const hungryHungryIre: Award = {
    name: 'Hungry, Hungry, Ire',
    description: 'Number Of Devourer\'s Ire Debuff Applications',
    stat: (p) => p.getSeaontalStat('devourersIreApplications', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/soul-hunters-1.webp',
};

const nomNomNom: Award = {
    name: 'Nom Nom Nom',
    description: 'Number Of Soulrend Orbs And Prime Sequence Hits Eaten',
    stat: (p) => p.getSeaontalStat('soulrendOrbApplications', 'Boss') + p.getSeaontalStat('primeSequenceHits', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/combined-1.webp',
};

const soulMate: Award = {
    name: 'Soul Mate',
    description: 'Number Of Frailty Soul Fragments Collected',
    stat: (p) => p.getSeaontalStat('frailtyApplications', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/soul-hunters-2.webp',
};

const beamMeDownScotty: Award = {
    name: 'Beam Me Down, Scotty',
    description: 'Total Damage Taken From Refracted Entropy Beams',
    stat: (p) => p.getSeaontalStat('refractedEntropyDamage', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/fractillus-1.webp',
};

const intoTheVoid: Award = {
    name: 'Into the Void',
    description: 'Number Of Deaths From Walking Into Dimensius',
    stat: (p) => p.getSeaontalStat('oblivionDeaths', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/dimensius-1.webp',
};

const zapped: Award = {
    name: 'Zapped',
    description: 'Number Of Deaths From Overcharged Mana On Trash',
    stat: (p) => p.getSeaontalStat('overchargedManaDeaths', 'Boss'),
    supportsAveraging: false,
    background: 'manaforge/trash-1.webp',
};

// Awards not tied to any seasonal encounters and can be leveraged any time
export const StaticAwards: Award[] = [
    attendance,
    mostDamageOnBoss,
    mostHealingOnBoss,
    mostDeathsOnBoss,
    mostHealthStonesUsed,
    mostPotionsUsed,
    mostCasts,
    mostInterrupts,
    mostDispels,
    mostDamageTaken,
    mostDamageReduced,
    mostPowerInfusions,
    mostMechanicsGiven,
    mostFriendlyFire,
    mostFriendlyFireDamageTaken,
];

export const SeasonalAwards: Award[] = [
    disenchanted,
    trapCardActivated,
    tangledUp,
    hungryHungryIre,
    nomNomNom,
    soulMate,
    beamMeDownScotty,
    intoTheVoid,
    zapped,
];

export const CurrentAwards = [...StaticAwards, ...SeasonalAwards];

// Team related bits, data needs to be manually passed, defaulted to damage done

// Shadow Hunters Gold
export const mostWeakAuraOutdates: Award = {
    name: 'Yep, Im Up To Date',
    description: 'Number Of WeakAura Versions Behind When They Swore They Had The Latest Version',
    stat: (p) => p.id == 129928572 ? 11 : 0,
    playerFilter: (p) => p.id == 129928572,
    supportsAveraging: false,
};

export const mostSabatoges: Award = {
    name: 'Not Today',
    description: 'Number Of Parses Ruined By Gripping Tad Into Danger',
    stat: (p) => p.id == 252346432 ? 1 : 0,
    playerFilter: (p) => p.id == 252346432,
    supportsAveraging: false,
    background: 'undermine/rik-1.webp',
}

// Shadow Blue Team
export const mostBaddlyTimedInterupts: Award = {
    name: 'Cast Bar Enthusiast',
    description: 'Number Of Interupts On Gallywix When Explictly Told Not To',
    stat: (p) => p.id == 165314240 ? 2 : 0,
    playerFilter: (p) => p.id == 165314240,
    supportsAveraging: false,
};

// Shadow Hunters Green
export const mostIntentionalEarlyPulls: Award = {
    name: 'Well... I Was Ready',
    description: 'Total Number Of Intentional Early Pulls',
    stat: (p) => p.appearances('Boss'),
    playerFilter: (p) => p.id == 247981764 || p.id == 252513154,
    supportsAveraging: false,
    background: 'nerubar-broll-4.jpg',
}

export const TeamBits: { [key: string]: Award[]; } = {
    'shadow-hunters-gold-team': [mostWeakAuraOutdates, mostSabatoges],
    'shadow-hunters-blue-team': [mostBaddlyTimedInterupts],
};
