import { EventEmitter } from "./EventEmitter";
import { Forwarder } from "./Forwarder";
import { InputChannel } from "./InputChannel";
import { InputEventMap, WebMidiApi } from "./Interfaces";
import { Output } from "./Output";
import { Listener } from "./Listener";
/**
 * The `Input` class represents a single MIDI input port. This object is automatically instantiated
 * by the library according to the host's MIDI subsystem and does not need to be directly
 * instantiated. Instead, you can access all `Input` objects by referring to the
 * [`WebMidi.inputs`](WebMidi#inputs) array. You can also retrieve inputs by using methods such as
 * [`WebMidi.getInputByName()`](WebMidi#getInputByName) and
 * [`WebMidi.getInputById()`](WebMidi#getInputById).
 *
 * Note that a single MIDI device may expose several inputs and/or outputs.
 *
 * **Important**: the `Input` class does not directly fire channel-specific MIDI messages
 * (such as [`noteon`](InputChannel#event:noteon) or
 * [`controlchange`](InputChannel#event:controlchange), etc.). The [`InputChannel`](InputChannel)
 * object does that. However, you can still use the
 * [`Input.addListener()`](#addListener) method to listen to channel-specific events on multiple
 * [`InputChannel`](InputChannel) objects at once.
 *
 * @fires Input#opened
 * @fires Input#disconnected
 * @fires Input#closed
 * @fires Input#midimessage
 *
 * @fires Input#sysex
 * @fires Input#timecode
 * @fires Input#songposition
 * @fires Input#songselect
 * @fires Input#tunerequest
 * @fires Input#clock
 * @fires Input#start
 * @fires Input#continue
 * @fires Input#stop
 * @fires Input#activesensing
 * @fires Input#reset
 *
 * @fires Input#unknownmidimessage
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */
export declare class Input extends EventEmitter {
    /**
     * @type {Forwarder[]}
     * @private
     */
    private _forwarders;
    /**
     * Reference to the actual MIDIInput object
     * @type WebMidiApi.MIDIInput
     * @private
     */
    private _midiInput;
    /**
     * @type {number}
     * @private
     */
    private _octaveOffset;
    /**
     * Array containing the 16 [`InputChannel`](InputChannel) objects available for this `Input`. The
     * channels are numbered 1 through 16.
     *
     * @type {InputChannel[]}
     */
    channels: InputChannel[];
    /**
     * Creates an `Input` object.
     *
     * @param {WebMidiApi.MIDIInput} midiInput [`MIDIInput`](https://developer.mozilla.org/en-US/docs/Web/API/MIDIInput)
     * object as provided by the MIDI subsystem (Web MIDI API).
     */
    constructor(midiInput: WebMidiApi.MIDIInput);
    /**
     * Executed when a `"midimessage"` event is received
     * @param e
     * @private
     */
    private _onMidiMessage;
    /**
     * Executed when a `"statechange"` event occurs.
     *
     * @param e
     * @private
     */
    private _onStateChange;
    /**
     * @private
     */
    private _parseEvent;
    /**
     * Adds a forwarder that will forward all incoming MIDI messages matching the criteria to the
     * specified [`Output`](Output) destination(s). This is akin to the hardware MIDI THRU port, with
     * the added benefit of being able to filter which data is forwarded.
     *
     * @param {Output|Output[]} output An [`Output`](Output) object, or an array of such
     * objects, to forward messages to.
     * @param {object} [options={}]
     * @param {string|string[]} [options.types=(all messages)] A message type, or an array of such
     * types (`noteon`, `controlchange`, etc.), that the message type must match in order to be
     * forwarded. If this option is not specified, all types of messages will be forwarded. Valid
     * messages are the ones found in either
     * [`SYSTEM_MESSAGES`](Enumerations#SYSTEM_MESSAGES) or
     * [`CHANNEL_MESSAGES`](Enumerations#CHANNEL_MESSAGES).
     * @param {number|number[]} [options.channels=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]]
     * A MIDI channel number or an array of channel numbers that the message must match in order to be
     * forwarded. By default all MIDI channels are included (`1` to `16`).
     *
     * @returns {Forwarder} The [`Forwarder`](Forwarder) object created to handle the forwarding. This
     * is useful if you wish to manipulate or remove the [`Forwarder`](Forwarder) later on.
     */
    addForwarder(output: Output | Output[], options?: {
        types?: string | string[];
        channels?: number | number[];
    }): Forwarder;
    /**
     * Adds an event listener that will trigger a function callback when the specified event is
     * dispatched. The event usually is **input-wide** but can also be **channel-specific**.
     *
     * Input-wide events do not target a specific MIDI channel so it makes sense to listen for them
     * at the `Input` level and not at the [`InputChannel`](InputChannel) level. Channel-specific
     * events target a specific channel. Usually, in this case, you would add the listener to the
     * [`InputChannel`](InputChannel) object. However, as a convenience, you can also listen to
     * channel-specific events directly on an `Input`. This allows you to react to a channel-specific
     * event no matter which channel it actually came through.
     *
     * When listening for an event, you simply need to specify the event name and the function to
     * execute:
     *
     * ```javascript
     * const listener = WebMidi.inputs[0].addListener("midimessage", e => {
     *   console.log(e);
     * });
     * ```
     *
     * Calling the function with an input-wide event (such as
     * [`"midimessage"`]{@link #event:midimessage}), will return the [`Listener`](Listener) object
     * that was created.
     *
     * If you call the function with a channel-specific event (such as
     * [`"noteon"`]{@link InputChannel#event:noteon}), it will return an array of all
     * [`Listener`](Listener) objects that were created (one for each channel):
     *
     * ```javascript
     * const listeners = WebMidi.inputs[0].addListener("noteon", someFunction);
     * ```
     *
     * You can also specify which channels you want to add the listener to:
     *
     * ```javascript
     * const listeners = WebMidi.inputs[0].addListener("noteon", someFunction, {channels: [1, 2, 3]});
     * ```
     *
     * In this case, `listeners` is an array containing 3 [`Listener`](Listener) objects.
     *
     * Note that, when adding channel-specific listeners, it is the [`InputChannel`](InputChannel)
     * instance that actually gets a listener added and not the `Input` instance. You can check that
     * by calling [`InputChannel.hasListener()`](InputChannel#hasListener()).
     *
     * There are 8 families of events you can listen to:
     *
     * 1. **MIDI System Common** Events (input-wide)
     *
     *    * [`songposition`]{@link Input#event:songposition}
     *    * [`songselect`]{@link Input#event:songselect}
     *    * [`sysex`]{@link Input#event:sysex}
     *    * [`timecode`]{@link Input#event:timecode}
     *    * [`tunerequest`]{@link Input#event:tunerequest}
     *
     * 2. **MIDI System Real-Time** Events (input-wide)
     *
     *    * [`clock`]{@link Input#event:clock}
     *    * [`start`]{@link Input#event:start}
     *    * [`continue`]{@link Input#event:continue}
     *    * [`stop`]{@link Input#event:stop}
     *    * [`activesensing`]{@link Input#event:activesensing}
     *    * [`reset`]{@link Input#event:reset}
     *
     * 3. **State Change** Events (input-wide)
     *
     *    * [`opened`]{@link Input#event:opened}
     *    * [`closed`]{@link Input#event:closed}
     *    * [`disconnected`]{@link Input#event:disconnected}
     *
     * 4. **Catch-All** Events (input-wide)
     *
     *    * [`midimessage`]{@link Input#event:midimessage}
     *    * [`unknownmidimessage`]{@link Input#event:unknownmidimessage}
     *
     * 5. **Channel Voice** Events (channel-specific)
     *
     *    * [`channelaftertouch`]{@link InputChannel#event:channelaftertouch}
     *    * [`controlchange`]{@link InputChannel#event:controlchange}
     *      * [`controlchange-controller0`]{@link InputChannel#event:controlchange-controller0}
     *      * [`controlchange-controller1`]{@link InputChannel#event:controlchange-controller1}
     *      * [`controlchange-controller2`]{@link InputChannel#event:controlchange-controller2}
     *      * (...)
     *      * [`controlchange-controller127`]{@link InputChannel#event:controlchange-controller127}
     *    * [`keyaftertouch`]{@link InputChannel#event:keyaftertouch}
     *    * [`noteoff`]{@link InputChannel#event:noteoff}
     *    * [`noteon`]{@link InputChannel#event:noteon}
     *    * [`pitchbend`]{@link InputChannel#event:pitchbend}
     *    * [`programchange`]{@link InputChannel#event:programchange}
     *
     *    Note: you can listen for a specific control change message by using an event name like this:
     *    `controlchange-controller23`, `controlchange-controller99`, `controlchange-controller122`,
     *    etc.
     *
     * 6. **Channel Mode** Events (channel-specific)
     *
     *    * [`allnotesoff`]{@link InputChannel#event:allnotesoff}
     *    * [`allsoundoff`]{@link InputChannel#event:allsoundoff}
     *    * [`localcontrol`]{@link InputChannel#event:localcontrol}
     *    * [`monomode`]{@link InputChannel#event:monomode}
     *    * [`omnimode`]{@link InputChannel#event:omnimode}
     *    * [`resetallcontrollers`]{@link InputChannel#event:resetallcontrollers}
     *
     * 7. **NRPN** Events (channel-specific)
     *
     *    * [`nrpn`]{@link InputChannel#event:nrpn}
     *    * [`nrpn-dataentrycoarse`]{@link InputChannel#event:nrpn-dataentrycoarse}
     *    * [`nrpn-dataentryfine`]{@link InputChannel#event:nrpn-dataentryfine}
     *    * [`nrpn-dataincrement`]{@link InputChannel#event:nrpn-dataincrement}
     *    * [`nrpn-datadecrement`]{@link InputChannel#event:nrpn-datadecrement}
     *
     * 8. **RPN** Events (channel-specific)
     *
     *    * [`rpn`]{@link InputChannel#event:rpn}
     *    * [`rpn-dataentrycoarse`]{@link InputChannel#event:rpn-dataentrycoarse}
     *    * [`rpn-dataentryfine`]{@link InputChannel#event:rpn-dataentryfine}
     *    * [`rpn-dataincrement`]{@link InputChannel#event:rpn-dataincrement}
     *    * [`rpn-datadecrement`]{@link InputChannel#event:rpn-datadecrement}
     *
     * @param event {string | Symbol} The type of the event.
     *
     * @param listener {EventEmitterCallback} A callback function to execute when the specified event is detected.
     * This function will receive an event parameter object. For details on this object's properties,
     * check out the documentation for the various events (links above).
     *
     * @param {object} [options={}]
     *
     * @param {array} [options.arguments] An array of arguments which will be passed separately to the
     * callback function. This array is stored in the [`arguments`](Listener#arguments) property of
     * the [`Listener`](Listener) object and can be retrieved or modified as desired.
     *
     * @param {number|number[]} [options.channels=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]]
     * An integer between 1 and 16 or an array of such integers representing the MIDI channel(s) to
     * listen on. If no channel is specified, all channels will be used. This parameter is ignored for
     * input-wide events.
     *
     * @param {object} [options.context=this] The value of `this` in the callback function.
     *
     * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
     * automatically expires.
     *
     * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
     * of the listeners array and thus be triggered before others.
     *
     * @param {number} [options.remaining=Infinity] The number of times after which the callback
     * should automatically be removed.
     *
     * @returns {Listener|Listener[]} If the event is input-wide, a single [`Listener`](Listener)
     * object is returned. If the event is channel-specific, an array of all the
     * [`Listener`](Listener) objects is returned (one for each channel).
     */
    addListener<T extends keyof InputEventMap>(event: Symbol | T, listener: InputEventMap[T], options?: {
        "duration": number;
        "arguments"?: any[];
        "channels"?: number | number[];
        "context"?: any;
        "prepend"?: boolean;
        "remaining"?: number;
    }): Listener | Listener[];
    /**
     * Adds a one-time event listener that will trigger a function callback when the specified event
     * happens. The event can be **channel-bound** or **input-wide**. Channel-bound events are
     * dispatched by [`InputChannel`]{@link InputChannel} objects and are tied to a specific MIDI
     * channel while input-wide events are dispatched by the `Input` object itself and are not tied
     * to a specific channel.
     *
     * Calling the function with an input-wide event (such as
     * [`"midimessage"`]{@link #event:midimessage}), will return the [`Listener`](Listener) object
     * that was created.
     *
     * If you call the function with a channel-specific event (such as
     * [`"noteon"`]{@link InputChannel#event:noteon}), it will return an array of all
     * [`Listener`](Listener) objects that were created (one for each channel):
     *
     * ```javascript
     * const listeners = WebMidi.inputs[0].addOneTimeListener("noteon", someFunction);
     * ```
     *
     * You can also specify which channels you want to add the listener to:
     *
     * ```javascript
     * const listeners = WebMidi.inputs[0].addOneTimeListener("noteon", someFunction, {channels: [1, 2, 3]});
     * ```
     *
     * In this case, the `listeners` variable contains an array of 3 [`Listener`](Listener) objects.
     *
     * The code above will add a listener for the `"noteon"` event and call `someFunction` when the
     * event is triggered on MIDI channels `1`, `2` or `3`.
     *
     * Note that, when adding events to channels, it is the [`InputChannel`](InputChannel) instance
     * that actually gets a listener added and not the `Input` instance.
     *
     * Note: if you want to add a listener to a single MIDI channel you should probably do so directly
     * on the [`InputChannel`](InputChannel) object itself.
     *
     * There are 8 families of events you can listen to:
     *
     * 1. **MIDI System Common** Events (input-wide)
     *
     *    * [`songposition`]{@link Input#event:songposition}
     *    * [`songselect`]{@link Input#event:songselect}
     *    * [`sysex`]{@link Input#event:sysex}
     *    * [`timecode`]{@link Input#event:timecode}
     *    * [`tunerequest`]{@link Input#event:tunerequest}
     *
     * 2. **MIDI System Real-Time** Events (input-wide)
     *
     *    * [`clock`]{@link Input#event:clock}
     *    * [`start`]{@link Input#event:start}
     *    * [`continue`]{@link Input#event:continue}
     *    * [`stop`]{@link Input#event:stop}
     *    * [`activesensing`]{@link Input#event:activesensing}
     *    * [`reset`]{@link Input#event:reset}
     *
     * 3. **State Change** Events (input-wide)
     *
     *    * [`opened`]{@link Input#event:opened}
     *    * [`closed`]{@link Input#event:closed}
     *    * [`disconnected`]{@link Input#event:disconnected}
     *
     * 4. **Catch-All** Events (input-wide)
     *
     *    * [`midimessage`]{@link Input#event:midimessage}
     *    * [`unknownmidimessage`]{@link Input#event:unknownmidimessage}
     *
     * 5. **Channel Voice** Events (channel-specific)
     *
     *    * [`channelaftertouch`]{@link InputChannel#event:channelaftertouch}
     *    * [`controlchange`]{@link InputChannel#event:controlchange}
     *      * [`controlchange-controller0`]{@link InputChannel#event:controlchange-controller0}
     *      * [`controlchange-controller1`]{@link InputChannel#event:controlchange-controller1}
     *      * [`controlchange-controller2`]{@link InputChannel#event:controlchange-controller2}
     *      * (...)
     *      * [`controlchange-controller127`]{@link InputChannel#event:controlchange-controller127}
     *    * [`keyaftertouch`]{@link InputChannel#event:keyaftertouch}
     *    * [`noteoff`]{@link InputChannel#event:noteoff}
     *    * [`noteon`]{@link InputChannel#event:noteon}
     *    * [`pitchbend`]{@link InputChannel#event:pitchbend}
     *    * [`programchange`]{@link InputChannel#event:programchange}
     *
     *    Note: you can listen for a specific control change message by using an event name like this:
     *    `controlchange-controller23`, `controlchange-controller99`, `controlchange-controller122`,
     *    etc.
     *
     * 6. **Channel Mode** Events (channel-specific)
     *
     *    * [`allnotesoff`]{@link InputChannel#event:allnotesoff}
     *    * [`allsoundoff`]{@link InputChannel#event:allsoundoff}
     *    * [`localcontrol`]{@link InputChannel#event:localcontrol}
     *    * [`monomode`]{@link InputChannel#event:monomode}
     *    * [`omnimode`]{@link InputChannel#event:omnimode}
     *    * [`resetallcontrollers`]{@link InputChannel#event:resetallcontrollers}
     *
     * 7. **NRPN** Events (channel-specific)
     *
     *    * [`nrpn`]{@link InputChannel#event:nrpn}
     *    * [`nrpn-dataentrycoarse`]{@link InputChannel#event:nrpn-dataentrycoarse}
     *    * [`nrpn-dataentryfine`]{@link InputChannel#event:nrpn-dataentryfine}
     *    * [`nrpn-dataincrement`]{@link InputChannel#event:nrpn-dataincrement}
     *    * [`nrpn-datadecrement`]{@link InputChannel#event:nrpn-datadecrement}
     *
     * 8. **RPN** Events (channel-specific)
     *
     *    * [`rpn`]{@link InputChannel#event:rpn}
     *    * [`rpn-dataentrycoarse`]{@link InputChannel#event:rpn-dataentrycoarse}
     *    * [`rpn-dataentryfine`]{@link InputChannel#event:rpn-dataentryfine}
     *    * [`rpn-dataincrement`]{@link InputChannel#event:rpn-dataincrement}
     *    * [`rpn-datadecrement`]{@link InputChannel#event:rpn-datadecrement}
     *
     * @param event {string} The type of the event.
     *
     * @param listener {EventEmitterCallback} A callback function to execute when the specified event
     * is detected. This function will receive an event parameter object. For details on this object's
     * properties, check out the documentation for the various events (links above).
     *
     * @param {object} [options={}]
     *
     * @param {array} [options.arguments] An array of arguments which will be passed separately to the
     * callback function. This array is stored in the [`arguments`](Listener#arguments) property of
     * the [`Listener`](Listener) object and can be retrieved or modified as desired.
     *
     * @param {number|number[]} [options.channels]  An integer between 1 and 16 or an array of
     * such integers representing the MIDI channel(s) to listen on. This parameter is ignored for
     * input-wide events.
     *
     * @param {object} [options.context=this] The value of `this` in the callback function.
     *
     * @param {number} [options.duration=Infinity] The number of milliseconds before the listener
     * automatically expires.
     *
     * @param {boolean} [options.prepend=false] Whether the listener should be added at the beginning
     * of the listeners array and thus be triggered before others.
     *
     * @returns {Listener|Listener[]} An array of all [`Listener`](Listener) objects that were
     * created.
     */
    addOneTimeListener<T extends keyof InputEventMap>(event: Symbol | T, listener: InputEventMap[T], options?: {
        "duration": number;
        "arguments"?: any[];
        "channels"?: number | number[];
        "context"?: any;
        "prepend"?: boolean;
        "remaining"?: number;
    }): Listener | Listener[];
    /**
     * Closes the input. When an input is closed, it cannot be used to listen to MIDI messages until
     * the input is opened again by calling [`Input.open()`](Input#open).
     *
     * **Note**: if what you want to do is stop events from being dispatched, you should use
     * [`eventsSuspended`](#eventsSuspended) instead.
     *
     * @returns {Promise<Input>} The promise is fulfilled with the `Input` object
     */
    close(): Promise<Input>;
    /**
     * Destroys the `Input` by removing all listeners, emptying the [`channels`](#channels) array and
     * unlinking the MIDI subsystem. This is mostly for internal use.
     *
     * @returns {Promise<void>}
     */
    destroy(): Promise<void>;
    /**
     * Checks whether the specified [`Forwarder`](Forwarder) object has already been attached to this
     * input.
     *
     * @param {Forwarder} forwarder The [`Forwarder`](Forwarder) to check for (the
     * [`Forwarder`](Forwarder) object is returned when calling [`addForwarder()`](#addForwarder).
     * @returns {boolean}
     */
    hasForwarder(forwarder: Forwarder): boolean;
    /**
     * Checks if the specified event type is already defined to trigger the specified callback
     * function. For channel-specific events, the function will return `true` only if all channels
     * have the listener defined.
     *
     * @param event {string|Symbol} The type of the event.
     *
     * @param listener {EventEmitterCallback} The callback function to check for.
     *
     * @param {object} [options={}]
     *
     * @param {number|number[]} [options.channels]  An integer between 1 and 16 or an array of such
     * integers representing the MIDI channel(s) to check. This parameter is ignored for input-wide
     * events.
     *
     * @returns {boolean} Boolean value indicating whether or not the `Input` or `InputChannel`
     * already has this listener defined.
     */
    hasListener<T extends keyof InputEventMap>(event: Symbol | T, listener: InputEventMap[T], options?: {
        "channels"?: number | number[];
    }): boolean;
    /**
     * Opens the input for usage. This is usually unnecessary as the port is opened automatically when
     * WebMidi is enabled.
     *
     * @returns {Promise<Input>} The promise is fulfilled with the `Input` object.
     */
    open(): Promise<Input>;
    /**
     * Removes the specified [`Forwarder`](Forwarder) object from the input.
     *
     * @param {Forwarder} forwarder The [`Forwarder`](Forwarder) to remove (the
     * [`Forwarder`](Forwarder) object is returned when calling `addForwarder()`.
     */
    removeForwarder(forwarder: Forwarder): void;
    /**
     * Removes the specified listener for the specified event. If no listener is specified, all
     * listeners for the specified event will be removed. If no event is specified, all listeners for
     * the `Input` as well as all listeners for all [`InputChannel`]{@link InputChannel} objects will
     * be removed.
     *
     * By default, channel-specific listeners will be removed from all channels unless the
     * `options.channel` narrows it down.
     *
     * @param [type] {string} The type of the event.
     *
     * @param [listener] {EventEmitterCallback} The callback function to check for.
     *
     * @param {object} [options={}]
     *
     * @param {number|number[]} [options.channels]  An integer between 1 and 16 or an array of
     * such integers representing the MIDI channel(s) to match. This parameter is ignored for
     * input-wide events.
     *
     * @param {*} [options.context] Only remove the listeners that have this exact context.
     *
     * @param {number} [options.remaining] Only remove the listener if it has exactly that many
     * remaining times to be executed.
     */
    removeListener<T extends keyof InputEventMap>(event?: Symbol | T, listener?: InputEventMap[T], options?: {
        "channels"?: number | number[];
        "context"?: any;
        "remaining"?: number;
    }): void;
    /**
     * Input port's connection state: `pending`, `open` or `closed`.
     *
     * @type {string}
     * @readonly
     */
    get connection(): string;
    /**
     * ID string of the MIDI port. The ID is host-specific. Do not expect the same ID on different
     * platforms. For example, Google Chrome and the Jazz-Plugin report completely different IDs for
     * the same port.
     *
     * @type {string}
     * @readonly
     */
    get id(): string;
    /**
     * Name of the manufacturer of the device that makes this input port available.
     *
     * @type {string}
     * @readonly
     */
    get manufacturer(): string;
    /**
     * Name of the MIDI input.
     *
     * @type {string}
     * @readonly
     */
    get name(): string;
    /**
     * An integer to offset the reported octave of incoming notes. By default, middle C (MIDI note
     * number 60) is placed on the 4th octave (C4).
     *
     * If, for example, `octaveOffset` is set to 2, MIDI note number 60 will be reported as C6. If
     * `octaveOffset` is set to -1, MIDI note number 60 will be reported as C3.
     *
     * Note that this value is combined with the global offset value defined in the
     * [`WebMidi.octaveOffset`](WebMidi#octaveOffset) property (if any).
     *
     * @type {number}
     *
     * @since 3.0
     */
    set octaveOffset(value: number);
    get octaveOffset(): number;
    /**
     * State of the input port: `connected` or `disconnected`.
     *
     * @type {string}
     * @readonly
     */
    get state(): string;
    /**
     * The port type. In the case of the `Input` object, this is always: `input`.
     *
     * @type {string}
     * @readonly
     */
    get type(): string;
}
/**
 * Input-wide (system) event emitted when a **system exclusive** message has been received.
 * You should note that, to receive `sysex` events, you must call the
 * [`WebMidi.enable()`](WebMidi#enable()) method with the `sysex` option set to `true`:
 *
 * ```js
 * WebMidi.enable({sysex: true})
 *  .then(() => console.log("WebMidi has been enabled with sysex support."))
 * ```
 *
 * @event Input#sysex
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `sysex`
 *
 */
/**
 * Input-wide (system) event emitted when a **time code quarter frame** message has been
 * received.
 *
 * @event Input#timecode
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `timecode`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **song position** message has been received.
 *
 * @event Input#songposition
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `songposition`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **song select** message has been received.
 *
 * @event Input#songselect
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} value Song (or sequence) number to select (0-127)
 * @property {string} rawValue Song (or sequence) number to select (0-127)
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **tune request** message has been received.
 *
 * @event Input#tunerequest
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `tunerequest`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **timing clock** message has been received.
 *
 * @event Input#clock
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `clock`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **start** message has been received.
 *
 * @event Input#start
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `start`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **continue** message has been received.
 *
 * @event Input#continue
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `continue`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **stop** message has been received.
 *
 * @event Input#stop
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `stop`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when an **active sensing** message has been received.
 *
 * @event Input#activesensing
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `activesensing`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when a **reset** message has been received.
 *
 * @event Input#reset
 *
 * @type {object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `reset`
 *
 * @since 2.1
 */
/**
 * Input-wide (system) event emitted when an unknown MIDI message has been received. It could
 * be, for example, one of the undefined/reserved messages.
 *
 * @event Input#unknownmessage
 *
 * @type {Object}
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input} target The object that dispatched the event.
 * @property {Message} message A [`Message`](Message) object containing information about the
 * incoming MIDI message.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type `unknownmessage`
 *
 * @since 2.1
 */
