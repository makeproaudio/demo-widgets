import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';


type Zone = { value: any; metadata: Record<string, any>; }[];

@customElement('guw-demo-xy')
export class MyElement extends LitElement {
    static styles = css`
        .draggable {
            cursor: move;
        }
    `;
    @state()
    private x = 0.5;

    @state()
    private y = 0.5;

    private _zoneXy: Zone = [];
    public get zoneXy(): Zone { return this._zoneXy; }
    @property({ type: Object })
    public set zoneXy(value: Zone) {
        this._zoneXy = value;
        this.x = value[0]?.value ?? this.x;
        this.y = value[1]?.value ?? this.y;
    }

    @query('#handle')
    private handle!: SVGCircleElement;

    @query('#svgParent')
    private svg!: SVGSVGElement;

    private currentlyDragging: SVGCircleElement | null = null;

    public firstUpdated() {
        this.handle.addEventListener('mousedown', (event) => this.startDrag(event));
        this.handle.addEventListener('touchstart', (event) => this.startDrag(event));
    }

    private startDrag(event: MouseEvent | TouchEvent) {
        this.currentlyDragging = event.target as SVGCircleElement;
        document.addEventListener('mousemove', (event) => this.drag(event));
        document.addEventListener('touchmove', (event) => this.drag(event));
        document.addEventListener('mouseup', () => this.stopDrag());
        document.addEventListener('touchend', () => this.stopDrag());
    }

    private drag(event: MouseEvent | TouchEvent) {
        if (!this.currentlyDragging) return;
        const y = (event as any).clientY ?? (event as any).touches[0].clientY;
        const x = (event as any).clientX ?? (event as any).touches[0].clientX;
        // process using matrix transform
        const cursorPt = new DOMPoint(x, y).matrixTransform(this.svg.getScreenCTM()!.inverse());
        this.x = Math.min(1, Math.max(0, cursorPt.x / 100));
        this.y = Math.min(Math.max(0, cursorPt.y / 100), 1);
        this.dispatchEvent(new CustomEvent("valueChange", { detail: { index: 0, value: this.x, zone: "xy"} }));
        this.dispatchEvent(new CustomEvent("valueChange", { detail: { index: 1, value: this.y, zone: "xy"} }));
    }

    private stopDrag() {
        this.currentlyDragging = null;
        document.removeEventListener('mousemove', (event) => this.drag(event));
        document.removeEventListener('touchmove', (event) => this.drag(event));
    }

    public render() {
        return html`
            <svg viewBox="-10 -10 120 120" id="svgParent">
                <rect x="0" y="0" width="100" height="100" fill="transparent" stroke="#80808080" stroke-width=".8"/>

                <!-- dotted lines cented on the rect (x and y) -->
                <line x1="0" y1="50" x2="100" y2="50" stroke="#80808080" stroke-width=".8" stroke-dasharray="2,2"/>
                <line x1="50" y1="0" x2="50" y2="100" stroke="#80808080" stroke-width=".8" stroke-dasharray="2,2"/>

                <!-- dotted lines for the 4 quadrants, each one vertical and horizontal -->
                <line x1="25" y1="0" x2="25" y2="100" stroke="#80808080" stroke-width=".5" stroke-dasharray="1,4"/>
                <line x1="75" y1="0" x2="75" y2="100" stroke="#80808080" stroke-width=".5" stroke-dasharray="1,4"/>
                <line x1="0" y1="25" x2="100" y2="25" stroke="#80808080" stroke-width=".5" stroke-dasharray="1,4"/>
                <line x1="0" y1="75" x2="100" y2="75" stroke="#80808080" stroke-width=".5" stroke-dasharray="1,4"/>

                <circle cx="${this.x * 100}" cy="${this.y * 100}" r="5" fill="transparent" stroke="orange" stroke-width=".8"/>
                <circle cx="${this.x * 100}" cy="${this.y * 100}" r="1" fill="orange" />
                <circle id="handle" class="draggable" cx="${this.x * 100}" cy="${this.y * 100}" r="20" fill="transparent" stroke-width=".8"/>
            </svg>
        `;
    }
}