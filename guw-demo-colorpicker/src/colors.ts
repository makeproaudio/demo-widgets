
type NumberTriplet = [number, number, number];

// /**
//  * converts rgb to hsl with each value normalized to 0-1
//  * @param r Red
//  * @param g Green
//  * @param b Blue
//  * @returns [h, s, l]
//  */
export const rgbToNormalizedHsl = (r: number, g: number, b: number): NumberTriplet => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        // eslint-disable-next-line no-multi-assign
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
        default:
            break;
        }
        h /= 6;
    }

    return [h, s, l];
};

export const normalizedHslTo32bitHsl = (h: number, s: number, l: number) => {
    h = Math.round(h * 0xFFFF);
    s = Math.round(s * 0xFF);
    l = Math.round(l * 0xFF);
    return (h << 16) | (s << 8) | l;
};

export const hslToNormalizedHsl = (hsl: number): NumberTriplet => {
    const h = (hsl >> 16) & 0xFFFF;
    const s = (hsl >> 8) & 0xFF;
    const l = hsl & 0xFF;
    return [h / 0xFFFF, s / 0xFF, l / 0xFF];
};
export const normalizedHslToHslString = (h: number, s: number, l: number) => `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;

export const hslToHslString = (hsl: number) => normalizedHslToHslString(...hslToNormalizedHsl(hsl));

export const rgbStringToRgb = (color: string): NumberTriplet => {
    color = color.replace(/^#/, "");
    if (color.length === 3) {
        color = color.replace(/(.)/g, "$1$1");
    }
    const rgb = parseInt(color, 16);
    return [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
};

export const rgbToHsl = (color: string, curve: keyof typeof LIGHTNESS_CURVES = "linear") => {
    const [r, g, b] = rgbStringToRgb(color);
    return normalizedHslTo32bitHsl(...rgbToNormalizedHsl(r, g, b).map((x, i) => (i === 2 ? LIGHTNESS_CURVES[curve](x) : x)) as NumberTriplet);
};

export const rgbToRgbString = (r: number, g: number, b: number) => `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

export const hslLightnessFactor = (hsl: number, factor: number) => {
    // eslint-disable-next-line prefer-const
    let [h, s, l] = hslToNormalizedHsl(hsl);
    l *= factor;
    return normalizedHslTo32bitHsl(h, s, l);
};
export const setHslLightness = (hsl: number, lightness: number) => {
    // eslint-disable-next-line prefer-const
    let [h, s, l] = hslToNormalizedHsl(hsl);
    l = lightness;
    return normalizedHslTo32bitHsl(h, s, l);
};

const LIGHTNESS_CURVES = {
    linear: (x: number) => x,
    mpxHardwareLeds: (x: number) => (x > 0.5 ? x : (((130 ** (2 * x)) - 1) / 129) / 2),
    mpxHardwareLedsInverted: (x: number) => (x > 0.5 ? x : (Math.log(129 * (2 * x) + 1) / Math.log(130)) / 2),
};

export const hslToRgb = (hsl: number, curve: keyof typeof LIGHTNESS_CURVES = "linear") => {
    // eslint-disable-next-line prefer-const
    let [h, s, l] = hslToNormalizedHsl(hsl);
    l = LIGHTNESS_CURVES[curve](l);
    return normalizedHslToRgb(h, s, l);
};

export const normalizedHslToRgb = (h: number, s: number, l: number): NumberTriplet => {
    let r;
    let g;
    let b;

    if (s === 0) {
        // eslint-disable-next-line no-multi-assign
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// /**
//  * converts hue 0-360, saturation 0-1, lightness 0-1 to a 32 bit hsl
//  */
export const hsl = (hue: number, saturation?: number, lightness?: number) => normalizedHslTo32bitHsl(hue / 360, saturation ?? 1, lightness ?? 0.5);
