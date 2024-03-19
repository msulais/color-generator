import { CookieKeys } from "../lib/cookies"

type CookieOptions = {
    domain?: string,
    expires?: number,
    maxAge?: number,
    path?: string,
    sameSite?: 'Lax' | 'Strict' | 'None',
    secure?: boolean,
    httpOnly?: boolean
}

export function setCookie(key: CookieKeys, value: string, options: CookieOptions = {sameSite: 'Lax', expires: 9999, path: '/'}): void {
    let cookie = key + "=" + encodeURIComponent(value)

    if (options.expires) {
        const expirationDate = new Date()
        expirationDate.setTime(expirationDate.getTime() + (options.expires * 24 * 60 * 60 * 1000))
        cookie += ("; expires=" + expirationDate.toUTCString())
    }
    if (options.maxAge  ) cookie += ("; max-age="    + options.maxAge)
    if (options.path    ) cookie += ("; path="       + options.path)
    if (options.domain  ) cookie += ("; domain="     + options.domain)
    if (options.sameSite) cookie += ("; SameSite="   + options.sameSite)
    if (options.secure  ) cookie += ("; secure")
    if (options.httpOnly) cookie += ("; httpOnly")

    document.cookie = cookie
}

export function getCookie(key: CookieKeys): string | null {
    const cookieName = key + "="
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()

        if (cookie.indexOf(cookieName) === 0) {
            return decodeURIComponent(cookie.substring(cookieName.length))
        }
    }

    return null
}