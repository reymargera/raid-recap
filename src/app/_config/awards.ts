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

const mostTimeStoodInTrash: Award = {
    name: 'You Are Where You Stand',
    description: 'Number Of Times Stood On Trash',
    stat: (p) => p.getSeaontalStat('timesStoodInTrash', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/stix-1.webp'
};

const mostTimesRolledOver: Award = {
    name: 'Road Kill',
    description: 'Number Of Times Rolled Over By Rolling Rubbish',
    stat: (p) => p.getSeaontalStat('timesRolledOver', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/stix-1.webp'
};

const mostTimesRollingOver: Award = {
    name: 'I Merge Now.. GL Everyone Else',
    description: 'Number Of Times Rolling Someone Over With Rolling Rubbish',
    stat: (p) => p.getSeaontalStat('timesRollingOver', 'Boss'),
    background: 'undermine/stix-1.webp',
    supportsAveraging: false,
};

const mostTimesScrewed: Award = {
    name: 'Screwed Up',
    description: 'Number Of Times Screwed Up',
    stat: (p) => p.getSeaontalStat('timesScrewed', 'Boss'),
    background: 'undermine/sprocket-1.webp',
    supportsAveraging: false,
};

const mostHighRollerUptime: Award = {
    name: 'Buffy The Slot Machine Slayer',
    description: 'Total Time With High Roller Debuff',
    stat: (p) => p.getSeaontalStat('highRollerUptime', 'Boss'),
    background: 'undermine/oab-1.webp',
    supportsAveraging: false,
};

const mostTimesCrushed: Award = {
    name: 'Bank Rolled',
    description: 'Number Of Times Ran Over By A Payline',
    stat: (p) => p.getSeaontalStat('timesCrushed', 'Boss'),
    background: 'undermine/oab-1.webp',
    supportsAveraging: false,
};

const mostCoinsPushed: Award = {
    name: 'Penny Pusher',
    description: 'Number Of Paylines Kicked Off',
    stat: (p) => p.getSeaontalStat('coinsPushed', 'Boss'),
    background: 'undermine/oab-1.webp',
    supportsAveraging: false,
};

const mostBombsTossed: Award = {
    name: 'Bomb Voyage',
    description: 'Number Of Bombs Tossed Off Gally\'s Platform',
    stat: (p) => p.getSeaontalStat('bombsTossed', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/undermine-broll-2.webp',
};

const mostCoilsDestroyed: Award = {
    name: 'The Conductor',
    description: 'Number Of Giga Coils Destroyed With Bombs',
    stat: (p) => p.getSeaontalStat('coilsDestroyed', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/undermine-broll-2.webp',
};

const mostTimesFlattened: Award = {
    name: 'Everyone Gets One But Somehow You Got Many',
    description: 'Number Of Times Flattened By Vexie',
    stat: (p) => p.getSeaontalStat('timesFlattened', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/vexie-gear-grind-2.webp',
};

const mostBlazeOfGloryCasts: Award = {
    name: 'Born To Be Wild',
    description: 'Number Of Motorcycles Crashed Into The Boss',
    stat: (p) => p.getSeaontalStat('blazeOfGloryCasts', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/vexie-gear-grind-2.webp',
};

const mostStaticDischargeApplications: Award = {
    name: 'Energizer Bunny',
    description: 'Number Of Times Stunned By Static Discharge From Moving Too Much',
    stat: (p) => p.getSeaontalStat('staticDischargeApplications', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/cauldron-1.webp',
};

const mostBlastburnRoarcannonDeaths: Award = {
    name: 'Deer In The Headlights',
    description: 'Number Of Times Stood In Florendo\'s Lazer',
    stat: (p) => p.getSeaontalStat('blastburnRoarcannonDeaths', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/cauldron-1.webp',
};

const mostUnstableShrapnelApplications: Award = {
    name: 'Demolition Expert',
    description: 'Number Of Mines Popped While Fighting Lockenstock',
    stat: (p) => p.getSeaontalStat('unstableShrapnelApplications', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/sprocket-1.webp',
};

const mostHitAndRuns: Award = {
    name: 'Why Did The Raider Cross The Road...',
    description: 'Number Of Times Killed In Undermine Traffic',
    stat: (p) => p.getSeaontalStat('hitAndRuns', 'Boss'),
    supportsAveraging: false,
    background: 'undermine/stix-1.webp',
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
    mostTimeStoodInTrash,
    mostTimesRolledOver,
    mostTimesRollingOver,
    mostTimesScrewed,
    mostHighRollerUptime,
    mostTimesCrushed,
    mostCoinsPushed,
    mostBombsTossed,
    mostCoilsDestroyed,
    mostTimesFlattened,
    mostBlazeOfGloryCasts,
    mostStaticDischargeApplications,
    mostBlastburnRoarcannonDeaths,
    mostUnstableShrapnelApplications,
    mostHitAndRuns,
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
    'shadow-hunters-green-team': [mostIntentionalEarlyPulls],
    'shadow-hunters-blue-team': [mostBaddlyTimedInterupts],
};
