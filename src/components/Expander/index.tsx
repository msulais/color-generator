import { JSX, ParentComponent, Show, createMemo, createSignal, mergeProps, onMount, splitProps } from "solid-js";
import { toggleAttribute } from "../../utils/attributes";
import Button from "../Button";
import Icon from "../Icon";
import './index.scss'

type ExpanderProps = JSX.HTMLAttributes<HTMLDivElement> & {
    header: JSX.Element
    isOpen?: boolean
    openByDefault?: boolean
    variant?: 'outlined' | 'filled-tonal'
}

const Expander: ParentComponent<ExpanderProps> = (_props) => {
    const [props, other] = splitProps(_props, [
        'header', 'children', 'isOpen', 'variant', 'openByDefault'
    ])
    const [isLocalOpen, setIsLocalOpen] = createSignal<boolean>(false)
    const [contentHeight, setContentHeight] = createSignal<number>(0)
    const [isMounted, setIsMounted] = createSignal<boolean>(false)
    const open = createMemo(() => props.isOpen ?? isLocalOpen())
    let divRef: HTMLDivElement | undefined

    onMount(() => {
        setContentHeight(divRef!.getBoundingClientRect().height + 1)
        if (props.openByDefault) setIsLocalOpen(true)
        setIsMounted(true)

        window.addEventListener('resize', ev => {
            setContentHeight(divRef!.getBoundingClientRect().height + 1)
        })
    })

    function toggleOpen(ev: MouseEvent & {
        currentTarget: HTMLButtonElement | HTMLDivElement;
        target: Element;
    }): void {
        setContentHeight(divRef!.getBoundingClientRect().height + 1)
        setIsLocalOpen(o => !o)
        ev.stopPropagation()
    }

    return (<div 
        class="expander" 
        data-open={toggleAttribute(open())} 
        data-variant={props.variant ?? 'filled-tonal'} 
        {...other}>
        <div onClick={toggleOpen} class="expander-header">
            <div>{props.header}</div>
            <Button iconOnly onClick={toggleOpen}><Icon>&#xE3FC;</Icon></Button>
        </div>
        <div class="expander-content" style={{ 'height': isMounted() ? (open() ? contentHeight() : 0) + 'px' : undefined }}>
            <div ref={divRef}>
                {props.children}
            </div>
        </div>
    </div>)
}

export default Expander