import { JSX, ParentComponent, Show, mergeProps, onMount, splitProps } from "solid-js";
import Icon from "../Icon";
import Button from "../Button";
import { toggleAttribute } from "../../utils/attributes";
import './index.scss'

type DrawerProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
    header?: JSX.Element
    footer?: JSX.Element
    showCloseButton?: boolean
    dismiss?: 'manual' | 'auto'
    ref: (r: HTMLDialogElement) => void
    onCancel?: (ev: Event & {currentTarget: HTMLDialogElement; target: Element}) => void
}

export function openDrawer<T>(ev: any & {currentTarget: T; target: Element}, drawer: HTMLDialogElement): void {
    drawer.showModal()
    document.body.style.overflow = 'hidden'
    ev.stopImmediatePropagation()
}

export function closeDrawer(drawer: HTMLDialogElement): void {
    if (!isDrawerOpen(drawer)) return
    drawer.close()
    document.body.style.setProperty('overflow', null)
}

export function isDrawerOpen(drawer: HTMLDialogElement): boolean {
    return drawer.getAttribute('open') != null
}

const Drawer: ParentComponent<DrawerProps> = (_props) => {
    const __props = mergeProps({dismiss: 'auto'}, _props)
    const [props, other] = splitProps(__props, ['ref', 'onCancel', 'header', 'dismiss', 'footer', 'children', 'showCloseButton'])
    let drawerRef!: HTMLDialogElement

    onMount(() => {
        props.ref(drawerRef)
        if (props.dismiss != 'auto') return

        document.addEventListener('click', (ev) => {
            closeDrawer(drawerRef)
        })
    })

    return (<dialog 
        class="drawer" 
        ref={drawerRef} 
        onCancel={(ev) => {
            if (props.onCancel) props.onCancel(ev)
            if (props.dismiss == 'manual') {
                ev.preventDefault()
                return
            }
            document.body.style.setProperty('overflow', null)
        }}
        {...other}>
        <div
            onClick={(ev) => {
                ev.stopImmediatePropagation()
            }}>
            <div class="drawer-header" data-not-empty={toggleAttribute(props.header)} data-close-btn={toggleAttribute(props.showCloseButton)}>
                {props.header}
                <Show when={props.showCloseButton}>
                    <Button classList={{'drawer-close-btn': true}} iconOnly onClick={() => closeDrawer(drawerRef)}><Icon>&#xE9E0;</Icon></Button>
                </Show>
            </div>
            <div 
                class="drawer-content"
                data-header={toggleAttribute(props.header)}
                data-footer={toggleAttribute(props.footer)}
            >{props.children}</div>
            <div class="drawer-footer">{props.footer}</div>
        </div>
    </dialog>)
}

export default Drawer