export const TWWSeason2StatKeys = [
    'timesStoodInTrash',
    'timesRolledOver',
    'timesRollingOver',
    'timesScrewed',
    'footbombsDetonated',
    'highRollerUptime',
    'timesCrushed',
    'coinsPushed',
    'bombsTossed',
    'coilsDestroyed',
    'timesFlattened',
    'blazeOfGloryCasts',
    'staticDischargeApplications',
    'blastburnRoarcannonDeaths',
    'unstableShrapnelApplications',
    'hitAndRuns',
] as const;

export const TWWSeason3StatKeys = [
    'atomizerDeaths',
    'displacementMatrixApplications',
    'lairWeavingApplications',
    'soulrendOrbApplications',
    'devourersIreApplications',
    'frailtyApplications',
    'primeSequenceHits',
    'refractedEntropyDamage',
    'oblivionDeaths',
    'overchargedManaDeaths',
] as const;

export const SeasonalStatKeys = [...TWWSeason3StatKeys];

// This is the list of seasonal stats for the TWW Season 2.
export type TWWSeason2Stats = typeof TWWSeason2StatKeys[number];

// This is a generic type for seasonal stats so that it can be used without needing to know the specific season.
export type SeasonalStatKey = typeof SeasonalStatKeys[number];

export type SeasonalStats = Record<SeasonalStatKey, number>;

export interface CoreStats {
    damageDone: number;
    healingDone: number;
    deaths: number;
    appearances: number;
    potionsUsed: number;
    healthStonesUsed: number;
    dispels: number;
    casts: number;
    interrupts: number;
    damageTaken: number;
    damageAbsorbed: number;
    powerInfusions: number;
    mechanicsTaken: number;
    friendlyFireDamageDone: number;
    friendlyFireDamageTaken: number;
};

export interface Stats extends CoreStats {
    seasonalStats: SeasonalStats;
}

export function generateBlankStats(): Stats {
    const seasonalStats: SeasonalStats = {} as SeasonalStats;
    for (const key of TWWSeason3StatKeys) {
        seasonalStats[key] = 0;
    }

    return {
        appearances: 0,
        casts: 0,
        damageAbsorbed: 0,
        damageDone: 0,
        damageTaken: 0,
        deaths: 0,
        dispels: 0,
        healingDone: 0,
        healthStonesUsed: 0,
        interrupts: 0,
        potionsUsed: 0,
        powerInfusions: 0,
        mechanicsTaken: 0,
        friendlyFireDamageDone: 0,
        friendlyFireDamageTaken: 0,
        seasonalStats,
    };
}

export interface BasePlayer {
    id: number;
    name: string,
    server: string,
    playerClass: string,
    spec: string,
    role: string
}

export type FightTypes = 'Boss' |  'Trash';

export class PlayerStats {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _server: string;
    private readonly _spec: string;
    private readonly _role: string;
    private readonly _playerClass: string;
    protected readonly _statBreakDown: { [key in FightTypes]: Stats; };

    constructor({ id, name, server, playerClass, spec, role }: BasePlayer) {
        this._id = id;
        this._name = name;
        this._server = server;
        this._spec = spec;
        this._role = role;
        this._playerClass = playerClass;
        this._statBreakDown = {
            Boss: generateBlankStats(),
            Trash: generateBlankStats(),
        };
    }

    static fromJson(serializedStats: string): PlayerStats {
        return Object.assign(new PlayerStats({
            id: 0,
            name: '',
            server: '',
            playerClass: '',
            spec: '',
            role: '',
        }), JSON.parse(serializedStats));
    }

    public addStats(type: 'Boss' | 'Trash', newStats: Stats) {
        const currentStats = this._statBreakDown[type];

        currentStats.damageDone += newStats.damageDone;
        currentStats.healingDone += newStats.healingDone;
        currentStats.deaths += newStats.deaths;
        currentStats.appearances += newStats.appearances;
        currentStats.potionsUsed += newStats.potionsUsed;
        currentStats.healthStonesUsed += newStats.healthStonesUsed;
        currentStats.dispels += newStats.dispels;
        currentStats.casts += newStats.casts;
        currentStats.interrupts += newStats.interrupts;
        currentStats.damageTaken += newStats.damageTaken;
        currentStats.damageAbsorbed += newStats.damageAbsorbed;
        currentStats.powerInfusions += newStats.powerInfusions;
        currentStats.mechanicsTaken += newStats.mechanicsTaken;
        currentStats.friendlyFireDamageTaken += newStats.friendlyFireDamageTaken;
        currentStats.friendlyFireDamageDone += newStats.friendlyFireDamageDone;

        // Merge seasonal stats, the current stats is build from the blank stats, so we can safely add the new stats to it.
        for (const key of SeasonalStatKeys) {
            currentStats.seasonalStats[key] += newStats.seasonalStats[key];
        }
    }

    public merge(playerStats: PlayerStats) {
        this.addStats('Boss', playerStats._statBreakDown['Boss']);
        this.addStats('Trash', playerStats._statBreakDown['Trash']);
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get server(): string {
        return this._server;
    }

    get playerClass(): string {
        return this._playerClass;
    }

    get spec(): string {
        return this._spec;
    }

    get role(): string {
        return this._role;
    }

    public damageDone(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('damageDone', type);
    }

    public healingDone(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('healingDone', type);
    }

    public deaths(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('deaths', type);
    }

    public appearances(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('appearances', type);
    }

    public potionsUsed(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('potionsUsed', type);
    }

    public healthStonesUsed(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('healthStonesUsed', type);
    }

    public casts(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('casts', type);
    }

    public dispels(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('dispels', type);
    }

    public interrupts(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('interrupts', type);
    }

    public damageTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('damageTaken', type);
    }

    public damageAbsorbed(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('damageAbsorbed', type);
    }

    public powerInfusions(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('powerInfusions', type);
    }

    public mechanicsTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('mechanicsTaken', type);
    }

    public friendlyFireDamageDone(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('friendlyFireDamageDone', type);
    }

    public friendlyFireDamageTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('friendlyFireDamageTaken', type);
    }

    public getSeaontalStat(seasonalKey: SeasonalStatKey, type?: 'Boss' | 'Trash'): number {
        return type
            ? this._statBreakDown[type].seasonalStats[seasonalKey]
            : this._statBreakDown['Boss'].seasonalStats[seasonalKey] + this._statBreakDown['Trash'].seasonalStats[seasonalKey];
    }

    public getStats(type: FightTypes): Stats {
        return this._statBreakDown[type];
    }

    private getStatValue(field: keyof Omit<Stats, 'seasonalStats'>, type?: FightTypes): number {
        return type
            ? this._statBreakDown[type][field]
            : this._statBreakDown['Boss'][field] + this._statBreakDown['Trash'][field];
    }
}
