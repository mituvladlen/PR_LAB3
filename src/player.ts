/**
 * Mutable ADT representing a player in the Memory Scramble game.
 * 
 * A player is identified by a unique string ID and tracks their game statistics
 * including flip attempts and successful matches.
 */

export class Player {
    private readonly id: string;
    private displayName: string;
    private flips: number;
    private matches: number;

        // Rep invariant:
    //   - id is a nonempty string with no whitespace
    //   - displayName is a nonempty string
    //   - flips >= 0, is an integer
    //   - matches >= 0, is an integer
    //
    // Abstraction function:
    //   AF(id, displayName, flips, matches) =
    //     A player with unique identifier 'id', human-readable name 'displayName',
    //     who has performed 'flips' flip attempts and completed 'matches' successful pairs
    //
    // Safety from rep exposure:
    //   - All fields are private
    //   - id is readonly; id and displayName are strings (immutable)
    //   - flips and matches are numbers (immutable primitives)
    //   - All observers return immutable primitives
    //   - No mutable objects are shared with clients

    /**
     * Create a new player.
     * 
     * @param playerId unique player identifier (nonempty string, no whitespace)
     * @param playerDisplayName human-readable name for the player (nonempty string)
     * @throws Error if playerId is empty, contains whitespace, or playerDisplayName is empty
     */
    public constructor(playerId: string, playerDisplayName: string) {
        this.id = playerId;
        this.displayName = playerDisplayName;
        this.flips = 0;
        this.matches = 0;
        this.checkRep();
    }

    /**
     * Get the player's unique identifier.
     * @returns the player's id
     */
    public getId(): string { return this.id; }

    /**
     * Get the player's display name.
     * @returns the player's current display name
     */
    public getDisplayName(): string { return this.displayName; }

    /**
     * Change the player's display name.
     * 
     * @param name new display name (must be nonempty)
     * @throws Error if name is empty
     */
    public setDisplayName(name: string): void {
        if (name.length === 0) throw new Error("displayName must be nonempty");
        this.displayName = name;
        this.checkRep();
    }

    /**
     * Record a flip attempt by this player.
     * Increments the flip count by 1.
     */
    public recordFlip(): void {
        this.flips += 1;
        this.checkRep();
    }

    /**
     * Record a successful match by this player.
     * Increments the match count by 1.
     */
    public recordMatch(): void {
        this.matches += 1;
        this.checkRep();
    }

    /**
     * Get the number of flip attempts made by this player.
     * @returns number of flips (>= 0)
     */
    public getFlips(): number { return this.flips; }

    /**
     * Get the number of successful matches found by this player.
     * @returns number of matches (>= 0)
     */
    public getMatches(): number { return this.matches; }

    /**
     * Get a string representation for debugging.
     * @returns string describing this player and their statistics
     */
    public toString(): string {
        return `Player(${this.id}, ${this.displayName}, flips=${this.flips}, matches=${this.matches})`;
    }

    /**
     * Assert the representation invariant.
     * @throws Error if rep invariant is violated
     */
    private checkRep(): void {
        if (typeof this.id !== 'string' || this.id.length === 0 || /\s/.test(this.id)) {
        throw new Error(`invalid id: ${this.id}`);
        }
        if (typeof this.displayName !== 'string' || this.displayName.length === 0) {
        throw new Error(`invalid displayName`);
        }
        if (!Number.isInteger(this.flips) || this.flips < 0) {
        throw new Error(`invalid flips: ${this.flips}`);
        }
        if (!Number.isInteger(this.matches) || this.matches < 0) {
        throw new Error(`invalid matches: ${this.matches}`);
        }
    }
}
