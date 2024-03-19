export type HSL = {
    h: number // [0-1]
    s: number // [0-1]
    l: number // [0-1]
}

export type RGB = {
    r: number // [0-255]
    g: number // [0-255]
    b: number // [0-255]
}

/**
 * https://www.myndex.com/WEB/LuminanceContrast
 */
export function getLuminance(rgb: RGB) {
    const r = Math.pow(rgb.r / 255, 2.2)
    const g = Math.pow(rgb.g / 255, 2.2)
    const b = Math.pow(rgb.b / 255, 2.2)
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722

    return luminance
}

/**
 * https://www.myndex.com/WEB/LuminanceContrast
 * 
 * `Y` = Luminance
 */
export function YtoLstar(Y: number): number {
    if (Y <= (216 / 24389)) return Y * (24389 / 27)
    return Math.pow(Y, (1 / 3)) * 116 - 16
}

/**
 * https://www.myndex.com/WEB/LuminanceContrast
 * 
 * Result value is between `0` (low contrast) to `100` (high contrast)
 */
export function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
    const L1 = YtoLstar(getLuminance(rgb1))
    const L2 = YtoLstar(getLuminance(rgb2))
    const ratio = Math.max(L1, L2) - Math.min(L1, L2)
    return ratio
}

export function hexToHSL(hex: string) {
    if (!/^#?([0-9a-f]{3}){1,2}$/i.test(hex)) {
        console.log(hex)
        throw new Error("Invalid hex color format!")
    }
  
    hex = hex.startsWith("#") ? hex.slice(1) : hex
  
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
  
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
  
    let h
    if (max === min) h = 0 
    else if (max === r) h = 60 * (g - b) / (max - min) + 360
    else if (max === g) h = 60 * (b - r) / (max - min) + 120
    else h = 60 * (r - g) / (max - min) + 240
  
    const l = (max + min) / 2
    const s = max === min 
        ? 0 
        : (max - min) / (l > 0.5 ? 2 - max - min : max + min)
  
    return { h: h / 360, s, l }
}

export function hexToRGB(hex: string): RGB {
    if (!/^#?([0-9a-f]{3}){1,2}$/i.test(hex)) {
        throw new Error("Invalid hex color format!")
    }
  
    hex = hex.startsWith("#") ? hex.slice(1) : hex
  
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return { r, g, b}
}

/**
 * http://www.easyrgb.com/en/math.php?MATH=M19#text19
 */ 
export function hueToRgb(v1: number, v2: number, vH: number) {
    while (vH < 0) vH += 1
    while (vH > 1) vH -= 1

    if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH
    if (2 * vH < 1) return v2
    if (3 * vH < 2) return v1 + (v2 - v1) * (2 / 3 - vH) * 6
    return v1
}

/**
 * http://www.easyrgb.com/en/math.php?MATH=M19#text19
 */ 
export function hslToRgb(hsl: HSL) {
    let r, g, b
    
    if (hsl.s == 0) r = g = b = hsl.l
    else {
        const v2 = hsl.l < 0.5
            ? hsl.l * (1 + hsl.s)
            : hsl.l + hsl.s - hsl.s * hsl.l
        const v1 = 2 * hsl.l - v2

        r = hueToRgb(v1, v2, hsl.h + 1 / 3)
        g = hueToRgb(v1, v2, hsl.h)
        b = hueToRgb(v1, v2, hsl.h - 1 / 3)
    }

    return {
        r: Math.round(r * 255), 
        g: Math.round(g * 255), 
        b: Math.round(b * 255)
    }
} 

export function hslToHex(hsl: HSL){
    return rgbToHex(hslToRgb(hsl))
}

export function rgbToHex(rgb: RGB){
    return '#' + rgb.r.toString(16).padStart(2, '0') + rgb.g.toString(16).padStart(2, '0') + rgb.b.toString(16).padStart(2, '0')
}


/**
 * Generate 4 different color from color source: 
 * - Color 
 * - On Color
 * - Color Dark
 * - On Color Dark
*/
export function generateColor(hexColor: string): { color: string; onColor: string; colorDark: string; onColorDark: string }{
    const hsl = {...hexToHSL(hexColor), s: 1}
    let color, onColor, colorDark, onColorDark

    /**
     * `contrast` must be a value between `0 (bad) => 100 (best (high contrast))`. 
     */
    function getLightness(hsl: HSL, contrast: number){
        let lightness = 0
        const brightness = YtoLstar(getLuminance(hslToRgb(hsl)))

        for (let i = 0; i < 101; i++){
            if (brightness > 50) lightness = i / 100
            else lightness = 1 - (i / 100)

            if (getContrastRatio(hslToRgb(hsl), hslToRgb({...hsl, l: lightness})) < contrast) break
        }

        return Math.max(0.0, Math.min(1.0, lightness))
    }

    /**
     * @param hsl 
     * @param contrast Range from `0` to `100` (`0`=darkest, `100`=lightest)
     */
    function getColor(hsl: HSL, contrast: number): HSL {
        const highToLow: boolean = contrast <= 50 ? true : false 
        const brightness = (c: HSL) => YtoLstar(getLuminance(hslToRgb(c)))
        let lightness: number = 0
        
        for (let i = 0; i < 101; i++){
            if (highToLow) {
                lightness = 1 - (i / 100)
                hsl = {...hsl, l: lightness}
                if (brightness(hsl) <= contrast) break
            }
            else {
                lightness = i / 100
                hsl = {...hsl, l: lightness}
                if (brightness(hsl) >= contrast) break
            }
        }

        return hsl
    }

    color = getColor(hsl, 36)
    onColor = {...color, l: getLightness(color, 100)}
    colorDark = getColor(hsl, 72)
    onColorDark = {...colorDark, l: getLightness(colorDark, 100)}

    return { 
        color       : hslToHex(color       ), 
        onColor     : hslToHex(onColor     ), 
        colorDark   : hslToHex(colorDark   ), 
        onColorDark : hslToHex(onColorDark ) 
    }
}