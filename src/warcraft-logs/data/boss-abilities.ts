/**
 * Boss ability categorization and tagging system
 * Maps encounter IDs to their abilities with metadata tags for filtering and analysis
 */

// Ability tags for categorization and filtering
export enum AbilityTag {
    // Avoidability
    Avoidable = 'Avoidable',
    Unavoidable = 'Unavoidable',

    // Damage Type
    DoT = 'DoT',
    AoE = 'AoE',
    Frontal = 'Frontal',
    Targeted = 'Targeted',

    // Special Mechanics
    Mechanic = 'Mechanic',
    GroundHazard = 'GroundHazard',
    LossOfControl = 'LossOfControl',
    TankBuster = 'TankBuster',
    Soak = 'Soak',
    Ramping = 'Ramping',
}

// Metadata about a single boss ability
export interface BossAbilityInfo {
    guid: number;
    name: string;
    tags: AbilityTag[];
}

// Boss encounter ID mapping to encounter name (Manaforge Omega)
const BossNames = {
    3129: 'Plexus Sentinel',
    3131: 'Loom\'ithar',
    3130: 'Soulbinder Naazindhri',
    3132: 'Forgeweaver Araz',
    3122: 'The Soul Hunters',
    3133: 'Fractillus',
    3134: 'Nexus-King Salhadaar',
    3135: 'Dimensius, the All-Devouring',
} as const;

export type BossEncounterId = keyof typeof BossNames;

// Map of boss encounter ID → array of abilities with metadata
export const BOSS_ABILITIES = new Map<BossEncounterId, BossAbilityInfo[]>([
    [3129, [ // Plexus Sentinel
        { guid: 1233292, name: 'Accretion Disk', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1243702, name: 'Antimatter', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic, AbilityTag.Soak] },
        { guid: 1243704, name: 'Antimatter', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic, AbilityTag.Soak] },
        { guid: 1219248, name: 'Arcane Radiation', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1219223, name: 'Atomize', tags: [AbilityTag.Mechanic, AbilityTag.Avoidable] },
        { guid: 1218625, name: 'Displacement Matrix', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard, AbilityTag.Mechanic, AbilityTag.LossOfControl] },
        { guid: 1218626, name: 'Displacement Matrix', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard, AbilityTag.Mechanic, AbilityTag.LossOfControl] },
        { guid: 1219611, name: 'Eradicating Salvo', tags: [AbilityTag.Mechanic, AbilityTag.Soak] },
        { guid: 1241142, name: 'Eradicating Salvo', tags: [AbilityTag.Mechanic, AbilityTag.Soak] },
        { guid: 1219471, name: 'Expulsion Zone', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.LossOfControl] },
        { guid: 1246113, name: 'Expulsion Zone', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.LossOfControl] },
        { guid: 1226752, name: 'Manifest Matrices', tags: [AbilityTag.Mechanic, AbilityTag.Targeted, AbilityTag.DoT, AbilityTag.Unavoidable] },
        { guid: 1219346, name: 'Obliteration Arcanocannon', tags: [AbilityTag.Mechanic, AbilityTag.TankBuster, AbilityTag.AoE, AbilityTag.Unavoidable] },
        { guid: 1233110, name: 'Purging Lightning', tags: [AbilityTag.AoE, AbilityTag.Unavoidable, AbilityTag.Ramping] },
        { guid: 1224305, name: 'Protocol: Purge', tags: [] },
        { guid: 1219354, name: 'Potent Mana Residue', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard, AbilityTag.LossOfControl] },
        { guid: 1219687, name: 'Powered Automaton', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable] },
        { guid: 1235816, name: 'Energy Overload', tags: [AbilityTag.Unavoidable, AbilityTag.Ramping, AbilityTag.AoE] },
        { guid: 1227794, name: 'Arcane Lightning', tags: [AbilityTag.Avoidable, AbilityTag.Mechanic] },
    ]],
    [3131, [ // Loom'ithar
        { guid: 1243771, name: 'Arcane Ichor', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1227784, name: 'Arcane Outrage', tags: [AbilityTag.AoE, AbilityTag.Unavoidable, AbilityTag.LossOfControl] },
        { guid: 1243908, name: 'Arcane Outrage', tags: [AbilityTag.AoE, AbilityTag.Unavoidable, AbilityTag.LossOfControl] },
        { guid: 1231469, name: 'Arcane Overflow', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.LossOfControl] },
        { guid: 1247029, name: 'Excess Nova', tags: [AbilityTag.Mechanic, AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1237307, name: 'Lair Weaving', tags: [AbilityTag.Mechanic, AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1226366, name: 'Living Silk', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard, AbilityTag.LossOfControl] },
        { guid: 1226395, name: 'Overinfusion Burst', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1226394, name: 'Overinfusion Burst', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1227742, name: 'Piercing Strand', tags: [AbilityTag.Avoidable, AbilityTag.Mechanic, AbilityTag.Frontal, AbilityTag.TankBuster] },
        { guid: 1226877, name: 'Primal Spellstorm', tags: [AbilityTag.Avoidable] },
        { guid: 1231403, name: 'Silk Blast', tags: [AbilityTag.Unavoidable] },
        { guid: 1228069, name: 'Unbound Rage', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.LossOfControl] },
        { guid: 1227140, name: 'Writhing Wave', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.Frontal] },
        { guid: 1227163, name: 'Writhing Wave', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.Frontal] },
        { guid: 1250103, name: 'Infusion Pylons', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.Ramping] },
        { guid: 1238197, name: 'Infusion Tether', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.Ramping, AbilityTag.Mechanic] },
    ]],
    [3130, [ // Soulbinder Naazindhri
        { guid: 1242086, name: 'Arcane Energy', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1223859, name: 'Arcane Expulsion', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.Mechanic, AbilityTag.LossOfControl] },
        { guid: 1242071, name: 'Arcane Expulsion', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.Mechanic, AbilityTag.LossOfControl] },
        { guid: 1242088, name: 'Arcane Expulsion', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.Mechanic, AbilityTag.LossOfControl] },
        { guid: 1243272, name: 'Containment Breach', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1227848, name: 'Essence Implosion', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1237629, name: 'Mystic Lash', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable, AbilityTag.Ramping] },
        { guid: 1235246, name: 'Phase Blades', tags: [AbilityTag.Unavoidable] },
        { guid: 1240763, name: 'Spellburn', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1249065, name: 'Soulfire Convergence', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1227277, name: 'Soulfray Annihilation', tags: [AbilityTag.Mechanic, AbilityTag.Avoidable, AbilityTag.Targeted] },
        { guid: 1226827, name: 'Soulrend Orb', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1227052, name: 'Void Burst', tags: [AbilityTag.Targeted, AbilityTag.DoT, AbilityTag.Unavoidable] },
        { guid: 1227051, name: 'Voidblade Ambush', tags: [AbilityTag.Mechanic, AbilityTag.Avoidable, AbilityTag.Targeted] },
    ]],
    [3132, [ // Forgeweaver Araz
        { guid: 1226260, name: 'Arcane Convergence', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1228103, name: 'Arcane Siphon', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1228218, name: 'Arcane Obliteration', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic, AbilityTag.Soak, AbilityTag.AoE] },
        { guid: 1240708, name: 'Astral Burn', tags: [AbilityTag.Unavoidable, AbilityTag.Ramping] },
        { guid: 1244998, name: 'Astral Harvest', tags: [AbilityTag.Targeted, AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1236207, name: 'Astral Surge', tags: [AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1233074, name: 'Crushing Darkness', tags: [AbilityTag.Avoidable] },
        { guid: 1233301, name: 'Dark Singularity', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.LossOfControl] },
        { guid: 1248009, name: 'Dark Terminus', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1232221, name: 'Death Throes', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.LossOfControl] },
        { guid: 1238878, name: 'Echoing Tempest', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1232412, name: 'Focusing Iris', tags: [AbilityTag.Avoidable] },
        { guid: 1228510, name: 'Overwhelming Power', tags: [AbilityTag.Unavoidable, AbilityTag.TankBuster, AbilityTag.Ramping] },
        { guid: 1234324, name: 'Photon Blast', tags: [AbilityTag.Avoidable] },
        { guid: 1237322, name: 'Prime Sequence', tags: [AbilityTag.Avoidable] },
        { guid: 1228168, name: 'Silencing Tempest', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1232409, name: 'Unstable Surge', tags: [AbilityTag.Avoidable] },
        { guid: 1248171, name: 'Void Tear', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1243641, name: 'Void Surge', tags: [AbilityTag.Avoidable] },
        { guid: 1245002, name: 'Void Harvest', tags: [AbilityTag.Targeted, AbilityTag.Mechanic, AbilityTag.Unavoidable] },
    ]],
    [3122, [ // The Soul Hunters
        { guid: 1237767, name: 'Adarus\' Soul', tags: [AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1241306, name: 'Blade Dance', tags: [AbilityTag.Avoidable] },
        { guid: 1233103, name: 'Collapsing Star', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1233104, name: 'Collapsing Star', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1235158, name: 'Consume', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic, AbilityTag.DoT, AbilityTag.Ramping] },
        { guid: 1226330, name: 'Devourer\'s Ire', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1226539, name: 'Devourer\'s Ire', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1235045, name: 'Encroaching Oblivion', tags: [AbilityTag.GroundHazard, AbilityTag.Mechanic] },
        { guid: 1245726, name: 'Eradicate', tags: [AbilityTag.Avoidable, AbilityTag.Frontal] },
        { guid: 1233968, name: 'Event Horizon', tags: [AbilityTag.Avoidable] },
        { guid: 1242304, name: 'Expulsed Soul', tags: [AbilityTag.Avoidable, AbilityTag.Mechanic, AbilityTag.AoE, AbilityTag.Ramping] },
        { guid: 1221477, name: 'Eye Beam', tags: [AbilityTag.Avoidable, AbilityTag.Frontal, AbilityTag.TankBuster] },
        { guid: 1227119, name: 'Fel Devastation', tags: [AbilityTag.Frontal, AbilityTag.Avoidable] },
        { guid: 1223725, name: 'Fel Inferno', tags: [AbilityTag.Avoidable, AbilityTag.Ramping, AbilityTag.DoT] },
        { guid: 1245384, name: 'Fel Inferno', tags: [AbilityTag.Avoidable, AbilityTag.Ramping, AbilityTag.DoT] },
        { guid: 1223080, name: 'Fel Rush', tags: [AbilityTag.Targeted, AbilityTag.Avoidable, AbilityTag.Mechanic] },
        { guid: 1225130, name: 'Felblade', tags: [AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1241833, name: 'Fracture', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable] },
        { guid: 1254762, name: 'Frailty', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1225155, name: 'Immolation Aura', tags: [AbilityTag.AoE, AbilityTag.Unavoidable] },
        { guid: 1227340, name: 'Infernal Strike', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1227685, name: 'Hungering Slash', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1237760, name: 'Ilyssa\'s Soul', tags: [AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1243162, name: 'Soul Tether', tags: [AbilityTag.Avoidable, AbilityTag.Mechanic] },
        { guid: 1242259, name: 'Spirit Bomb', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1227823, name: 'The Hunt', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1227846, name: 'The Hunt', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1233105, name: 'Dark Residue', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic, AbilityTag.DoT, AbilityTag.Ramping] },
        { guid: 1237743, name: 'Velaryn\'s Soul', tags: [AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1237205, name: 'Voidstep', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
    ]],
    [3133, [ // Fractillus
        { guid: 1232760, name: 'Crystal Lacerations', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1224414, name: 'Crystalline Shockwave', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1226823, name: 'Crystalline Shockwave', tags: [AbilityTag.Avoidable, AbilityTag.AoE] },
        { guid: 1225210, name: 'Enraged Tantrum', tags: [AbilityTag.Avoidable] },
        { guid: 1232130, name: 'Nexus Shrapnel', tags: [AbilityTag.Avoidable] },
        { guid: 1247424, name: 'Null Consumption', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable] },
        { guid: 1247495, name: 'Null Explosion', tags: [AbilityTag.Avoidable, AbilityTag.Targeted, AbilityTag.Mechanic, AbilityTag.AoE] },
        { guid: 1241137, name: 'Refracted Entropy', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1227676, name: 'Shard Slam', tags: [AbilityTag.Unavoidable] },
        { guid: 1220394, name: 'Shattering Backhand', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.LossOfControl] },
        { guid: 1227373, name: 'Shattershell', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1231871, name: 'Shockwave Slam', tags: [AbilityTag.Unavoidable, AbilityTag.TankBuster] },
    ]],
    [3134, [ // Nexus-King Salhadaar
        { guid: 1225445, name: 'Atomized', tags: [AbilityTag.GroundHazard, AbilityTag.Avoidable] },
        { guid: 1227554, name: 'Banishment', tags: [AbilityTag.Unavoidable, AbilityTag.Targeted, AbilityTag.DoT] },
        { guid: 1227562, name: 'Banishment', tags: [AbilityTag.Unavoidable, AbilityTag.Targeted, AbilityTag.DoT] },
        { guid: 1224840, name: 'Behead', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1227472, name: 'Besiege', tags: [AbilityTag.Avoidable] },
        { guid: 1227897, name: 'Coalesce Voidwing', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1224791, name: 'Conquer', tags: [AbilityTag.TankBuster, AbilityTag.Mechanic, AbilityTag.Soak, AbilityTag.Unavoidable] },
        { guid: 1224794, name: 'Conquer', tags: [AbilityTag.TankBuster, AbilityTag.Mechanic, AbilityTag.Soak, AbilityTag.Unavoidable] },
        { guid: 1234529, name: 'Cosmic Maw', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1234902, name: 'Cosmic Maw', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1231097, name: 'Cosmic Rip', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard] },
        { guid: 1224734, name: 'Decree: Oath-Bound', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1236872, name: 'Dimension Breath', tags: [AbilityTag.Avoidable] },
        { guid: 1234541, name: 'Dimension Glare', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.Mechanic] },
        { guid: 1232403, name: 'Dread Mortar', tags: [AbilityTag.Avoidable] },
        { guid: 1225452, name: 'Dark Star', tags: [AbilityTag.Avoidable] },
        { guid: 1225331, name: 'Galactic Smash', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable] },
        { guid: 1228280, name: 'King\'s Hunger', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1252449, name: 'King\'s Thrall', tags: [AbilityTag.Avoidable, AbilityTag.AoE, AbilityTag.Mechanic] },
        { guid: 1234906, name: 'Nexus Collapse', tags: [AbilityTag.Avoidable, AbilityTag.Mechanic, AbilityTag.AoE] },
        { guid: 1224764, name: 'Oath-Breaker', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.Mechanic] },
        { guid: 1228056, name: 'Reap', tags: [AbilityTag.Targeted, AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1230302, name: 'Self-Destruct', tags: [AbilityTag.Avoidable, AbilityTag.AoE, AbilityTag.Mechanic] },
        { guid: 1232392, name: 'Seal the Forge', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1226042, name: 'Starkiller Nova', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable] },
        { guid: 1226360, name: 'Starkiller Swing', tags: [AbilityTag.Targeted, AbilityTag.Mechanic, AbilityTag.Avoidable] },
        { guid: 1226418, name: 'Starshattered', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable] },
        { guid: 1226363, name: 'Twilight Scar', tags: [AbilityTag.Targeted, AbilityTag.Avoidable, AbilityTag.DoT] },
        { guid: 1225645, name: 'Twilight Spikes', tags: [AbilityTag.Avoidable] },
        { guid: 1224825, name: 'Tyranny', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1224814, name: 'Vanquish', tags: [AbilityTag.Frontal, AbilityTag.TankBuster, AbilityTag.Avoidable, AbilityTag.Mechanic] },
        { guid: 1233702, name: 'Vanquish', tags: [AbilityTag.Frontal, AbilityTag.TankBuster, AbilityTag.Avoidable, AbilityTag.Mechanic] },
        { guid: 1228119, name: 'Netherbreaker', tags: [AbilityTag.Unavoidable, AbilityTag.Targeted, AbilityTag.Mechanic] },
        { guid: 1247213, name: 'Fractal Claw', tags: [AbilityTag.Avoidable] },
    ]],
    [3135, [ // Dimensius, the All-Devouring
        { guid: 1237097, name: 'Astrophysical Jet', tags: [AbilityTag.Avoidable] },
        { guid: 1237098, name: 'Astrophysical Jet', tags: [AbilityTag.Avoidable] },
        { guid: 1237080, name: 'Broken World', tags: [AbilityTag.Avoidable] },
        { guid: 1234269, name: 'Cosmic Collapse', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1228368, name: 'Cosmic Radiation', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1232895, name: 'Cosmic Radiation', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1237775, name: 'Cosmic Radiation', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1231002, name: 'Dark Energy', tags: [AbilityTag.Avoidable, AbilityTag.GroundHazard, AbilityTag.LossOfControl] },
        { guid: 1230999, name: 'Dark Matter', tags: [AbilityTag.Avoidable] },
        { guid: 1237696, name: 'Debris Field', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl, AbilityTag.GroundHazard] },
        { guid: 1243373, name: 'Devour', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1245289, name: 'Devour', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1238773, name: 'Extinction', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl] },
        { guid: 1232391, name: 'Extinguish The Stars', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1231194, name: 'Fission', tags: [AbilityTag.Unavoidable] },
        { guid: 1227665, name: 'Fists of the Voidlord', tags: [AbilityTag.Unavoidable] },
        { guid: 1243055, name: 'Fists of the Voidlord', tags: [AbilityTag.Unavoidable] },
        { guid: 1237325, name: 'Gamma Burst', tags: [AbilityTag.Unavoidable, AbilityTag.AoE, AbilityTag.LossOfControl] },
        { guid: 1232394, name: 'Gravity Well', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1237694, name: 'Mass Ejection', tags: [AbilityTag.Avoidable, AbilityTag.Frontal, AbilityTag.LossOfControl] },
        { guid: 1231195, name: 'Massive Smash', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable] },
        { guid: 1242095, name: 'Massive Smash', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable] },
        { guid: 1249206, name: 'Massive Smash', tags: [AbilityTag.TankBuster, AbilityTag.Unavoidable] },
        { guid: 1246542, name: 'Null Binding', tags: [AbilityTag.Avoidable, AbilityTag.DoT, AbilityTag.Ramping, AbilityTag.LossOfControl] },
        { guid: 1249077, name: 'Oblivion', tags: [AbilityTag.Avoidable] },
        { guid: 1243581, name: 'Reverse Gravity', tags: [AbilityTag.Unavoidable, AbilityTag.Mechanic] },
        { guid: 1234054, name: 'Shadowquake', tags: [AbilityTag.Unavoidable, AbilityTag.Ramping] },
        { guid: 1243693, name: 'Shattered Space', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1243694, name: 'Shattered Space', tags: [AbilityTag.Mechanic, AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1243699, name: 'Spatial Fragment', tags: [AbilityTag.Avoidable] },
        { guid: 1237695, name: 'Stardust Nova', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1232986, name: 'Supernova', tags: [AbilityTag.Unavoidable, AbilityTag.AoE] },
        { guid: 1246145, name: 'Touch of Oblivion', tags: [AbilityTag.Unavoidable, AbilityTag.Ramping, AbilityTag.DoT] },
        { guid: 1250055, name: 'Voidgrasp', tags: [AbilityTag.Unavoidable, AbilityTag.DoT] },
        { guid: 1239270, name: 'Voidwarding', tags: [AbilityTag.Avoidable, AbilityTag.LossOfControl, AbilityTag.DoT] },
    ]],
]);

/**
 * Helper function to get abilities for a specific boss
 */
export function getAbilitiesForBoss(bossId: BossEncounterId): BossAbilityInfo[] {
    return BOSS_ABILITIES.get(bossId) ?? [];
}

/**
 * Helper function to filter abilities by tags
 */
export function filterAbilitiesByTags(abilities: BossAbilityInfo[], tags: AbilityTag[]): BossAbilityInfo[] {
    if (tags.length === 0) return abilities;

    return abilities.filter(ability =>
        tags.every(tag => ability.tags.includes(tag))
    );
}

/**
 * Helper function to get boss name from encounter ID
 */
export function getBossName(bossId: BossEncounterId): string {
    return BossNames[bossId] ?? 'Unknown Boss';
}
