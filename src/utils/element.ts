export function isElementOverflow(el: HTMLElement): boolean {
    return el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight
}

export function addClassListModule(...arr: string[]) {
    let classList: any = {}
    for (let i = 0; i < arr.length; i++) {
        classList[arr[i]] = true
    }
    return classList
}