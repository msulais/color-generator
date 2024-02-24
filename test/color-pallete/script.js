(() => {
    const root = document.documentElement
    const input_colorPicker = document.getElementById('color-picker')
    const button_theme = document.getElementById('theme')
    const span_colorHex = document.getElementById('color-hex')
    let theme = 'dark'

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
      
        // Return HSL values (H: 0-1, S: 0-1, L: 0-1)
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
     * @param {{r: number, g: number, b: number}} rgb 
     */
    function rgbToCSSValue(rgb) {
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    /**
     * @param {string} hexColorSource 
     */
    function generateColor(hexColorSource){
        const hsl = hexToHSL(hexColorSource)
        let primaryLight, onPrimaryLight, primaryDark, onPrimaryDark
        let surfaceLight, onSurfaceLight, surfaceDark, onSurfaceDark
        let errorLight,   onErrorLight,   errorDark,   onErrorDark

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
        
        // Primary Light
        primaryLight = hsl
        root.style.setProperty('--color-primary-light', rgbToCSSValue(hslToRgb(primaryLight)))
        
        // On Primary Light
        onPrimaryLight = {...primaryLight, s: 0, l: getLightness(primaryLight, 80)}
        root.style.setProperty('--color-on-primary-light', rgbToCSSValue(hslToRgb(onPrimaryLight)))
        
        // Surface Light
        surfaceLight = {...hsl, s: 0, l: 0.98}
        root.style.setProperty('--color-surface-light', rgbToCSSValue(hslToRgb(surfaceLight)))
        
        // On Surface Light
        onSurfaceLight = {...surfaceLight, s: 0, l: getLightness(surfaceLight, 80)}
        root.style.setProperty('--color-on-surface-light', rgbToCSSValue(hslToRgb(onSurfaceLight)))
        
        // Error Light
        errorLight = {...hsl, h: 0}
        root.style.setProperty('--color-error-light', rgbToCSSValue(hslToRgb(errorLight)))
        
        // On Error Light
        onErrorLight = {...errorLight, s: 0, l: getLightness(errorLight, 80)}
        root.style.setProperty('--color-on-error-light', rgbToCSSValue(hslToRgb(onErrorLight)))
        
        // Primary Dark
        primaryDark = {...primaryLight, l: getLightness(primaryLight, 30)}
        root.style.setProperty('--color-primary-dark', rgbToCSSValue(hslToRgb(primaryDark)))
        
        // On Primary Light
        onPrimaryDark = {...primaryDark, s: 0, l: getLightness(primaryDark, 80)}
        root.style.setProperty('--color-on-primary-dark', rgbToCSSValue(hslToRgb(onPrimaryDark)))
        
        // Surface Dark
        surfaceDark = {...surfaceLight, l: getLightness(surfaceLight, 90)}
        root.style.setProperty('--color-surface-dark', rgbToCSSValue(hslToRgb(surfaceDark)))
        
        // On Surface Light
        onSurfaceDark = {...surfaceDark, l: getLightness(surfaceDark, 80)}
        root.style.setProperty('--color-on-surface-dark', rgbToCSSValue(hslToRgb(onSurfaceDark)))
        
        // Error Dark
        errorDark = {...errorLight, l: getLightness(errorLight, 30)}
        root.style.setProperty('--color-error-dark', rgbToCSSValue(hslToRgb(errorDark)))
        
        // On Error Light
        onErrorDark = {...errorDark, l: getLightness(errorDark, 80)}
        root.style.setProperty('--color-on-error-dark', rgbToCSSValue(hslToRgb(onErrorDark)))
    }

    input_colorPicker.onchange = ev => {
        const hsl = hexToHSL(ev.target.value)
        const rgb = hslToRgb(hsl)
        span_colorHex.textContent = ev.target.value 
            + ` :: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            + ` :: hsl(${Math.round((hsl.h * 360))}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`
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

    generateColor('#008516')
})()