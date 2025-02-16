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
    name: 'Floor POV',
    description: 'Most Deaths On Boss Fights Before Wipe Is Called',
    stat: (p) => p.deaths('Boss'),
    supportsAveraging: true,
    background: 'Raszageth.png',
};

const mostDamageOnBoss: Award = {
    name: 'Unga Bunga',
    description: 'Most Damage Done To Bosses',
    stat: (p) => p.damageDone('Boss'),
    supportsAveraging: true,
    background: 'Fyrakk.png'
};

const mostHealingOnBoss: Award = {
    name: 'Stand In My... - Boss Encounters',
    description: 'Most Healing Done On Boss Encounters',
    stat: (p) => p.healingDone('Boss'),
    supportsAveraging: true,
    background: 'Nymue.png',
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

const mostMechanicsGiven: Award = {
    name: 'Mechanics Magnet',
    description: 'Target Of Mechanics That Result In DPS Loss',
    stat: (p) => p.mechanicsTaken('Boss'),
    supportsAveraging: true,
    background: 'Raszageth.png',
}

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
];

export const SeasonalAwards: Award[] = [
    // Somehow can still be relevant across seasons due to things like blessing of sacrifice
    mostFriendlyFire,
    mostFriendlyFireDamageTaken,
];

export const CurrentAwards = [...StaticAwards, ...SeasonalAwards];

// Team related bits, data needs to be manually passed, defaulted to damage done

// Shadow Hunters Gold
export const mostNameChanges: Award = {
    name: 'A Girl Has No Name',
    description: 'Total Number Of Name Changes During The Season',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 247286065,
    supportsAveraging: false,
    background: 'Raszageth.png',
}

export const mostAggroStrips: Award = {
    name: 'So Anyways, I Started Blasting',
    description: 'Total Number Of Times Aggro Was Stripped Due To Lack Of Threat Meters',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 163879647,
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

export const mostIntentionalEarlyPulls: Award = {
    name: 'Well... I Was Ready',
    description: 'Total Number Of Intentional Early Pulls',
    stat: (p) => p.damageDone('Boss'),
    playerFilter: (p) => p.id == 247981764 || p.id == 252513154,
    supportsAveraging: false,
    background: 'Raszageth.png',
}

export const TeamBits: { [key: string]: Award[]; } = {
    'shadow-hunters-gold-team': [mostNameChanges, mostAggroStrips],
    'shadow-hunters-green-team': [mostReadyChecks, mostIntentionalEarlyPulls],
};
