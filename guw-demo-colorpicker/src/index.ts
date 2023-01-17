import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import SimplePicker from 'simple-color-picker';
import { hslToRgb, normalizedHslTo32bitHsl, rgbToHsl, rgbToNormalizedHsl } from './colors';

@customElement('guw-demo-colorpicker')
export class MyElement extends LitElement {
    static styles = css`
    .Scp {
        user-select: none;
        position: relative;
      }
      .Scp-saturation {
        position: relative;
        height: 100%;
        background: linear-gradient(to right, #fff, #f00);
        float: left;
        margin-right: 5px;
      }
      .Scp-brightness {
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(255,255,255,0), #000);
      }
      .Scp-sbSelector {
        border: 2px solid #fff;
        position: absolute;
        width: 14px;
        height: 14px;
        background: #fff;
        border-radius: 10px;
        top: -7px;
        left: -7px;
        box-sizing: border-box;
        z-index: 10;
      }
      .Scp-hue {
        width: 20px;
        height: 100%;
        position: relative;
        float: left;
        background: linear-gradient(#f00 0%, #f0f 17%, #00f 34%, #0ff 50%, #0f0 67%, #ff0 84%, #f00 100%);
      }
      .Scp-hSelector {
        position: absolute;
        background: #fff;
        border-bottom: 1px solid #000;
        right: -3px;
        width: 10px;
        height: 2px;
      }
      `;

    private _value: [number, number, number];
    public get value(): number {
        return normalizedHslTo32bitHsl(...rgbToNormalizedHsl(...this._value));
    }
    @property({ type: Number })
    public set value(value: number) {
        this._value = hslToRgb(value * 4294967295 - 2147483648);
    }

    @property({ type: Object })
    public metadata: Record<string, any> = {};

    @query('#picker')
    private parent: HTMLElement;

    private picker: SimplePicker;

    public firstUpdated() {
        super.connectedCallback();
        this.picker = new SimplePicker({
            el: this.parent,
            color: this.value,
        });
        let timeout: number | undefined;
        let needsAnotherUpdate = false;
        this.picker.onChange((color: string) => {
            this._value = [this.picker.getRGB().r, this.picker.getRGB().g, this.picker.getRGB().b]
            const value = (rgbToHsl(color) + 2147483648) / 4294967295;
            const sendUpdate = () => this.dispatchEvent(new CustomEvent('valueChange', { detail: value }));
            if (timeout) {
                needsAnotherUpdate = true;
            } else {
                timeout = setTimeout(() => {
                    if (needsAnotherUpdate) {
                        needsAnotherUpdate = false;
                        sendUpdate();
                    }
                    timeout = undefined;
                }, 100);
            }
        });
    }

    public render() {
        return html`<div id="picker"></div>`;
    }
}