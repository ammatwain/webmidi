import { Input } from "./Input";
import { InputChannel } from "./InputChannel";
import { Message } from "./Message";
import { Note } from "./Note";
import { Output } from "./Output";
import { WebMidi } from "./WebMidi";
export interface Navigator {
    /**
     * When invoked, returns a Promise object representing a request for access to MIDI devices on the
     * user's system.
     */
    requestMIDIAccess(options?: WebMidiApi.MIDIOptions): Promise<WebMidiApi.MIDIAccess>;
    close: any;
}
export declare namespace WebMidiApi {
    interface MIDIOptions {
        /**
         * This member informs the system whether the ability to send and receive system
         * exclusive messages is requested or allowed on a given MIDIAccess object.
         */
        sysex: boolean;
    }
    /**
     * This is a maplike interface whose value is a MIDIInput instance and key is its
     * ID.
     */
    type MIDIInputMap = Map<string, MIDIInput>;
    /**
     * This is a maplike interface whose value is a MIDIOutput instance and key is its
     * ID.
     */
    type MIDIOutputMap = Map<string, MIDIOutput>;
    interface MIDIAccess extends EventTarget {
        /**
         * The MIDI input ports available to the system.
         */
        inputs: MIDIInputMap;
        /**
         * The MIDI output ports available to the system.
         */
        outputs: MIDIOutputMap;
        /**
         * The handler called when a new port is connected or an existing port changes the
         * state attribute.
         */
        onstatechange(e: MIDIConnectionEvent): void;
        addEventListener(type: 'statechange', listener: (this: this, e: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        /**
         * This attribute informs the user whether system exclusive support is enabled on
         * this MIDIAccess.
         */
        sysexEnabled: boolean;
    }
    type MIDIPortType = 'input' | 'output';
    type MIDIPortDeviceState = 'disconnected' | 'connected';
    type MIDIPortConnectionState = 'open' | 'closed' | 'pending';
    interface MIDIPort extends EventTarget {
        /**
         * A unique ID of the port. This can be used by developers to remember ports the
         * user has chosen for their application.
         */
        id: string;
        /**
         * The manufacturer of the port.
         */
        manufacturer?: string | undefined;
        /**
         * The system name of the port.
         */
        name?: string | undefined;
        /**
         * A descriptor property to distinguish whether the port is an input or an output
         * port.
         */
        type: MIDIPortType;
        /**
         * The version of the port.
         */
        version?: string | undefined;
        /**
         * The state of the device.
         */
        state: MIDIPortDeviceState;
        /**
         * The state of the connection to the device.
         */
        connection: MIDIPortConnectionState;
        /**
         * The handler called when an existing port changes its state or connection
         * attributes.
         */
        onstatechange(e: MIDIConnectionEvent): void;
        addEventListener(type: 'statechange', listener: (this: this, e: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        /**
         * Makes the MIDI device corresponding to the MIDIPort explicitly available. Note
         * that this call is NOT required in order to use the MIDIPort - calling send() on
         * a MIDIOutput or attaching a MIDIMessageEvent handler on a MIDIInputPort will
         * cause an implicit open().
         *
         * When invoked, this method returns a Promise object representing a request for
         * access to the given MIDI port on the user's system.
         */
        open(): Promise<MIDIPort>;
        /**
         * Makes the MIDI device corresponding to the MIDIPort
         * explicitly unavailable (subsequently changing the state from "open" to
         * "connected"). Note that successful invocation of this method will result in MIDI
         * messages no longer being delivered to MIDIMessageEvent handlers on a
         * MIDIInputPort (although setting a new handler will cause an implicit open()).
         *
         * When invoked, this method returns a Promise object representing a request for
         * access to the given MIDI port on the user's system. When the port has been
         * closed (and therefore, in exclusive access systems, the port is available to
         * other applications), the vended Promise is resolved. If the port is
         * disconnected, the Promise is rejected.
         */
        close(): Promise<MIDIPort>;
    }
    interface MIDIInput extends MIDIPort {
        type: 'input';
        onmidimessage(e: MIDIMessageEvent): void;
        addEventListener(type: 'midimessage', listener: (this: this, e: MIDIMessageEvent) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: 'statechange', listener: (this: this, e: MIDIConnectionEvent) => any, options?: boolean | AddEventListenerOptions): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    }
    interface MIDIOutput extends MIDIPort {
        type: 'output';
        /**
         * Enqueues the message to be sent to the corresponding MIDI port.
         * @param data The data to be enqueued, with each sequence entry representing a single byte of data.
         * @param timestamp The time at which to begin sending the data to the port. If timestamp is set
         * to zero (or another time in the past), the data is to be sent as soon as
         * possible.
         */
        send(data: number[] | Uint8Array, timestamp?: number): void;
        /**
         * Clears any pending send data that has not yet been sent from the MIDIOutput 's
         * queue. The implementation will need to ensure the MIDI stream is left in a good
         * state, so if the output port is in the middle of a sysex message, a sysex
         * termination byte (0xf7) should be sent.
         */
        clear(): void;
    }
    interface MIDIMessageEvent extends Event {
        /**
         * A timestamp specifying when the event occurred.
         */
        receivedTime: number;
        /**
         * A Uint8Array containing the MIDI data bytes of a single MIDI message.
         */
        data: Uint8Array;
    }
    interface MIDIMessageEventInit extends EventInit {
        /**
         * A timestamp specifying when the event occurred.
         */
        receivedTime: number;
        /**
         * A Uint8Array containing the MIDI data bytes of a single MIDI message.
         */
        data: Uint8Array;
    }
    interface MIDIConnectionEvent extends Event {
        /**
         * The port that has been connected or disconnected.
         */
        port: MIDIPort;
    }
    interface MIDIConnectionEventInit extends EventInit {
        /**
         * The port that has been connected or disconnected.
         */
        port: MIDIPort;
    }
}
export type EventEmitterCallback = (...args: any[]) => void;
/**
 * The `Event` object is transmitted when state change events occur.
 *
 * WebMidi
 *  * disabled
 *  * enabled
 *  * midiaccessgranted
 *
 * @property {WebMidi} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 */
export interface Event {
    target: EventTarget | Input | InputChannel | Output | WebMidi | null;
    timestamp: DOMHighResTimeStamp;
    type: string;
}
/**
 * The `ErrorEvent` object is transmitted when an error occurs. Only the `WebMidi` object dispatches
 * this type of event.
 *
 * @property {Input} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 * @property {*} error The type of the event
 *
 */
export interface ErrorEvent extends Event {
    error: any;
    target: WebMidi;
}
/**
 * The `PortEvent` object is transmitted when an event occurs on an `Input` or `Output` port.
 *
 * Input
 *  * closed
 *  * disconnected
 *  * opened
 *
 * Output
 *  * closed
 *  * disconnected
 *  * opened
 *
 * WebMidi
 *  * connected
 *  * disconnected
 *  * portschanged
 *
 * @property {Input|Output} port The `Input` or `Output` that triggered the event
 * @property {Input | InputChannel | Output | WebMidi} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 */
export interface PortEvent extends Event {
    port: any;
}
/**
 * The `MessageEvent` object is transmitted when a MIDI message has been received. These events
 * are dispatched by `Input` and `InputChannel` classes:
 *
 * `Input`: activesensing, clock, continue, midimessage, reset, songposition, songselect, start,
 * stop, sysex, timecode, tunerequest, unknownmessage
 *
 * `InputChannel`: allnotesoff, allsoundoff, midimessage, resetallcontrollers, channelaftertouch,
 * localcontrol, monomode, omnimode, pitchbend, programchange
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input | InputChannel} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 * @property {Message} message An object containing details about the actual MIDI message content.
 * @property {number} [rawValue] The raw value of the message (if any) between 0-127.
 * @property {number | boolean} [value] The value of the message (if any)
 */
export interface MessageEvent extends PortEvent {
    message: Message;
    port: Input;
    rawValue?: number;
    target: Input | InputChannel;
    value?: number | boolean;
}
/**
 * The `ControlChangeMessageEvent` object is transmitted when a control change MIDI message has been
 * received. There is a general `controlchange` event and a specific `controlchange-controllerxxx`
 * for each controller.
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input | InputChannel} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 * @property {Message} message An object containing details about the actual MIDI message content.
 * @property {number} [rawValue] The raw value of the message (if any) between 0-127.
 * @property {number | boolean} [value] The value of the message (if any)
 *
 * @property {object} controller
 * @property {string} controller.name The name of the controller
 * @property {number} controller.number The number of the controller (between 0-127)
 * @property {string} controller.description Uesr-friendly representation of the controller's
 * default function.
 * @property {string} controller.position Whether the controller is meant to be an `msb` or `lsb`
 * @property {string} [subtype] The actual controller event type
 */
export interface ControlChangeMessageEvent extends MessageEvent {
    channel: number;
    controller: {
        name: string;
        number: number;
        description: string;
        position: string;
    };
    port: Input;
    subtype?: string;
    target: Input | InputChannel;
}
/**
 * The `NoteMessageEvent` object is transmitted when a note-related MIDI message (`noteoff`,
 * `noteon` or `keyaftertouch`) is received on an input channel
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input | InputChannel} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 * @property {Message} message An object containing details about the actual MIDI message content.
 * @property {number} [rawValue] The raw value of the message (if any) between 0-127.
 * @property {number | boolean} [value] The value of the message (if any)
 *
 * @property {Note} note A Note object with details about the triggered note.
 */
export interface NoteMessageEvent extends MessageEvent {
    channel: number;
    note: Note;
    port: Input;
    target: Input | InputChannel;
}
/**
 * The `ParameterNumberMessageEvent` object is transmitted when an RPN or NRPN message is received
 * on an input channel.
 *
 *  * nrpn
 *  * nrpn-datadecrement
 *  * nrpn-dataincrement
 *  * nrpn-dataentrycoarse
 *  * nrpn-dataentryfine
 *
 *  * rpn
 *  * rpn-datadecrement
 *  * rpn-dataincrement
 *  * rpn-dataentrycoarse
 *  * rpn-dataentryfine
 *
 * @property {Input} port The `Input` that triggered the event.
 * @property {Input | InputChannel} target The object that dispatched the event.
 * @property {number} timestamp The moment (DOMHighResTimeStamp) when the event occurred (in
 * milliseconds since the navigation start of the document).
 * @property {string} type The type of the event
 *
 * @property {Message} message An object containing details about the actual MIDI message content.
 * @property {number} [rawValue] The raw value of the message (if any) between 0-127.
 * @property {number | boolean} [value] The value of the message (if any)
 *
 * @property {string} parameter The parameter
 * @property {number} parameterMsb The parameter' MSB value (0-127)
 * @property {number} parameterLsb The parameter' LSB value (0-127)
 *
 */
export interface ParameterNumberMessageEvent extends MessageEvent {
    channel: number;
    parameter: string;
    parameterMsb: number;
    parameterLsb: number;
    port: Input;
    target: Input | InputChannel;
}
/**
 * A map of all the events that can be passed to `InputChannel.addListener()`.
 */
export interface InputChannelEventMap {
    "midimessage": (e: MessageEvent) => void;
    "channelaftertouch": (e: MessageEvent) => void;
    "keyaftertouch": (e: NoteMessageEvent) => void;
    "noteoff": (e: NoteMessageEvent) => void;
    "noteon": (e: NoteMessageEvent) => void;
    "pitchbend": (e: MessageEvent) => void;
    "programchange": (e: MessageEvent) => void;
    "controlchange": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller0": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller1": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller2": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller3": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller4": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller5": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller6": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller7": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller8": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller9": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller10": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller11": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller12": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller13": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller14": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller15": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller16": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller17": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller18": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller19": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller20": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller21": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller22": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller23": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller24": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller25": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller26": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller27": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller28": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller29": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller30": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller31": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller32": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller33": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller34": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller35": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller36": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller37": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller38": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller39": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller40": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller41": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller42": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller43": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller44": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller45": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller46": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller47": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller48": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller49": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller50": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller51": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller52": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller53": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller54": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller55": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller56": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller57": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller58": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller59": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller60": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller61": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller62": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller63": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller64": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller65": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller66": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller67": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller68": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller69": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller70": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller71": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller72": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller73": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller74": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller75": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller76": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller77": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller78": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller79": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller80": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller81": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller82": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller83": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller84": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller85": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller86": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller87": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller88": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller89": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller90": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller91": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller92": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller93": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller94": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller95": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller96": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller97": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller98": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller99": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller100": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller101": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller102": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller103": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller104": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller105": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller106": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller107": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller108": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller109": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller110": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller111": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller112": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller113": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller114": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller115": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller116": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller117": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller118": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller119": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller120": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller121": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller122": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller123": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller124": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller125": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller126": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller127": (e: ControlChangeMessageEvent) => void;
    "allnotesoff": (e: MessageEvent) => void;
    "allsoundoff": (e: MessageEvent) => void;
    "localcontrol": (e: MessageEvent) => void;
    "monomode": (e: MessageEvent) => void;
    "omnimode": (e: MessageEvent) => void;
    "resetallcontrollers": (e: MessageEvent) => void;
    "nrpn": (e: ParameterNumberMessageEvent) => void;
    "nrpn-datadecrement": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataincrement": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataentrycoarse": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataentryfine": (e: ParameterNumberMessageEvent) => void;
    "rpn": (e: ParameterNumberMessageEvent) => void;
    "rpn-datadecrement": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataincrement": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataentrycoarse": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataentryfine": (e: ParameterNumberMessageEvent) => void;
}
/**
 * A map of all the events that can be passed to `Output.addListener()`.
 */
export interface PortEventMap {
    "closed": (e: PortEvent) => void;
    "disconnected": (e: PortEvent) => void;
    "opened": (e: PortEvent) => void;
}
/**
 * A map of all the events that can be passed to `Input.addListener()`.
 */
export interface InputEventMap extends PortEventMap {
    "activesensing": (e: MessageEvent) => void;
    "clock": (e: MessageEvent) => void;
    "continue": (e: MessageEvent) => void;
    "reset": (e: MessageEvent) => void;
    "songposition": (e: MessageEvent) => void;
    "songselect": (e: MessageEvent) => void;
    "start": (e: MessageEvent) => void;
    "stop": (e: MessageEvent) => void;
    "sysex": (e: MessageEvent) => void;
    "timecode": (e: MessageEvent) => void;
    "tunerequest": (e: MessageEvent) => void;
    "midimessage": (e: MessageEvent) => void;
    "unknownmessage": (e: MessageEvent) => void;
    "channelaftertouch": (e: MessageEvent) => void;
    "keyaftertouch": (e: NoteMessageEvent) => void;
    "noteoff": (e: NoteMessageEvent) => void;
    "noteon": (e: NoteMessageEvent) => void;
    "pitchbend": (e: MessageEvent) => void;
    "programchange": (e: MessageEvent) => void;
    "controlchange": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller0": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller1": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller2": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller3": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller4": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller5": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller6": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller7": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller8": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller9": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller10": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller11": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller12": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller13": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller14": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller15": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller16": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller17": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller18": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller19": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller20": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller21": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller22": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller23": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller24": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller25": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller26": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller27": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller28": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller29": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller30": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller31": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller32": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller33": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller34": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller35": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller36": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller37": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller38": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller39": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller40": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller41": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller42": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller43": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller44": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller45": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller46": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller47": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller48": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller49": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller50": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller51": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller52": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller53": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller54": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller55": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller56": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller57": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller58": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller59": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller60": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller61": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller62": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller63": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller64": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller65": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller66": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller67": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller68": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller69": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller70": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller71": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller72": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller73": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller74": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller75": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller76": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller77": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller78": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller79": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller80": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller81": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller82": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller83": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller84": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller85": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller86": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller87": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller88": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller89": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller90": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller91": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller92": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller93": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller94": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller95": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller96": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller97": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller98": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller99": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller100": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller101": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller102": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller103": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller104": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller105": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller106": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller107": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller108": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller109": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller110": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller111": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller112": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller113": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller114": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller115": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller116": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller117": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller118": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller119": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller120": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller121": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller122": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller123": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller124": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller125": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller126": (e: ControlChangeMessageEvent) => void;
    "controlchange-controller127": (e: ControlChangeMessageEvent) => void;
    "allnotesoff": (e: MessageEvent) => void;
    "allsoundoff": (e: MessageEvent) => void;
    "localcontrol": (e: MessageEvent) => void;
    "monomode": (e: MessageEvent) => void;
    "omnimode": (e: MessageEvent) => void;
    "resetallcontrollers": (e: MessageEvent) => void;
    "nrpn": (e: ParameterNumberMessageEvent) => void;
    "nrpn-datadecrement": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataincrement": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataentrycoarse": (e: ParameterNumberMessageEvent) => void;
    "nrpn-dataentryfine": (e: ParameterNumberMessageEvent) => void;
    "rpn": (e: ParameterNumberMessageEvent) => void;
    "rpn-datadecrement": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataincrement": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataentrycoarse": (e: ParameterNumberMessageEvent) => void;
    "rpn-dataentryfine": (e: ParameterNumberMessageEvent) => void;
}
/**
 * A map of all the events that can be passed to `Output.addListener()`.
 */
export interface WebMidiEventMap {
    "connected": (e: PortEvent) => void;
    "disabled": (e: Event) => void;
    "disconnected": (e: PortEvent) => void;
    "enabled": (e: Event) => void;
    "midiaccessgranted": (e: Event) => void;
    "portschanged": (e: PortEvent) => void;
    "error": (e: ErrorEvent) => void;
}
