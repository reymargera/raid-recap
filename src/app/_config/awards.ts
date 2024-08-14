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
    background: 'Amirdrassil.jpg',
}

const mostDeathsOnBoss: Award = {
    name: 'Floor POV - Boss Encounters',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    stat: (p) => p.deaths('Boss'),
    supportsAveraging: true,
    background: 'Raszageth.png',
};

const mostDeathsOverall: Award = {
    name: 'Floor POV - Overall',
    description: 'Most Deaths Overall Throughout All Encounters',
    stat: (p) => p.deaths(),
    supportsAveraging: true,
    background: 'Experiments.png',
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga - Boss Encounters',
    description: 'Most Damage Done To Bosses',
    stat: (p) => p.damageDone('Boss'),
    supportsAveraging: true,
    background: 'Fyrakk.png'
};

const mostDamageOverall: Award = {
    name: 'Unga Bunga - Overall',
    description: 'Most Damage Done Throughout All Encounters',
    stat: (p) => p.damageDone(),
    supportsAveraging: true,
    background: 'Fyrakk2.png',
};

const mostHealingOnBoss: Award = {
    name: 'Stand In My... - Boss Encounters',
    description: 'Most Healing Done On Boss Encounters',
    stat: (p) => p.healingDone('Boss'),
    supportsAveraging: true,
    background: 'Nymue.png',
};

const mostHealingOverall: Award = {
    name: 'Stand In My... - Overall',
    description: 'Most Healing Done Throughout All Encounters',
    stat: (p) => p.healingDone(),
    supportsAveraging: true,
    background: 'Amirdrassil.jpg',
};

const mostHealthStonesUsed: Award = {
    name: 'Cookie Monster',
    description: 'Most Health Stones Consumed Throughout All Encounters',
    stat: (p) => p.healthStonesUsed(),
    supportsAveraging: true,
    background: 'Volcaross.png',
};

const mostPotionsUsed: Award = {
    name: 'Hydro Homie',
    description: 'Most Potions Consumed Throughout All Encounters',
    stat: (p) => p.potionsUsed(),
    supportsAveraging: true,
    background: 'Experiments.png',
};

const mostDamageOnTrash: Award = {
    name: 'Real Parser - Damage',
    description: 'Most Damage Done To Trash',
    stat: (p) => p.damageDone('Trash'),
    supportsAveraging: true,
    background: 'Golem.png'
};

const mostHealingOnTrash: Award = {
    name: 'Real Parser - Healing',
    description: 'Most Healing Done On Trash Fights',
    stat: (p) => p.healingDone('Trash'),
    supportsAveraging: true,
    background: 'Amirdrassil.jpg',
};

const mostCasts: Award = {
    name: 'Face Roller',
    description: 'Most Casts Throughout All Encounters',
    stat: (p) => p.casts(),
    supportsAveraging: true,
    background: 'Volcaross.png',
};

const mostInterrupts: Award = {
    name: 'Wannabe Librarian',
    description: 'Most Interrupts Throughout All Encounters',
    stat: (p) => p.interrupts(),
    supportsAveraging: true,
    background: 'Golem.png',
};

const mostDispels: Award = {
    name: '24/7 Urgent Care Clinic',
    description: 'Most Dispels Throughout All Encounters',
    stat: (p) => p.dispels(),
    supportsAveraging: true,
    background: 'Fyrakk2.png'
};

const mostDamageTaken: Award = {
    name: 'Didn\'t Hear No Bell',
    description: 'Most Damage Taken On Boss Encounters',
    stat: (p) => p.damageTaken('Boss'),
    supportsAveraging: true,
    background: 'Kazarra.png',
};

const mostDamageReduced: Award = {
    name: 'Tis But A Flesh Wound',
    description: 'Most Damage Reduced On Boss Encounters',
    stat: (p) => p.damageAbsorbed('Boss'),
    supportsAveraging: true,
    background: 'Golem.png',
};

const mostPowerInfusions: Award = {
    name: 'PI Princess',
    description: 'Most Power Infusions Given',
    stat: (p) => p.powerInfusions('Boss'),
    playerFilter: (p) => p.playerClass.toLowerCase() !== 'priest',
    supportsAveraging: true,
    background: 'Amirdrassil.jpg',
};

const mostFriendlyFire: Award = {
    name: 'Double Agent',
    description: 'Most Friendly Fire Damage Done',
    stat: (p) => p.friendlyFireDamageDone('Boss'),
    supportsAveraging: false,
    background: 'Neltharion2.png',
};

const mostFriendlyFireDamageTaken: Award = {
    name: 'I Cant Believe You\'ve Done This',
    description: 'Most Friendly Fire Damage Taken While Mind Controlled',
    stat: (p) => p.friendlyFireDamageTaken('Boss'),
    supportsAveraging: false,
    background: 'Neltharion.png',
};

const mostDamageTakenFromFire: Award = {
    name: 'Stand In Fire, DPS Higher',
    description: 'Most Damage Taken From Fire On The Ground',
    stat: (p) => p.fireDamageTaken('Boss'),
    supportsAveraging: true,
    background: 'Neltharion2.png',
};

const mostBombDetonations: Award = {
    name: 'Bomb Squad',
    description: 'Most Number Of Bombs Detonated During Zskarn Encounter',
    stat: (p) => p.bombsDetonated('Boss'),
    supportsAveraging: false,
    background: 'Zskarn.png',
}

const mostMechanicsGiven: Award = {
    name: 'Mechanics Magnet',
    description: 'Target Of Mechanics That Result In DPS Loss',
    stat: (p) => p.mechanicsTaken('Boss'),
    supportsAveraging: true,
    background: 'Raszageth.png',
}

const mostDuckApplications: Award = {
    name: 'Admiral Quackers',
    description: 'Most Number Of Times Turned Into A Duck',
    stat: (p) => p.duckApplications('Boss'),
    supportsAveraging: false,
    background: 'Ducks.jpg',
};

// Awards not tied to any seasonal encounters and can be leveraged any time
export const StaticAwards: Award[] = [
    attendance,
    mostDamageOnBoss,
    mostDamageOverall,
    mostHealingOnBoss,
    mostHealingOverall,
    mostDeathsOnBoss,
    mostDeathsOverall,
    mostHealthStonesUsed,
    mostPotionsUsed,
    mostDamageOnTrash,
    mostHealingOnTrash,
    mostCasts,
    mostInterrupts,
    mostDispels,
    mostDamageTaken,
    mostDamageReduced,
    mostPowerInfusions,
    mostMechanicsGiven,
    mostDamageTakenFromFire,
];

export const SeasonalAwards: Award[] = [
    mostFriendlyFire,
    mostFriendlyFireDamageTaken,
    mostBombDetonations,
    mostDuckApplications,
];

export const CurrentAwards = [...StaticAwards, ...SeasonalAwards];

// Team related bits, data needs to be manually passed, defaulted to damage done

// Mostly Mediocre
export const mostTikToksWatch: Award = {
    name: 'Zoomer',
    description: 'Total Number Of TikTok\'s Watched During Raid Time',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 239606790,
    supportsAveraging: false,
    background: 'Raszageth.png',
}

// Shadow Hunters Gold
export const mostExtraMinutes: Award = {
    name: 'One Sec',
    description: 'Total Extra Minutes Someone Needed, Despite Marking Themselves As Ready',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 250133977,
    supportsAveraging: false,
    background: 'Raszageth.png',
}

// Shadow Hunters Green
export const mostReadyChecks: Award = {
    name: 'Gas Pedal',
    description: 'Total Number Of Ready Checks Spammed During Fight Explanations',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 163879647 || p.id == 247519581,
    supportsAveraging: false,
    background: 'Raszageth.png',
}

export const TeamBits: { [key: string]: Award[]; } = {
    'shadow-hunters-gold-team': [mostExtraMinutes],
    'shadow-hunters-green-team': [mostReadyChecks],
    'mostly-mediocre-raid-team-1': [mostTikToksWatch],
};
