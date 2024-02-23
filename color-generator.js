// https://www.myndex.com/WEB/LuminanceContrast
function getLuminance(rgb) {
    const r = Math.pow(rgb.r / 255, 2.2)
    const g = Math.pow(rgb.g / 255, 2.2)
    const b = Math.pow(rgb.b / 255, 2.2)

    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722
    return luminance
}

// https://www.myndex.com/WEB/LuminanceContrast
// Y = Luminance
function YtoLstar(Y) {
    if (Y <= (216 / 24389)) return Y * (24389 / 27)
    return Math.pow(Y, 1 / 3) * 116 - 16
}

// https://www.myndex.com/WEB/LuminanceContrast
function getContrastRatio(rgb1, rgb2){
    const L1 = YtoLstar(getLuminance(rgb1))
    const L2 = YtoLstar(getLuminance(rgb2))
    const lightestL1 = Math.max(L1, L2)
    const darkerL1 = Math.min(L1, L2)

    const ratio = lightestL1 - darkerL1

    // value: 0 (darkest) -> 100 (lightess)
    return ratio
}

// https://stackoverflow.com/a/64090995
function hslToRgb(hsl) {
    let a = hsl.s * Math.min(hsl.l, 1 - hsl.l)
    let f = (n, k = (n + hsl.h / 30) % 12) => hsl.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return {
        r: Math.round(f(0) * 255), 
        g: Math.round(f(8) * 255), 
        b: Math.round(f(4) * 255)
    }
} 

function hexToHSL(hex) {
    // Validate hex string
    if (!/^#?([0-9a-f]{3}){1,2}$/i.test(hex)) {
        throw new Error("Invalid hex color format!")
    }
  
    // Remove leading hashtag
    hex = hex.startsWith("#") ? hex.slice(1) : hex
  
    // Convert hex to RGB values (0-255)
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
  
    // Calculate max and min RGB values
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
  
    // Calculate hue
    let h
    if (max === min) {
        h = 0 // No hue
    } else if (max === r) {
        h = 60 * (g - b) / (max - min) + 360
    } else if (max === g) {
        h = 60 * (b - r) / (max - min) + 120
    } else {
        h = 60 * (r - g) / (max - min) + 240
    }
  
    // Calculate saturation
    const l = (max + min) / 2
    const s = max === min 
        ? 0 
        : (max - min) / (l > 0.5 ? 2 - max - min : max + min)
  
    // Return HSL values (0-360, 0-1, 0-1)
    return { h: h % 360, s, l }
}

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

    function getLightness(hsl, targetRatio){
        let lightness = 0, minDiff = 0, ratio = 0
        ratio = getContrastRatio(hslToRgb(hsl), hslToRgb({...hsl, l: 0})) / 100 * (targetRatio + 1)
        minDiff = Math.abs(ratio - targetRatio)
        for (let i = 0; i < 21; i++){
            const l = i * 5 / 100 // 0.0 -> 1.0
            ratio = getContrastRatio(hslToRgb(hsl), hslToRgb({...hsl, l})) / 100 * (targetRatio + 1)
            const diff = Math.abs(ratio - targetRatio)
            if (diff < minDiff) {
                lightness = l
                minDiff = diff
            }
        }
        return lightness
    }

    color = hsl
    onColor = {...hsl, l: getLightness(hsl, 4.5)}
    colorDark = {...color, l: getLightness(color, 0.3)}
    onColorDark = {...colorDark, l: getLightness(colorDark, 4.5)}

    return { 
        color       : rgbToHex(hslToRgb(color       )), 
        onColor     : rgbToHex(hslToRgb(onColor     )), 
        colorDark   : rgbToHex(hslToRgb(colorDark   )), 
        onColorDark : rgbToHex(hslToRgb(onColorDark )) 
    }
}

export default generateColor