import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import "weq8/ui";
import { WEQ8Runtime } from "weq8";

@customElement('guw-demo-eq')
export class MyElement extends LitElement {
    private weq8: WEQ8Runtime;
    private inputRef: Ref<HTMLInputElement> = createRef();
    constructor() {
        super();
        let audioCtx = new AudioContext();
        this.weq8 = new WEQ8Runtime(audioCtx);
        this.weq8.connect(audioCtx.destination);
    }

    @property({ type: Number })
    public value: number;

    @property({ type: Object })
    public metadata: Record<string, any> = {};

    public render() {
        return html`<weq8-ui ${ref(this.inputRef)} />`;
    }

    public firstUpdated() {
        const el = this.inputRef.value as any;
        if (!el) return;
        el.runtime = this.weq8;
    }
}
