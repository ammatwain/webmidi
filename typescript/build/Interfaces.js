"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortEvent = void 0;
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
class PortEvent extends Event {
}
exports.PortEvent = PortEvent;
//# sourceMappingURL=Interfaces.js.map