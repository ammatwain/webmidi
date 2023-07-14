import { Message } from "./Message";
import { Output } from "./Output";
/**
 * The `Forwarder` class allows the forwarding of MIDI messages to predetermined outputs. When you
 * call its [`forward()`](#forward) method, it will send the specified [`Message`](Message) object
 * to all the outputs listed in its [`destinations`](#destinations) property.
 *
 * If specific channels or message types have been defined in the [`channels`](#channels) or
 * [`types`](#types) properties, only messages matching the channels/types will be forwarded.
 *
 * While it can be manually instantiated, you are more likely to come across a `Forwarder` object as
 * the return value of the [`Input.addForwarder()`](Input#addForwarder) method.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
export declare class Forwarder {
    /**
     * Creates a `Forwarder` object.
     *
     * @param {Output|Output[]} [destinations=\[\]] An [`Output`](Output) object, or an array of such
     * objects, to forward the message to.
     *
     * @param {object} [options={}]
     * @param {string|string[]} [options.types=(all messages)] A MIDI message type or an array of such
     * types (`"noteon"`, `"controlchange"`, etc.), that the specified message must match in order to
     * be forwarded. If this option is not specified, all types of messages will be forwarded. Valid
     * messages are the ones found in either
     * [`SYSTEM_MESSAGES`](Enumerations#SYSTEM_MESSAGES)
     * or [`CHANNEL_MESSAGES`](Enumerations#CHANNEL_MESSAGES).
     * @param {number|number[]} [options.channels=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]]
     * A MIDI channel number or an array of channel numbers that the message must match in order to be
     * forwarded. By default all MIDI channels are included (`1` to `16`).
     */
    constructor(destinations?: Output | Output[], options?: {
        types?: string | string[];
        channels?: number | number[];
    });
    /**
     * An array of [`Output`](Output) objects to forward the message to.
     * @type {Output[]}
     */
    destinations: Output[];
    /**
     * An array of message types (`"noteon"`, `"controlchange"`, etc.) that must be matched in order
     * for messages to be forwarded. By default, this array includes all
     * [`Enumerations.SYSTEM_MESSAGES`](Enumerations#SYSTEM_MESSAGES) and
     * [`Enumerations.CHANNEL_MESSAGES`](Enumerations#CHANNEL_MESSAGES).
     * @type {string[]}
     */
    types: string[];
    /**
     * An array of MIDI channel numbers that the message must match in order to be forwarded. By
     * default, this array includes all MIDI channels (`1` to `16`).
     * @type {number[]}
     */
    channels: number[];
    /**
     * Indicates whether message forwarding is currently suspended or not in this forwarder.
     * @type {boolean}
     */
    suspended: boolean;
    /**
     * Sends the specified message to the forwarder's destination(s) if it matches the specified
     * type(s) and channel(s).
     *
     * @param {Message} message The [`Message`](Message) object to forward.
     */
    forward(message: Message): void;
}
