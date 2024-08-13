export interface Stats {
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
    threat: number;
    powerInfusions: number;
    mechanicsTaken: number;
    fireDamageTaken: number;

    // Season Specific
    friendlyFireDamageDone: number;
    friendlyFireDamageTaken: number;
    bombsDetonated: number;
    duckApplications: number;

}

export function generateBlankStats(): Stats {
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
        threat: 0,
        powerInfusions: 0,
        mechanicsTaken: 0,
        fireDamageTaken: 0,
        friendlyFireDamageDone: 0,
        friendlyFireDamageTaken: 0,
        bombsDetonated: 0,
        duckApplications: 0,
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
        currentStats.threat += newStats.threat;
        currentStats.powerInfusions += newStats.powerInfusions;
        currentStats.mechanicsTaken += newStats.mechanicsTaken;
        currentStats.fireDamageTaken += newStats.fireDamageTaken;
        currentStats.friendlyFireDamageTaken += newStats.friendlyFireDamageTaken;
        currentStats.friendlyFireDamageDone += newStats.friendlyFireDamageDone;
        currentStats.bombsDetonated += newStats.bombsDetonated;
        currentStats.duckApplications += newStats.duckApplications;
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

    public threat(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('threat', type);
    }

    public powerInfusions(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('powerInfusions', type);
    }

    public mechanicsTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('mechanicsTaken', type);
    }

    public fireDamageTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('fireDamageTaken', type);
    }

    public friendlyFireDamageDone(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('friendlyFireDamageDone', type);
    }

    public friendlyFireDamageTaken(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('friendlyFireDamageTaken', type);
    }

    public bombsDetonated(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('bombsDetonated', type);
    }

    public duckApplications(type?: 'Boss' | 'Trash'): number {
        return this.getStatValue('duckApplications', type);
    }

    private getStatValue(field: keyof Stats, type?: FightTypes): number {
        return type
            ? this._statBreakDown[type][field]
            : this._statBreakDown['Boss'][field] + this._statBreakDown['Trash'][field];
    }
}
