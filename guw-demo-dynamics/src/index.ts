import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';


type Zone = { value: any; metadata: Record<string, any>; }[];

@customElement('guw-demo-dynamics')
export class MyElement extends LitElement {
    static styles = css`
        .draggable {
            cursor: move;
        }
    `;
    @state()
    private threshold = 0.5;

    @state()
    private gain = 1;

    private _zoneDynamics: Zone = [];
    public get zoneDynamics(): Zone { return this._zoneDynamics; }
    @property({ type: Object })
    public set zoneDynamics(value: Zone) {
        this._zoneDynamics = value;
        this.threshold = value[0]?.value ?? this.threshold;
        this.gain = Math.max(this.threshold, value[1]?.value ?? this.gain);
    }

    @query('#thresholdHandle')
    private thresholdHandle!: SVGCircleElement;

    @query('#gainHandle')
    private gainHandle!: SVGCircleElement;

    @query('#svgParent')
    private svg!: SVGSVGElement;

    private currentlyDragging: SVGCircleElement | null = null;

    public firstUpdated() {
        this.thresholdHandle.addEventListener('mousedown', (event) => this.startDrag(event));
        this.thresholdHandle.addEventListener('touchstart', (event) => this.startDrag(event));
        this.gainHandle.addEventListener('mousedown', (event) => this.startDrag(event));
        this.gainHandle.addEventListener('touchstart', (event) => this.startDrag(event));
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
        if (this.currentlyDragging === this.thresholdHandle) {
            this.threshold = Math.min(this.gain, Math.max(0, 1 - (cursorPt.y / 100)));
            this.dispatchEvent(new CustomEvent("valueChange", { detail: { index: 0, value: this.threshold, zone: "dynamics"} }));
        } else {
            this.gain = Math.min(1, Math.max(this.threshold, 1 - (cursorPt.y / 100)));
            this.dispatchEvent(new CustomEvent("valueChange", { detail: { index: 1, value: this.gain, zone: "dynamics"} }));
        }
    }

    private stopDrag() {
        this.currentlyDragging = null;
        document.removeEventListener('mousemove', (event) => this.drag(event));
        document.removeEventListener('touchmove', (event) => this.drag(event));
    }

    public render() {
        return html`
            <svg viewBox="-10 -10 120 120" id="svgParent">
                <line x1="${(0.5 - this.threshold) * 100}" y1="100" x2="50" y2="${(1 - this.threshold) * 100}" stroke-linecap="round" stroke="orange" stroke-width=".8" />
                <line x1="50" y1="${(1 - this.threshold) * 100}" x2="100" y2="${(1 - this.gain) * 100}" stroke-linecap="round" stroke="orange" stroke-width=".8" />

                <circle cx="50" cy="${(1 - this.threshold) * 100}" r="5" fill="transparent" stroke="gray" stroke-width=".8"/>
                <circle id="thresholdHandle" class="draggable" cx="50" cy="${(1 - this.threshold) * 100}" r="20" fill="transparent" stroke-width=".8"/>

                <circle cx="100" cy="${(1 - this.gain) * 100}" r="5" fill="transparent" stroke="gray" stroke-width=".8"/>
                <circle id="gainHandle" class="draggable" cx="100" cy="${(1 - this.gain) * 100}" r="20" fill="transparent" stroke-width=".8"/>
            </svg>
        `;
    }
}