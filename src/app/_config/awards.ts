import {PlayerStats} from "@/warcraft-logs/model/player-stats";

export interface Award {
    readonly name: string;
    readonly description: string;
    readonly statSort: (a: PlayerStats, b: PlayerStats) => number;
    readonly stat: (p: PlayerStats) => number;
}

const mostDeathsOnBoss: Award = {
    name: 'Floor POV (Boss)',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    statSort: (a, b) => b.deaths('Boss') - a.deaths('Boss'),
    stat: (p) => p.deaths('Boss'),
};

const mostDeathsOverall: Award = {
    name: 'Floor POV Overall',
    description: 'Most Deaths Overall Throughout All Encounters',
    statSort: (a, b) => b.deaths() - a.deaths(),
    stat: (p) => p.deaths(),
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga (Boss)',
    description: 'Most Damage Done To Bosses',
    statSort: (a, b) => b.damageDone('Boss') - a.damageDone('Boss'),
    stat: (p) => p.damageDone('Boss'),
};

const mostDamageOverall: Award = {
    name: 'Unga Bunga Overall',
    description: 'Most Damage Done Throughout All Encounters',
    statSort: (a, b) => b.damageDone() - a.damageDone(),
    stat: (p) => p.damageDone(),
};

const mostHealingOnBoss: Award = {
    name: '--- (Boss)',
    description: 'Most Healing Done On Boss Encounters',
    statSort: (a, b) => b.healingDone('Boss') - a.healingDone('Boss'),
    stat: (p) => p.healingDone('Boss'),
};

const mostHealingOverall: Award = {
    name: '--- Overall',
    description: 'Most Healing Done Throughout All Encounters',
    statSort: (a, b) => b.healingDone() - a.healingDone(),
    stat: (p) => p.healingDone(),
};

const mostHealthStonesUsed: Award = {
    name: 'Cookie Monster',
    description: 'Most Health Stones Consumed Throughout All Encounters',
    statSort: (a, b) => b.healthStonesUsed() - a.healthStonesUsed(),
    stat: (p) => p.healthStonesUsed(),
};

const mostPotionsUsed: Award = {
    name: 'Hydro Homie',
    description: 'Most Potions Consumed Throughout All Encounters',
    statSort: (a, b) => b.potionsUsed() - a.potionsUsed(),
    stat: (p) => p.potionsUsed(),
};

const mostDamageOnTrash: Award = {
    name: 'Real Parsers (DPS)',
    description: 'Most Damage Done To Trash',
    statSort: (a, b) => b.damageDone('Trash') - a.damageDone('Trash'),
    stat: (p) => p.damageDone('Trash'),
};

const mostHealingOnTrash: Award = {
    name: 'Real Parsers (Heals)',
    description: 'Most Healing Done On Trash Fights',
    statSort: (a, b) => b.healingDone('Trash') - a.healingDone('Trash'),
    stat: (p) => p.healingDone('Trash'),
};

const mostCasts: Award = {
    name: 'Face Roller',
    description: 'Most Casts Throughout All Encounters',
    statSort: (a, b) => b.casts() - a.casts(),
    stat: (p) => p.casts(),
};

const mostInterrupts: Award = {
    name: 'Wannabe Librarian',
    description: 'Most Interrupts Throughout All Encounters',
    statSort: (a, b) => b.interrupts() - a.interrupts(),
    stat: (p) => p.interrupts(),
};

const mostDispels: Award = {
    name: '24/7 Urgent Care Clinic',
    description: 'Most Dispels Throughout All Encounters',
    statSort: (a, b) => b.dispels() - a.dispels(),
    stat: (p) => p.dispels(),
};

const mostDamageTaken: Award = {
    name: 'Meat Shield',
    description: 'Most Damage Taken On Boss Encounters',
    statSort: (a, b) => b.damageTaken('Boss') - a.damageTaken('Boss'),
    stat: (p) => p.damageTaken('Boss'),
};

const mostDamageReduced: Award = {
    name: 'Tis But A Flesh Wound',
    description: 'Most Damage Reduced On Boss Encounters',
    statSort: (a, b) => b.damageAbsorbed('Boss') - a.damageAbsorbed('Boss'),
    stat: (p) => p.damageAbsorbed('Boss'),
};




// Awards not tied to any seasonal encounters and can be leveraged any time
export const StaticAwards: Award[] = [
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
];

// TODO: Awards tied to current season
export const SeasonalAwards: Award[] = [];

export const CurrentAwards = [...StaticAwards, ...SeasonalAwards];
