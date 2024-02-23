(() => {
    const TEXT_COLOR_RATIO = 4.5
    const root = document.documentElement
    const input_colorPicker = document.getElementById('color-picker')
    const button_theme = document.getElementById('theme')
    const span_colorHex = document.getElementById('color-hex')
    let theme = 'dark'

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

    function hexToRGB(hex) {
        // Validate hex string
        if (!/^#?([0-9a-f]{3}){1,2}$/i.test(hex)) {
            throw new Error("Invalid hex color format!")
        }
      
        // Remove leading hashtag
        hex = hex.startsWith("#") ? hex.slice(1) : hex
      
        // Convert hex to RGB values (0-255)
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)

        return {r, g, b}
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

    function rgbToCSSValue(rgb) {
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    function generateColor(hexColorSource){
        const hsl = hexToHSL(hexColorSource)
        let primaryLight, onPrimaryLight, primaryDark, onPrimaryDark
        let surfaceLight, onSurfaceLight, surfaceDark, onSurfaceDark
        let errorLight,   onErrorLight,   errorDark,   onErrorDark

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
        
        // Primary Light
        primaryLight = hsl
        root.style.setProperty('--color-primary-light', rgbToCSSValue(hslToRgb(primaryLight)))
        
        // On Primary Light
        onPrimaryLight = {...primaryLight, l: getLightness(primaryLight, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-primary-light', rgbToCSSValue(hslToRgb(onPrimaryLight)))
        
        // Surface Light
        surfaceLight = {...hsl, s: 0, l: 0.98}
        root.style.setProperty('--color-surface-light', rgbToCSSValue(hslToRgb(surfaceLight)))
        
        // On Surface Light
        onSurfaceLight = {...surfaceLight, l: getLightness(surfaceLight, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-surface-light', rgbToCSSValue(hslToRgb(onSurfaceLight)))
        
        // Error Light
        errorLight = {...hsl, h: 0}
        root.style.setProperty('--color-error-light', rgbToCSSValue(hslToRgb(errorLight)))
        
        // On Error Light
        onErrorLight = {...errorLight, l: getLightness(errorLight, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-error-light', rgbToCSSValue(hslToRgb(onErrorLight)))
        
        // Primary Dark
        primaryDark = {...primaryLight, l: getLightness(primaryLight, 0.3)}
        root.style.setProperty('--color-primary-dark', rgbToCSSValue(hslToRgb(primaryDark)))
        
        // On Primary Light
        onPrimaryDark = {...primaryDark, l: getLightness(primaryDark, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-primary-dark', rgbToCSSValue(hslToRgb(onPrimaryDark)))
        
        // Surface Dark
        surfaceDark = {...surfaceLight, l: 0.08}
        root.style.setProperty('--color-surface-dark', rgbToCSSValue(hslToRgb(surfaceDark)))
        
        // On Surface Light
        onSurfaceDark = {...surfaceDark, l: getLightness(surfaceDark, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-surface-dark', rgbToCSSValue(hslToRgb(onSurfaceDark)))
        
        // Error Dark
        errorDark = {...errorLight, l: getLightness(errorLight, 0.3)}
        root.style.setProperty('--color-error-dark', rgbToCSSValue(hslToRgb(errorDark)))
        
        // On Error Light
        onErrorDark = {...errorDark, l: getLightness(errorDark, TEXT_COLOR_RATIO)}
        root.style.setProperty('--color-on-error-dark', rgbToCSSValue(hslToRgb(onErrorDark)))
    }

    input_colorPicker.onchange = ev => {
        const rgb = hexToRGB(ev.target.value)
        const hsl = hexToHSL(ev.target.value)
        span_colorHex.textContent = ev.target.value 
            + ` :: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            + ` :: hsl(${hsl.h.toFixed(2)}, ${hsl.s.toFixed(2)}, ${hsl.l.toFixed(2)})`
        generateColor(ev.target.value)
    }

    button_theme.onclick = ev => {
        if (theme == 'dark') {
            root.classList.remove('dark')
            theme = 'light'
            return 
        }

        theme = 'dark'
        root.classList.add('dark')
    }
})()