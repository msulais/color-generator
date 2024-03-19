import './index.scss'

import { Component, mergeProps, ParentProps, onMount, children, ResolvedChildren, JSXElement } from "solid-js"
import { PopoverPosition, getPopoverPosition } from "../../lib/position"
import { useStore } from "../../App"
import { isVarHasValue } from "../../utils/data"
import { createStore } from 'solid-js/store'
import { Portal } from 'solid-js/web'

type TooltipProps = ParentProps & {
    child: JSXElement | string
    delayDuration?: number
    class?: string
    position?: PopoverPosition
    top?: number
    left?: number
}

const Tooltip: Component<TooltipProps> = (_props) => {
    const [ store, setStore ] = useStore()!
    const props = mergeProps({
        delayDuration: 5E2,
        position: PopoverPosition.CENTER_BOTTOM_TO_RIGHT
    }, _props)
    const elementChildren = children(() => props.children)
    const [ mouseOffset, setMouseOffset ] = createStore({ x: 0, y: 0})
    let tooltipRef!: HTMLDivElement
    let childRef!: HTMLDivElement
    let el: Node | Element | undefined | ResolvedChildren

    function hideTooltip(ev: Event, duration: number = 5E2): void {
        ev.stopPropagation()
        if (store.tooltip.timeoutId) {
            clearTimeout(store.tooltip.timeoutId)
            setStore('tooltip', 'timeoutId', null)
        }

        const t = setTimeout(() => {
            tooltipRef.hidePopover()
            setStore('tooltip', 'isOpen', false)
            setStore('tooltip', 'timeoutId', null)
        }, duration)

        setStore('tooltip', 'timeoutId', t)
    }

    function showTooltip(ev: Event): void {
        const setPosition: () => void = () => {

            const rect = childRef.getBoundingClientRect()
            tooltipRef.setAttribute('class', 'tooltip scrollbar:none')
            tooltipRef.style.whiteSpace = 'nowrap'

            if (props.class) tooltipRef.setAttribute('class', `tooltip scrollbar:none ${props.class ?? ''}`)
            
            tooltipRef.style.width = rect.width + 24 + 'px'
            tooltipRef.style.height = rect.height + 12 + 'px'
            tooltipRef.innerHTML = childRef.innerHTML

            const position = getPopoverPosition(
                {
                    height: rect.height + 12,
                    width: rect.width + 24
                },
                props.position ?? PopoverPosition.CENTER_BOTTOM_TO_RIGHT,
                el as HTMLElement,
                !isVarHasValue(props.position)
                    ? { x: mouseOffset.x, y: mouseOffset.y + 24 }
                    : null
            )

            tooltipRef.style.top = (props.top? props.top : position.top) + 'px'
            tooltipRef.style.left = (props.left? props.left : position.left) + 'px'
            setTimeout(() => {
                tooltipRef.style.whiteSpace = 'normal'
            }, 2E2)
        }

        setMouseOffset({x: (ev as any).clientX, y: (ev as any).clientY})

        ev.stopPropagation()
        if (store.tooltip.timeoutId) {
            clearTimeout(store.tooltip.timeoutId)
            setStore('tooltip', 'timeoutId', null)
        }

        // When the tooltip is closed, the position remain the same
        // as before. So when the user try to show tooltip in another
        // position, the CSS will start animate the position from the
        // previous position to new position. That is fine when the
        // tooltip still open. But when the tooltip is closed, it feel
        // like wrong.
        //
        // That's why we need to initialize again the position after
        // the tooltip closed
        if (!store.tooltip.isOpen) setPosition()

        const t = setTimeout(() => {
            if (store.tooltip.isOpen) setPosition()
            tooltipRef.showPopover()
            setStore('tooltip', 'timeoutId', null)
            setStore('tooltip', 'isOpen', true)
        }, props.delayDuration)

        setStore('tooltip', 'timeoutId', t)
    }

    onMount(() => {
        tooltipRef = document.querySelector('.tooltip') as HTMLDivElement
        const c = typeof props.child == 'string'
            ? props.child
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : children(() => props.child)()! as any

        el = elementChildren()

        if (!(el instanceof Node || el instanceof Element)) return

        el.addEventListener('mouseenter', showTooltip)
        el.addEventListener('mouseleave', ev => hideTooltip(ev))
        el.addEventListener('mousemove', ev => setMouseOffset({x: (ev as any).clientX, y: (ev as any).clientY}))
        el.addEventListener('mousedown', ev => hideTooltip(ev, 0))
        el.addEventListener('touchstart', showTooltip)
        el.addEventListener('touchend', ev => hideTooltip(ev))
        el.addEventListener('touchcancel', ev => hideTooltip(ev))
    })

    return (<>
        { elementChildren() }
        <Portal ref={childRef} mount={document.querySelector('.tooltips') as Node}>{ props.child }</Portal>
    </>)
}

export default Tooltip
