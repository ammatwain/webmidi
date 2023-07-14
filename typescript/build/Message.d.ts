/**
 * The `Message` class represents a single MIDI message. It has several properties that make it
 * easy to make sense of the binary data it contains.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
export declare class Message {
    /**
     * The MIDI channel number (`1` - `16`) that the message is targeting. This is only for
     * channel-specific messages. For system messages, this will be left `undefined`.
     *
     * @type {number}
     * @readonly
     */
    channel: number;
    /**
     * An integer identifying the MIDI command. For channel-specific messages, the value is 4-bit
     * and will be between `8` and `14`. For system messages, the value will be between `240` and
     * `255`.
     *
     * @type {number}
     * @readonly
     */
    command: number;
    /**
     * An array containing all the bytes of the MIDI message. Each byte is an integer between `0`
     * and `255`.
     *
     * @type {number[]}
     * @readonly
     */
    data: number[];
    /**
     * An array of the the data byte(s) of the MIDI message (as opposed to the status byte). When
     * the message is a system exclusive message (sysex), `dataBytes` explicitly excludes the
     * manufacturer ID and the sysex end byte so only the actual data is included.
     *
     * @type {number[]}
     * @readonly
     */
    dataBytes: number[];
    /**
     * A boolean indicating whether the MIDI message is a channel-specific message.
     *
     * @type {boolean}
     * @readonly
     */
    isChannelMessage: boolean;
    /**
     * A boolean indicating whether the MIDI message is a system message (not specific to a
     * channel).
     *
     * @type {boolean}
     * @readonly
     */
    isSystemMessage: boolean;
    /**
     * When the message is a system exclusive message (sysex), this property contains an array with
     * either 1 or 3 entries that identify the manufacturer targeted by the message.
     *
     * To know how to translate these entries into manufacturer names, check out the official list:
     * https://www.midi.org/specifications-old/item/manufacturer-id-numbers
     *
     * @type {number[]}
     * @readonly
     */
    manufacturerId: number[];
    /**
     * A
     * [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
     * containing the bytes of the MIDI message. Each byte is an integer between `0` and `255`.
     *
     * @type {Uint8Array}
     * @readonly
     */
    rawData: Uint8Array;
    /**
     * A
     * [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
     * of the data byte(s) of the MIDI message. When the message is a system exclusive message
     * (sysex), `rawDataBytes` explicitly excludes the manufacturer ID and the sysex end byte so
     * only the actual data is included.
     *
     * @type {Uint8Array}
     * @readonly
     */
    rawDataBytes: Uint8Array;
    /**
     * The MIDI status byte of the message as an integer between `0` and `255`.
     *
     * @type {number}
     * @readonly
     */
    statusByte: number;
    /**
     * The type of message as a string (`"noteon"`, `"controlchange"`, `"sysex"`, etc.)
     *
     * @type {string}
     * @readonly
     */
    type: string;
    /**
     * Creates a new `Message` object from raw MIDI data.
     *
     * @param {Uint8Array} data The raw data of the MIDI message as a
     * [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
     * of integers between `0` and `255`.
     */
    constructor(data: Uint8Array);
}
