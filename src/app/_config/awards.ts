import {PlayerStats} from "@/warcraft-logs/model/player-stats";

export interface Award {
    readonly name: string;
    readonly description: string;
    readonly statSort: (a: PlayerStats, b: PlayerStats) => number;
    readonly stat: (p: PlayerStats) => number;
    readonly playerFilter?: (p: PlayerStats) => boolean;
    readonly background?: string;
}

const attendance: Award = {
    name: "The True Hero",
    description: 'Total Number Of Appearances Across All Raid Nights',
    statSort: (a, b) => b.appearances('Boss') - a.appearances('Boss'),
    stat: (p) => p.appearances('Boss'),
    background: 'Amirdrassil.jpg',
}

const mostDeathsOnBoss: Award = {
    name: 'Floor POV - Boss Encounters',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    statSort: (a, b) => b.deaths('Boss') - a.deaths('Boss'),
    stat: (p) => p.deaths('Boss'),
    background: 'Raszageth.png',
};

const mostDeathsOverall: Award = {
    name: 'Floor POV - Overall',
    description: 'Most Deaths Overall Throughout All Encounters',
    statSort: (a, b) => b.deaths() - a.deaths(),
    stat: (p) => p.deaths(),
    background: 'Experiments.png',
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga - Boss Encounters',
    description: 'Most Damage Done To Bosses',
    statSort: (a, b) => b.damageDone('Boss') - a.damageDone('Boss'),
    stat: (p) => p.damageDone('Boss'),
    background: 'Fyrakk.png'
};

const mostDamageOverall: Award = {
    name: 'Unga Bunga - Overall',
    description: 'Most Damage Done Throughout All Encounters',
    statSort: (a, b) => b.damageDone() - a.damageDone(),
    stat: (p) => p.damageDone(),
    background: 'Fyrakk2.png',
};

const mostHealingOnBoss: Award = {
    name: 'Arise, My Champion - Boss Encounters',
    description: 'Most Healing Done On Boss Encounters',
    statSort: (a, b) => b.healingDone('Boss') - a.healingDone('Boss'),
    stat: (p) => p.healingDone('Boss'),
    background: 'Nymue.png',
};

const mostHealingOverall: Award = {
    name: 'Arise, My Champion - Overall',
    description: 'Most Healing Done Throughout All Encounters',
    statSort: (a, b) => b.healingDone() - a.healingDone(),
    stat: (p) => p.healingDone(),
    background: 'Amirdrassil.jpg',
};

const mostHealthStonesUsed: Award = {
    name: 'Cookie Monster',
    description: 'Most Health Stones Consumed Throughout All Encounters',
    statSort: (a, b) => b.healthStonesUsed() - a.healthStonesUsed(),
    stat: (p) => p.healthStonesUsed(),
    background: 'Volcaross.png',
};

const mostPotionsUsed: Award = {
    name: 'Hydro Homie',
    description: 'Most Potions Consumed Throughout All Encounters',
    statSort: (a, b) => b.potionsUsed() - a.potionsUsed(),
    stat: (p) => p.potionsUsed(),
    background: 'Experiments.png',
};

const mostDamageOnTrash: Award = {
    name: 'Real Parser - Damage',
    description: 'Most Damage Done To Trash',
    statSort: (a, b) => b.damageDone('Trash') - a.damageDone('Trash'),
    stat: (p) => p.damageDone('Trash'),
    background: 'Golem.png'
};

const mostHealingOnTrash: Award = {
    name: 'Real Parser - Healing',
    description: 'Most Healing Done On Trash Fights',
    statSort: (a, b) => b.healingDone('Trash') - a.healingDone('Trash'),
    stat: (p) => p.healingDone('Trash'),
    background: 'Amirdrassil.jpg',
};

const mostCasts: Award = {
    name: 'Face Roller',
    description: 'Most Casts Throughout All Encounters',
    statSort: (a, b) => b.casts() - a.casts(),
    stat: (p) => p.casts(),
    background: 'Volcaross.png',
};

const mostInterrupts: Award = {
    name: 'Wannabe Librarian',
    description: 'Most Interrupts Throughout All Encounters',
    statSort: (a, b) => b.interrupts() - a.interrupts(),
    stat: (p) => p.interrupts(),
    background: 'Golem.png',
};

const mostDispels: Award = {
    name: '24/7 Urgent Care Clinic',
    description: 'Most Dispels Throughout All Encounters',
    statSort: (a, b) => b.dispels() - a.dispels(),
    stat: (p) => p.dispels(),
    background: 'Fyrakk2.png'
};

const mostDamageTaken: Award = {
    name: 'Didn\'t Hear No Bell',
    description: 'Most Damage Taken On Boss Encounters',
    statSort: (a, b) => b.damageTaken('Boss') - a.damageTaken('Boss'),
    stat: (p) => p.damageTaken('Boss'),
    background: 'Kazarra.png',
};

const mostDamageReduced: Award = {
    name: 'Tis But A Flesh Wound',
    description: 'Most Damage Reduced On Boss Encounters',
    statSort: (a, b) => b.damageAbsorbed('Boss') - a.damageAbsorbed('Boss'),
    stat: (p) => p.damageAbsorbed('Boss'),
    background: 'Golem.png',
};

const mostPowerInfusions: Award = {
    name: 'PI Princess',
    description: 'Most Power Infusions Given',
    statSort: (a, b) => b.powerInfusions('Boss') - a.powerInfusions('Boss'),
    stat: (p) => p.powerInfusions('Boss'),
    playerFilter: (p) => p.playerClass.toLowerCase() !== 'priest',
    background: 'Amirdrassil.jpg',
};

const mostFriendlyFire: Award = {
    name: 'Double Agent',
    description: 'Most Friendly Fire Damage Done',
    statSort: (a, b) => b.friendlyFireDamageDone('Boss') - a.friendlyFireDamageDone('Boss'),
    stat: (p) => p.friendlyFireDamageDone('Boss'),
    background: 'Neltharion2.png',
};

const mostFriendlyFireDamageTaken: Award = {
    name: 'I Cant Believe You\'ve Done This',
    description: 'Most Friendly Fire Damage Taken While Mind Controlled',
    statSort: (a, b) => b.friendlyFireDamageTaken('Boss') - a.friendlyFireDamageTaken('Boss'),
    stat: (p) => p.friendlyFireDamageTaken('Boss'),
    background: 'Neltharion.png',
};

const mostDamageTakenFromFire: Award = {
    name: 'Stand In Fire, DPS Higher',
    description: 'Most Damage Taken From Fire On The Ground',
    statSort: (a, b) => b.fireDamageTaken('Boss') - a.fireDamageTaken('Boss'),
    stat: (p) => p.fireDamageTaken('Boss'),
    background: 'Neltharion2.png',
};

const mostBombDetonations: Award = {
    name: 'Bomb Squad',
    description: 'Most Number Of Bombs Detonated During Zskarn Encounter',
    statSort: (a, b) => b.bombsDetonated('Boss') - a.bombsDetonated('Boss'),
    stat: (p) => p.bombsDetonated('Boss'),
    background: 'Zskarn.png',
}

const mostMechanicsGiven: Award = {
    name: 'Mechanics Magnet',
    description: 'Target Of Mechanics That Result In DPS Loss',
    statSort: (a, b) => b.mechanicsTaken('Boss') - a.mechanicsTaken('Boss'),
    stat: (p) => p.mechanicsTaken('Boss'),
    background: 'Raszageth.png',
}

const mostDuckApplications: Award = {
    name: 'Admiral Quackers',
    description: 'Most Number Of Times Turned Into A Duck',
    statSort: (a, b) => b.duckApplications('Boss') - a.duckApplications('Boss'),
    stat: (p) => p.duckApplications('Boss'),
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

// Team realted bits, data needs to be manually passed, defaulted to damage done

// Mostly Mediocre
export const mostTikToksWatch: Award = {
    name: 'Zoomer',
    description: 'Total Number Of TikTok\'s Watched During Raid Time',
    statSort: (a, b) => b.damageDone('Boss') - a.damageDone('Boss'),
    stat: (p) => p.damageDone('Boss'),
    background: 'Raszageth.png',
}

// Shadow Hunters Gold
export const mostExtraMinutes: Award = {
    name: 'One Sec',
    description: 'Total Extra Minutes Given Even After Marking Themselves As Ready',
    statSort: (a, b) => b.damageDone('Boss') - a.damageDone('Boss'),
    stat: (p) => p.damageDone('Boss'),
    background: 'Raszageth.png',
}

// Shadow Hunters Green
export const mostReadyChecks: Award = {
    name: 'Gas Pedal',
    description: 'Total Number Of Ready Checks Spammed During Fight Explanations',
    statSort: (a, b) => b.damageDone('Boss') - a.damageDone('Boss'),
    stat: (p) => p.damageDone('Boss'),
    background: 'Raszageth.png',
}
