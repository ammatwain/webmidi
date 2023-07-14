/**
 * The `Note` class represents a single musical note such as `"D3"`, `"G#4"`, `"F-1"`, `"Gb7"`, etc.
 *
 * `Note` objects can be played back on a single channel by calling
 * [`OutputChannel.playNote()`]{@link OutputChannel#playNote} or, on multiple channels of the same
 * output, by calling [`Output.playNote()`]{@link Output#playNote}.
 *
 * The note has [`attack`](#attack) and [`release`](#release) velocities set at `0.5` by default.
 * These can be changed by passing in the appropriate option. It is also possible to set a
 * system-wide default for attack and release velocities by using the
 * [`WebMidi.defaults`](WebMidi#defaults) property.
 *
 * If you prefer to work with raw MIDI values (`0` to `127`), you can use [`rawAttack`](#rawAttack) and
 * [`rawRelease`](#rawRelease) to both get and set the values.
 *
 * The note may have a [`duration`](#duration). If it does, playback will be automatically stopped
 * when the duration has elapsed by sending a `"noteoff"` event. By default, the duration is set to
 * `Infinity`. In this case, it will never stop playing unless explicitly stopped by calling a
 * method such as [`OutputChannel.stopNote()`]{@link OutputChannel#stopNote},
 * [`Output.stopNote()`]{@link Output#stopNote} or similar.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
export declare class Note {
    private _accidental;
    private _attack;
    private _duration;
    private _name;
    private _octave;
    private _release;
    /**
     * Creates a `Note` object.
     *
     * @param value {string|number} The value used to create the note. If an identifier string is used,
     * it must start with the note letter, optionally followed by an accidental and followed by the
     * octave number (`"C3"`, `"G#4"`, `"F-1"`, `"Db7"`, etc.). If a number is used, it must be an
     * integer between 0 and 127. In this case, middle C is considered to be C4 (note number 60).
     *
     * @param {object} [options={}]
     *
     * @param {number} [options.duration=Infinity] The number of milliseconds before the note should be
     * explicitly stopped.
     *
     * @param {number} [options.attack=0.5] The note's attack velocity as a float between 0 and 1. If
     * you wish to use an integer between 0 and 127, use the `rawAttack` option instead. If both
     * `attack` and `rawAttack` are specified, the latter has precedence.
     *
     * @param {number} [options.release=0.5] The note's release velocity as a float between 0 and 1. If
     * you wish to use an integer between 0 and 127, use the `rawRelease` option instead. If both
     * `release` and `rawRelease` are specified, the latter has precedence.
     *
     * @param {number} [options.rawAttack=64] The note's attack velocity as an integer between 0 and
     * 127. If you wish to use a float between 0 and 1, use the `release` option instead. If both
     * `attack` and `rawAttack` are specified, the latter has precedence.
     *
     * @param {number} [options.rawRelease=64] The note's release velocity as an integer between 0 and
     * 127. If you wish to use a float between 0 and 1, use the `release` option instead. If both
     * `release` and `rawRelease` are specified, the latter has precedence.
     *
     * @throws {Error} Invalid note identifier
     * @throws {RangeError} Invalid name value
     * @throws {RangeError} Invalid accidental value
     * @throws {RangeError} Invalid octave value
     * @throws {RangeError} Invalid duration value
     * @throws {RangeError} Invalid attack value
     * @throws {RangeError} Invalid release value
     */
    constructor(value: string | number, options?: {
        duration?: number;
        attack?: number;
        release?: number;
        rawAttack?: number;
        rawRelease?: number;
    });
    /**
     * Returns a MIDI note number offset by octave and/or semitone. If the calculated value is less
     * than 0, 0 will be returned. If the calculated value is more than 127, 127 will be returned. If
     * an invalid value is supplied, 0 will be used.
     *
     * @param [octaveOffset] {number} An integer to offset the note number by octave.
     * @param [semitoneOffset] {number} An integer to offset the note number by semitone.
     * @returns {number} An integer between 0 and 127
     */
    getOffsetNumber(octaveOffset?: number, semitoneOffset?: number): number;
    /**
     * The accidental (#, ##, b or bb) of the note.
     * @type {string}
     * @since 3.0.0
     */
    get accidental(): string;
    set accidental(arg: string);
    /**
     * The attack velocity of the note as an integer between 0 and 1.
     * @type {number}
     * @since 3.0.0
     */
    get attack(): number;
    set attack(arg: number);
    /**
     * The duration of the note as a positive decimal number representing the number of milliseconds
     * that the note should play for.
     *
     * @type {number}
     * @since 3.0.0
     */
    get duration(): number;
    set duration(arg: number);
    /**
     * The name, optional accidental and octave of the note, as a string.
     * @type {string}
     * @since 3.0.0
     */
    set identifier(arg: string);
    get identifier(): string;
    /**
     * The name (letter) of the note. If you need the full name with octave and accidental, you can
     * use the [`identifier`]{@link Note#identifier} property instead.
     * @type {string}
     * @since 3.0.0
     */
    get name(): string;
    set name(arg: string);
    /**
     * The MIDI number of the note (`0` - `127`). This number is derived from the note identifier
     * using C4 as a reference for middle C.
     *
     * @type {number}
     * @readonly
     * @since 3.0.0
     */
    get number(): number;
    /**
     * The octave of the note.
     * @type {number}
     * @since 3.0.0
     */
    get octave(): number;
    set octave(arg: number);
    /**
     * The attack velocity of the note as a positive integer between 0 and 127.
     * @type {number}
     * @since 3.0.0
     */
    get rawAttack(): number;
    set rawAttack(arg: number);
    /**
     * The release velocity of the note as a positive integer between 0 and 127.
     * @type {number}
     * @since 3.0.0
     */
    get rawRelease(): number;
    set rawRelease(arg: number);
    /**
     * The release velocity of the note as an integer between 0 and 1.
     * @type {number}
     * @since 3.0.0
     */
    get release(): number;
    set release(arg: number);
}
