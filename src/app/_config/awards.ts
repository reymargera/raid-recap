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
    background: 'manaforge/manaforge-broll-1.webp',
}

const mostDeathsOnBoss: Award = {
    name: 'Floor POV',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    stat: (p) => p.deaths('Boss'),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-2.webp',
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga',
    description: 'Most Damage Done To Bosses',
    stat: (p) => p.damageDone('Boss'),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-4.webp',
};

const mostHealingOnBoss: Award = {
    name: 'Lifebinder',
    description: 'Most Healing Done On Boss Encounters',
    stat: (p) => p.healingDone('Boss'),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-5.webp',
};

const mostHealthStonesUsed: Award = {
    name: 'Cookie Monster',
    description: 'Most Health Stones Consumed Throughout All Encounters',
    stat: (p) => p.healthStonesUsed(),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-3.webp',
};

const mostPotionsUsed: Award = {
    name: 'Hydro Homie',
    description: 'Most Potions Consumed Throughout All Encounters',
    stat: (p) => p.potionsUsed(),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-6.webp',
};

const mostCasts: Award = {
    name: 'Face Roller',
    description: 'Most Casts Throughout All Encounters',
    stat: (p) => p.casts(),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-7.webp',
};

const mostInterrupts: Award = {
    name: 'Wannabe Librarian',
    description: 'Most Interrupts Throughout All Encounters',
    stat: (p) => p.interrupts(),
    supportsAveraging: true,
    background: 'manaforge/forgeweaver-1.webp',
};

const mostDispels: Award = {
    name: '24/7 Urgent Care Clinic',
    description: 'Most Dispels Throughout All Encounters',
    stat: (p) => p.dispels(),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-10.webp'
};

const mostDamageTaken: Award = {
    name: 'Didn\'t Hear No Bell',
    description: 'Most Damage Taken On Boss Encounters',
    stat: (p) => p.damageTaken('Boss'),
    supportsAveraging: true,
    background: 'manaforge/dimensius-1.webp',
};

const mostDamageReduced: Award = {
    name: 'Tis But A Flesh Wound',
    description: 'Most Damage Reduced On Boss Encounters',
    stat: (p) => p.damageAbsorbed('Boss'),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-8.webp',
};

const mostPowerInfusions: Award = {
    name: 'PI Princess',
    description: 'Most Power Infusions Given',
    stat: (p) => p.powerInfusions('Boss'),
    playerFilter: (p) => p.playerClass.toLowerCase() !== 'priest',
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-2.webp',
};

const mostFriendlyFire: Award = {
    name: 'Double Agent',
    description: 'Most Friendly Fire Damage Done',
    stat: (p) => p.friendlyFireDamageDone('Boss'),
    supportsAveraging: false,
    background: 'manaforge/nexus-king-1.webp',
};

const mostFriendlyFireDamageTaken: Award = {
    name: 'I Can\'t Believe You\'ve Done This',
    description: 'Most Friendly Fire Damage Taken',
    stat: (p) => p.friendlyFireDamageTaken('Boss'),
    supportsAveraging: false,
    background: 'manaforge/nexus-king-1.webp',
};

const mostMechanicsGiven: Award = {
    name: 'Mechanics Magnet',
    description: 'Target Of Mechanics That Result In DPS Loss',
    stat: (p) => p.mechanicsTaken('Boss'),
    supportsAveraging: true,
    background: 'manaforge/manaforge-broll-4.webp',
};

const beamed: Award = {
    name: 'Beamed',
    description: 'Number Of Deaths From Beam Mechanics This Tier',
    stat: (p) => p.getSeaontalStat('beamDeaths', 'Boss'),
    supportsAveraging: false,
};

const momPickMeUp: Award = {
    name: 'Mom Pick Me Up Im Scared',
    description: 'Number Of Times Feared',
    stat: (p) => p.getSeaontalStat('fearApplications', 'Boss'),
    supportsAveraging: false,
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
    beamed,
    momPickMeUp,
];

export const CurrentAwards = [...StaticAwards, ...SeasonalAwards];

// Team related bits, data needs to be manually passed, defaulted to damage done

// Shadow Hunters Gold
export const mostWeakAuraOutdates: Award = {
    name: 'AKDLJVCFWOIHNSDU',
    description: 'Number Of Time Someones Mic Completely Crapped Out',
    stat: (p) => p.id == 247519581 ? 36 : 0,
    playerFilter: (p) => p.id == 247519581,
    supportsAveraging: false,
    background: 'manaforge/manaforge-broll-10.webp',
};

export const mostSabatoges: Award = {
    name: 'Not Today',
    description: 'Number Of Attempts To Grip Tad Off A Bridge',
    stat: (p) => p.id == 259802310 ? p.appearances() : 0,
    playerFilter: (p) => p.id == 259802310,
    supportsAveraging: false,
    background: 'manaforge/manaforge-broll-10.webp',
}


export const TeamBits: { [key: string]: Award[]; } = {
    'shadow-hunters-gold-team': [mostWeakAuraOutdates],
    'shadow-hunters-green-team': [mostSabatoges]
};
