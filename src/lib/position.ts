import { POPOVER_GAP, POPOVER_MARGIN } from "./constant";

/**
 * ```
 *        |            |                      |
 *        |      LEFT  |        CENTER        |  RIGHT
 * —————— + —————————— + ———————————————————— + ———————
 *        |
 *        |            ^                      ^
 * TOP    |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 *        |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 * CENTER |     [<^v ] | [^v> ] [<^v>] [<^v ] | [^v> ]
 *        |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 * BOTTOM |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 *        |            v                      v
 * ```
 */
export enum PopoverPosition {
    LEFT_TOP,
    LEFT_CENTER_TO_BOTTOM,
    LEFT_CENTER,
    LEFT_CENTER_TO_TOP,
    LEFT_BOTTOM,
    RIGHT_TOP,
    RIGHT_CENTER_TO_BOTTOM,
    RIGHT_CENTER,
    RIGHT_CENTER_TO_TOP,
    RIGHT_BOTTOM,
    CENTER_TOP_TO_RIGHT,
    CENTER_TOP,
    CENTER_TOP_TO_LEFT,
    CENTER_BOTTOM_TO_RIGHT,
    CENTER_BOTTOM,
    CENTER_BOTTOM_TO_LEFT,
    CENTER_CENTER_LEFT_TOP,
    CENTER_CENTER_LEFT,
    CENTER_CENTER_LEFT_BOTTOM,
    CENTER_CENTER_TOP,
    CENTER_CENTER,
    CENTER_CENTER_BOTTOM,
    CENTER_CENTER_RIGHT_TOP,
    CENTER_CENTER_RIGHT,
    CENTER_CENTER_RIGHT_BOTTOM
}

type PopoverSize = {
    width: number
    height: number
}

export function getPopoverPosition(
    popover: PopoverSize,
    position: PopoverPosition = PopoverPosition.CENTER_BOTTOM_TO_RIGHT,
    element: Element = document.body,
    mousePosition: null | { x: number; y: number } = null
): {
    top: number,
    left: number
} {
    const rect = {
        element: mousePosition? {
            left  : mousePosition.x,
            right : mousePosition.x,
            x     : mousePosition.x,
            top   : mousePosition.y,
            bottom: mousePosition.y,
            y     : mousePosition.y,
            height: 0,
            width : 0,
        } : element.getBoundingClientRect(),
        popover: popover
    }
    const screen = {
        width: document.body.clientWidth,
        height: window.innerHeight
    }
    const middlePosition = {
        screen: {
            top: screen.height / 2,
            left: screen.width / 2
        },
        element: {
            top: rect.element.top + (rect.element.height / 2),
            left: rect.element.left + (rect.element.width / 2),
        }
    }
    const maxSize = {
        width: screen.width - POPOVER_MARGIN * 2,
        height: screen.height - POPOVER_MARGIN * 2
    }
    const edgePosition = {
        top: POPOVER_MARGIN,
        left: POPOVER_MARGIN,
        bottom: screen.height - POPOVER_MARGIN,
        right: screen.width - POPOVER_MARGIN,
    }
    let top: number = 0
    let left: number = 0
    const right: () => number = () => left + rect.popover.width
    const bottom: () => number = () => top + rect.popover.height

    rect.popover.width = rect.popover.width > maxSize.width
        ? maxSize.width
        : rect.popover.width
    rect.popover.height = rect.popover.height > maxSize.height
        ? maxSize.height
        : rect.popover.height

    // find x position
    if ([
            PopoverPosition.LEFT_TOP,
            PopoverPosition.LEFT_CENTER_TO_BOTTOM,
            PopoverPosition.LEFT_CENTER,
            PopoverPosition.LEFT_CENTER_TO_TOP,
            PopoverPosition.LEFT_BOTTOM,
        ].includes(position)) {
            left = rect.element.left - rect.popover.width - POPOVER_GAP
            if (left < edgePosition.left){
                if (middlePosition.element.left < middlePosition.screen.left) left = rect.element.right + POPOVER_GAP
                else left = edgePosition.left
            }

    } else if ([
            PopoverPosition.CENTER_TOP_TO_RIGHT,
            PopoverPosition.CENTER_CENTER_LEFT_TOP,
            PopoverPosition.CENTER_CENTER_LEFT,
            PopoverPosition.CENTER_CENTER_LEFT_BOTTOM,
            PopoverPosition.CENTER_BOTTOM_TO_RIGHT
        ].includes(position)) {
            left = rect.element.left
            if (right() > edgePosition.right){
                if (middlePosition.element.left > middlePosition.screen.left) left = rect.element.right - rect.popover.width
                else left = edgePosition.right - rect.popover.width
            }
    } else if ([
            PopoverPosition.CENTER_TOP,
            PopoverPosition.CENTER_CENTER_TOP,
            PopoverPosition.CENTER_CENTER,
            PopoverPosition.CENTER_CENTER_BOTTOM,
            PopoverPosition.CENTER_BOTTOM
        ].includes(position)) {
            left = rect.element.left + (rect.element.width / 2) - (rect.popover.width / 2)
    } else if ([
            PopoverPosition.CENTER_TOP_TO_LEFT,
            PopoverPosition.CENTER_CENTER_RIGHT_TOP,
            PopoverPosition.CENTER_CENTER_RIGHT,
            PopoverPosition.CENTER_CENTER_RIGHT_BOTTOM,
            PopoverPosition.CENTER_BOTTOM_TO_LEFT
        ].includes(position)){
            left = rect.element.right - rect.popover.width
            if (left < edgePosition.left) {
                if (middlePosition.element.left < middlePosition.screen.left) left = rect.element.left
                else left = edgePosition.left
            }
    } else if ([
            PopoverPosition.RIGHT_TOP,
            PopoverPosition.RIGHT_CENTER_TO_BOTTOM,
            PopoverPosition.RIGHT_CENTER,
            PopoverPosition.RIGHT_CENTER_TO_TOP,
            PopoverPosition.RIGHT_BOTTOM
        ].includes(position)){
            left = rect.element.right + POPOVER_GAP
            if (right() > edgePosition.right){
                if (middlePosition.element.left > middlePosition.screen.left) left = rect.element.left - rect.popover.width - POPOVER_GAP
                else left = edgePosition.right - rect.popover.width
            }
    }

    // find y position
    if ([
            PopoverPosition.LEFT_TOP,
            PopoverPosition.CENTER_TOP_TO_RIGHT,
            PopoverPosition.CENTER_TOP,
            PopoverPosition.CENTER_TOP_TO_LEFT,
            PopoverPosition.RIGHT_TOP
        ].includes(position)){
            top = rect.element.top - rect.popover.height - POPOVER_GAP
            if (top < edgePosition.top) {
                if (middlePosition.element.top < middlePosition.screen.top) top = rect.element.bottom + POPOVER_GAP
                else  top = edgePosition.top
            }
    } else if ([
            PopoverPosition.LEFT_CENTER_TO_BOTTOM,
            PopoverPosition.CENTER_CENTER_LEFT_TOP,
            PopoverPosition.CENTER_CENTER_TOP,
            PopoverPosition.CENTER_CENTER_RIGHT_TOP,
            PopoverPosition.RIGHT_CENTER_TO_BOTTOM
        ].includes(position)){
            top = rect.element.top
            if (bottom() > edgePosition.bottom){
                if (middlePosition.element.top > middlePosition.screen.top) top = rect.element.right - rect.popover.height
                else top = edgePosition.right - rect.popover.height
            }
    } else if ([
            PopoverPosition.LEFT_CENTER,
            PopoverPosition.CENTER_CENTER_LEFT,
            PopoverPosition.CENTER_CENTER,
            PopoverPosition.CENTER_CENTER_RIGHT,
            PopoverPosition.RIGHT_CENTER
        ].includes(position)){
            top = rect.element.top + (rect.element.height / 2) - (rect.popover.height / 2)
    } else if ([
            PopoverPosition.LEFT_CENTER_TO_TOP,
            PopoverPosition.CENTER_CENTER_LEFT_BOTTOM,
            PopoverPosition.CENTER_CENTER_BOTTOM,
            PopoverPosition.CENTER_CENTER_RIGHT_BOTTOM,
            PopoverPosition.RIGHT_CENTER_TO_TOP
        ].includes(position)){
            top = rect.element.bottom - rect.popover.height
            if (top < edgePosition.top) {
                if (middlePosition.element.top < middlePosition.screen.top) top = rect.element.top
                else top = edgePosition.top
            }
    } else if ([
            PopoverPosition.LEFT_BOTTOM,
            PopoverPosition.CENTER_BOTTOM_TO_RIGHT,
            PopoverPosition.CENTER_BOTTOM,
            PopoverPosition.CENTER_BOTTOM_TO_LEFT,
            PopoverPosition.RIGHT_BOTTOM
        ].includes(position)) {
            top = rect.element.bottom + POPOVER_GAP
            if (bottom() > edgePosition.bottom){
                if (middlePosition.element.top > middlePosition.screen.top) top = rect.element.top - rect.popover.height - POPOVER_GAP
                else top = edgePosition.bottom - rect.popover.height
            }
    }

    // final fallback
    if (top < edgePosition.top) top = edgePosition.top
    if (bottom() > edgePosition.bottom) top = edgePosition.bottom - rect.popover.height
    if (left < edgePosition.left) left = edgePosition.left
    if (right() > edgePosition.right) left = edgePosition.right - rect.popover.width

    return {top, left}
}