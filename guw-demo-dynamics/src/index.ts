import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


type Zone = { value: any; metadata: Record<string, any>; }[];

@customElement('guw-demo-dynamics')
export class MyElement extends LitElement {
    @state()
    private threshold = 0.5;

    @state()
    private gain = 1;
    
    private _zoneDynamics: Zone = [];
    public get zoneDynamics(): Zone { return this._zoneDynamics; }
    @property({ type: Object })
    public set zoneDynamics(value: Zone) {
        console.log('zoneDynamics', value)
        this._zoneDynamics = value;
        this.threshold = value[0]?.value ?? this.threshold;
        this.gain = Math.max(this.threshold, value[1]?.value ?? this.gain);
    }

    public render() {
        return html`
            <svg viewBox="0 0 100 100">
                <circle cx="100" cy="${(1 - this.gain) * 100}" r="5" stroke="gray" fill="transparent" stroke-width=".8"/>
                <circle cx="50" cy="${(1 - this.threshold) * 100}" r="5" stroke="gray" fill="transparent" stroke-width=".8"/>
                <line x1="0" y1="100" x2="50" y2="${(1 - this.threshold) * 100}" stroke-linecap="round" stroke="gray" stroke-width=".8" />
                <line x1="50" y1="${(1 - this.threshold) * 100}" x2="100" y2="${(1 - this.gain) * 100}" stroke-linecap="round" stroke="gray" stroke-width=".8" />
            </svg>
        `;
    }
}