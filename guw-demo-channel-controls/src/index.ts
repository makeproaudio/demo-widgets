import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

type Zone = { value: any; metadata: Record<string, any>; }[];

@customElement('guw-demo-channel-controls')
export class MyElement extends LitElement {
    static styles = css`
        .d-flex {
            display: flex;
        }
        .justify-content-evenly {
            justify-content: space-evenly;
        }
        .flex-column {
            flex-direction: column;
        }
        .m-1 {
            margin: 5px;
        }
        .meter {
            position: relative;
            width: 15px;
        }
        .meter-bg {
            display: flex;
            align-self: stretch;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background-color: #555;
            height: 100%;
            padding: 15px 5px;
        }
        .meter-fg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            display: flex;
            align-self: stretch;
            background-color: #000;
            background-image: linear-gradient(
                to bottom,
                #ffff00 0%,
                #00ff00 100%
            );
            padding: 15px 5px;
        }
        .meter span {
            font-size: 10px;
            color: #000;
            text-align: center;
        }
        .meter-bg span {
            color: #fff;
        }
        .content {
            padding: 10px;
            margin-left: 20px;
        }

        .btn {
            border-radius: 5px;
            border: 1px solid #000;
            padding: 5px;
            height: 100%;
        }

        .ab { background-color: #888800; }
        .ab.active { background-color: #FFFF00; }

        .isolate { background-color: #888; }
        .isolate.active { background-color: #FF0000; }

        .rec { background-color: #888; }
        .rec.active { background-color: #FF0000; }

        .afl { background-color: #000088; color: white }
        .afl.active { background-color: #0000FF; }

        .spill { background-color: #888; }
        .spill.active { background-color: #FFFF00; }

        .h-100 {
            height: 100%;
        }

        .text-center {
            text-align: center;
        }
    `;

    @state()
    a = true;

    @state()
    isolate = false;

    @state()
    rec = false;

    @state()
    afl = true;

    @state()
    spill = false;

    private meteringInterval: number;

    @state()
    public meteringLevel = 0;

    
    @property({ type: Number })
    public value = 0;

    
    @property({ type: Object })
    public metadata: Record<string, any> = {};

    constructor() {
        super();
        this.meteringInterval = setInterval(() => {
            const newMeter = Math.random();
            if (newMeter > this.meteringLevel) {
                this.meteringLevel = newMeter;
            }
        }, 1000);
        let lastFrame = 0;
        const frame = (timestamp: number) => {
            if (lastFrame === 0) {
                lastFrame = timestamp;
            }
            const delta = timestamp - lastFrame;
            lastFrame = timestamp;
            if (this.meteringLevel > 0) {
                this.meteringLevel = Math.max(0.05, this.meteringLevel - (delta / 3000));
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    public disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this.meteringInterval);
    }

    public render() {
        return html`
            <div class="d-flex h-100">
                <div class="meter position-relative">
                    <div class="meter-bg h-100 d-flex justify-content-evenly flex-column">
                        <span>-3</span><span>-6</span><span>-12</span><span>-24</span><span>-48</span>
                    </div>
                    <div class="meter-fg d-flex justify-content-evenly flex-column" style="clip-path: polygon(0 ${(1 - this.meteringLevel) * 100}%, 0 100%, 100% 100%, 100% ${(1 - this.meteringLevel) * 100}%)">
                        <span>-3</span><span>-6</span><span>-12</span><span>-24</span><span>-48</span>
                    </div>
                </div>

                <div class="content d-flex flex-column justify-content-evenly">
                    <div class="encoder text-center">
                        ${this.value}<br>
                        ${this.metadata.label}
                    </div>
                    <button class="btn m-1 ab ${this.a ? "active" : ""}" @mousedown=${() => this.a = !this.a} @touchstart=${(event) => {this.a = !this.a; event?.preventDefault()}}>${this.a ? "A" : "B"}</button>
                    <button class="btn m-1 isolate ${this.isolate ? "active" : ""}" @mousedown=${() => this.isolate = !this.isolate} @touchstart=${(event) => {this.isolate = !this.isolate; event?.preventDefault()}}>ISOLATE</button>
                    <button class="btn m-1 rec ${this.rec ? "active" : ""}" @mousedown=${() => this.rec = !this.rec} @touchstart=${(event) => {this.rec = !this.rec; event?.preventDefault()}}>REC</button>
                    <button class="btn m-1 afl ${this.afl ? "active" : ""}" @mousedown=${() => this.afl = !this.afl} @touchstart=${(event) => {this.afl = !this.afl; event?.preventDefault()}}>${this.afl ? "AFL" : "PFL"}</button>
                    <button class="btn m-1 spill ${this.spill ? "active" : ""}" @mousedown=${() => this.spill = !this.spill} @touchstart=${(event) => {this.spill = !this.spill; event?.preventDefault()}}>SPILL</button>
                </div>
            </div>
        `;
    }
}