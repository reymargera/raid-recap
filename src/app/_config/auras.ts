export const DpsLossDebuffs = [
    // Placeholder for future DPS loss debuffs
];

// Plexus Sentinel
export const ArcanomatrixAtomizer = 1217649;
export const DisplacementMatrix = 1218625;

// Loom'ithar
export const LairWeaving = 1237272;

// Soulbinder Naazindhri
export const SoulrendOrb = 1226827;

// The Soul Hunters
export const DevourersIre = 1222232;
export const Frailty = 1241946;

// Forgeweaver Araz
export const PrimeSequence = 1237322;

// Fractillus
export const RefractedEntropy = 1241137;

// Dimensius
export const Oblivion = 1229327;

// Trash
export const OverchargedMana = 1237718;

export const PowerInfusion = 10060;

// Midnight Season 1 - "Beamed" (deaths from beam mechanics across the tier)
// Imperator Averzian (Voidspire)
export const OblivionsWrath = 1260712;
// Vorasius (Voidspire)
export const VoidBreath = 1256855;
// Fallen-King Salhadaar (Voidspire)
export const UmbralBeams = 1260015;
// Vaelgor & Ezzorak (Voidspire)
export const Nullbeam = 1262623;
// Midnight Falls (March on Quel'Danas) - same ability, two IDs
export const DarkQuasar = 1279420;
export const DarkQuasarAlt = 1285561;

export const BeamedAbilities = [
    OblivionsWrath,
    VoidBreath,
    UmbralBeams,
    Nullbeam,
    DarkQuasar,
    DarkQuasarAlt,
];

// Midnight Season 1 - "Mom pick me up im scared" (fear applications)
// Chimaerus the Undreamt God (Dreamrift) - Fearsome Cry
export const FearsomeCry = 1265940;
// Vaelgor & Ezzorak (Voidspire) - Dread Breath
export const DreadBreath = 1255979;

export const FearApplicationAbilities = [
    FearsomeCry,
    DreadBreath,
];

export const TrackedDebuffs = [
    ...DpsLossDebuffs,
    DisplacementMatrix,
    LairWeaving,
    SoulrendOrb,
    DevourersIre,
    Frailty,
    PowerInfusion,
];
