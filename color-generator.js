/**
 * Source: https://www.myndex.com/WEB/LuminanceContrast
 * 
 * Range (rgb): 
 * * `r: 0-255` 
 * * `g: 0-255`
 * * `b: 0-255`
 * @param {{ r: number, g: number, b: number }} rgb 
 */
function getLuminance(rgb) {
    const r = Math.pow(rgb.r / 255, 2.2)
    const g = Math.pow(rgb.g / 255, 2.2)
    const b = Math.pow(rgb.b / 255, 2.2)
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722

    return luminance
}

/**
 * Source: https://www.myndex.com/WEB/LuminanceContrast
 * 
 * `Y` = Luminance 
 * @param { number } Y 
 */
function YtoLstar(Y) {
    if (Y <= (216 / 24389)) return Y * (24389 / 27)
    return Math.pow(Y, (1 / 3)) * 116 - 16
}

/**
 * Source: https://www.myndex.com/WEB/LuminanceContrast
 * 
 * Range (rgb): 
 * * `r: 0-255` 
 * * `g: 0-255`
 * * `b: 0-255`
 * 
 * Result value is between `0` (low contrast) to `100` (high contrast)
 * @param {{ r: number, g: number, b: number }} rgb1 
 * @param {{ r: number, g: number, b: number }} rgb2 
 */
function getContrastRatio(rgb1, rgb2){
    const L1 = YtoLstar(getLuminance(rgb1))
    const L2 = YtoLstar(getLuminance(rgb2))
    const ratio = Math.max(L1, L2) - Math.min(L1, L2)
    return ratio
}

/**
     * Range (hsl): 
     * - `h: 0-1`
     * - `s: 0-1`
     * - `l: 0-1`
     * @param {string} hex 
     */
function hexToHSL(hex) {
    if (!/^#?([0-9a-f]{3}){1,2}$/i.test(hex)) {
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

/**
 * Source: http://www.easyrgb.com/en/math.php?MATH=M19#text19
 * @param {number} v1 
 * @param {number} v2 
 * @param {number} vH 
 */
function hueToRgb(v1, v2, vH) {
    while (vH < 0) vH += 1
    while (vH > 1) vH -= 1

    if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH
    if (2 * vH < 1) return v2
    if (3 * vH < 2) return v1 + (v2 - v1) * (2 / 3 - vH) * 6
    return v1
}

/**
 * http://www.easyrgb.com/en/math.php?MATH=M19#text19
 * 
 * Range (rgb): 
 * * `r: 0-255` 
 * * `g: 0-255`
 * * `b: 0-255`
 * @param {{h: number, s: number, l: number}} hsl 
 */
function hslToRgb(hsl) {
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

/**
 * Range (rgb): 
 * * `r: 0-255` 
 * * `g: 0-255`
 * * `b: 0-255`
 * @param {{ r: number, g: number, b: number }} rgb 
 */
function rgbToHex(rgb){
    return '#' + rgb.r.toString(16) + rgb.g.toString(16) + rgb.b.toString(16)
}

/**
 * Generate 4 different color from color source: 
 * - Color
 * - On Color
 * - Color Dark
 * - On Color Dark
 * 
 * @param { string } hexColor 
 */
function generateColor(hexColor){
    const hsl = hexToHSL(hexColor)
    let color, onColor, colorDark, onColorDark

    /**
     * `contrast` must be a value between `0 (bad) => 100 (best (high contrast))`. 
     * @param {{h: number, s: number, l: number}} hsl 
     * @param {number} contrast 
     */
    function getLightness(hsl, contrast){
        let lightness = 0
        const brightness = YtoLstar(getLuminance(hslToRgb(hsl)))

        for (let i = 0; i < 101; i++){
            if (brightness > 50) lightness = i / 100
            else lightness = 1 - (i / 100)

            if (getContrastRatio(hslToRgb(hsl), hslToRgb({...hsl, l: lightness})) < contrast) break
        }

        return Math.max(0.0, Math.min(1.0, lightness))
    }

    color = hsl
    onColor = {...hsl, l: getLightness(hsl, 80)}
    colorDark = {...color, l: getLightness(color, 30)}
    onColorDark = {...colorDark, l: getLightness(colorDark, 80)}

    return { 
        color       : rgbToHex(hslToRgb(color       )), 
        onColor     : rgbToHex(hslToRgb(onColor     )), 
        colorDark   : rgbToHex(hslToRgb(colorDark   )), 
        onColorDark : rgbToHex(hslToRgb(onColorDark )) 
    }
}

export default generateColor