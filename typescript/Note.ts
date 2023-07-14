import {WebMidi} from "./WebMidi";
import {Utilities} from "./Utilities";

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
export class Note {

  private _accidental: string;
  private _attack: number;
  private _duration: number;
  private _name: string;
  private _octave: number;
  private _release: number;

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
  }) {

    // Assign property defaults
    this.duration = WebMidi.defaults.note.duration;
    this.attack = WebMidi.defaults.note.attack;
    this.release = WebMidi.defaults.note.release;

    // Assign property values from options (validation occurs in setter)
    if (options.duration != undefined) this.duration = options.duration;
    if (options.attack != undefined) this.attack = options.attack;
    if (options.rawAttack != undefined) this.attack = Utilities.from7bitToFloat(options.rawAttack);
    if (options.release != undefined) this.release = options.release;
    if (options.rawRelease != undefined) {
      this.release = Utilities.from7bitToFloat(options.rawRelease);
    }

    // Assign note depending on the way it was specified (name or number)
    if (Number.isInteger(value)) {
      this.identifier = Utilities.toNoteIdentifier(value);
    } else {
      this.identifier = value;
    }

  }

  /**
   * Returns a MIDI note number offset by octave and/or semitone. If the calculated value is less
   * than 0, 0 will be returned. If the calculated value is more than 127, 127 will be returned. If
   * an invalid value is supplied, 0 will be used.
   *
   * @param [octaveOffset] {number} An integer to offset the note number by octave.
   * @param [semitoneOffset] {number} An integer to offset the note number by semitone.
   * @returns {number} An integer between 0 and 127
   */
  getOffsetNumber(octaveOffset?: number, semitoneOffset?: number): number {

    if (WebMidi.validation) {
      octaveOffset = parseInt(octaveOffset) || 0;
      semitoneOffset = parseInt(semitoneOffset) || 0;
    }

    return Math.min(Math.max(this.number + (octaveOffset * 12) + semitoneOffset, 0), 127);

  }

  /**
   * The accidental (#, ##, b or bb) of the note.
   * @type {string}
   * @since 3.0.0
   */
  get accidental(): string  {
    return this._accidental;
  }

  set accidental(arg: string) {

    if (WebMidi.validation) {
      value = value.toLowerCase();
      if (!["#", "##", "b", "bb"].includes(value)) throw new Error("Invalid accidental value");
    }

    this._accidental = value;

  }

  /**
   * The attack velocity of the note as an integer between 0 and 1.
   * @type {number}
   * @since 3.0.0
   */
  get attack(): number {
    return this._attack;
  }

  set attack(arg: number) {

    if (WebMidi.validation) {
      value = parseFloat(value);
      if (isNaN(value) || !(value >= 0 && value <= 1)) {
        throw new RangeError("Invalid attack value.");
      }
    }

    this._attack = value;

  }

  /**
   * The duration of the note as a positive decimal number representing the number of milliseconds
   * that the note should play for.
   *
   * @type {number}
   * @since 3.0.0
   */
  get duration(): number {
    return this._duration;
  }

  set duration(arg: number) {

    if (WebMidi.validation) {
      value = parseFloat(value);
      if (isNaN(value) || value === null || value < 0) {
        throw new RangeError("Invalid duration value.");
      }
    }

    this._duration = value;

  }


  /**
   * The name, optional accidental and octave of the note, as a string.
   * @type {string}
   * @since 3.0.0
   */
  set identifier(arg: string){

    const fragments = Utilities.getNoteDetails(value);

    if (WebMidi.validation) {
      if (!value) throw new Error("Invalid note identifier");
    }

    this._name = fragments.name;
    this._accidental = fragments.accidental;
    this._octave = fragments.octave;

  }

  get identifier(): string {
    return this._name + (this._accidental || "") + this._octave;
  }

  /**
   * The name (letter) of the note. If you need the full name with octave and accidental, you can
   * use the [`identifier`]{@link Note#identifier} property instead.
   * @type {string}
   * @since 3.0.0
   */
  get name(): string  {
    return this._name;
  }

  set name(arg: string)  {

    if (WebMidi.validation) {
      value = value.toUpperCase();
      if (!["C", "D", "E", "F", "G", "A", "B"].includes(value)) {
        throw new Error("Invalid name value");
      }
    }

    this._name = value;

  }


  /**
   * The MIDI number of the note (`0` - `127`). This number is derived from the note identifier
   * using C4 as a reference for middle C.
   *
   * @type {number}
   * @readonly
   * @since 3.0.0
   */
  get number(): number  {
    return Utilities.toNoteNumber(this.identifier);
  }

  /**
   * The octave of the note.
   * @type {number}
   * @since 3.0.0
   */
  get octave(): number {
    return this._octave;
  }
  set octave(arg: number) {

    if (WebMidi.validation) {
      value = parseInt(value);
      if (isNaN(value)) throw new Error("Invalid octave value");
    }

    this._octave = value;

  }

  /**
   * The attack velocity of the note as a positive integer between 0 and 127.
   * @type {number}
   * @since 3.0.0
   */
  get rawAttack(): number {
    return Utilities.fromFloatTo7Bit(this._attack);
  }
  set rawAttack(arg: number) {
    this._attack = Utilities.from7bitToFloat(value);
  }


  /**
   * The release velocity of the note as a positive integer between 0 and 127.
   * @type {number}
   * @since 3.0.0
   */
  get rawRelease(): number {
    return Utilities.fromFloatTo7Bit(this._release);
  }
  set rawRelease(arg: number) {
    this._release = Utilities.from7bitToFloat(value);
  }

  /**
   * The release velocity of the note as an integer between 0 and 1.
   * @type {number}
   * @since 3.0.0
   */
  get release(): number {
    return this._release;
  }

  set release(arg: number) {
    if (WebMidi.validation) {
      value = parseFloat(value);
      if (isNaN(value) || !(value >= 0 && value <= 1)) {
        throw new RangeError("Invalid release value.");
      }
    }
    this._release = value;
  }


}