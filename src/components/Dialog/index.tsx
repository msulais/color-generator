import { Component, JSX, ParentComponent, Show, mergeProps, onMount, splitProps } from "solid-js";
import Icon from "../Icon";
import Button from "../Button";
import './index.scss'
import { toggleAttribute } from "../../utils/attributes";

type DialogProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
    header: JSX.Element
    actions?: JSX.Element
    showCloseButton?: boolean
    justifyActions?: boolean
    dismiss?: 'manual' | 'auto'
    ref: (r: HTMLDialogElement) => void
    onCancel?: (ev: Event & {currentTarget: HTMLDialogElement; target: Element}) => void
}

export function openDialog<T>(ev: any & {currentTarget: T; target: Element}, dialog: HTMLDialogElement): void {
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    ev.stopImmediatePropagation()
}

export function closeDialog(dialog: HTMLDialogElement): void {
    if (!isDialogOpen(dialog)) return
    dialog.close()
    document.body.style.setProperty('overflow', null)
}

export function isDialogOpen(dialog: HTMLDialogElement): boolean {
    return dialog.getAttribute('open') != null
}

const Dialog: ParentComponent<DialogProps> = (_props) => {
    const __props = mergeProps({justifyActions: true, dismiss: 'auto'}, _props)
    const [props, other] = splitProps(__props, ['ref', 'onCancel', 'header', 'dismiss', 'actions', 'children', 'showCloseButton', 'justifyActions'])
    let dialogRef!: HTMLDialogElement

    onMount(() => {
        props.ref(dialogRef)
        if (props.dismiss != 'auto') return

        document.addEventListener('click', (ev) => {
            closeDialog(dialogRef)
        })
    })

    return (<dialog 
        class="dialog" 
        ref={dialogRef} 
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
            <div class="dialog-header" data-close-btn={toggleAttribute(props.showCloseButton)}>
                {props.header}
                <Show when={props.showCloseButton}>
                    <Button classList={{'dialog-close-btn': true}} iconOnly onClick={() => closeDialog(dialogRef)}><Icon>&#xE5E9;</Icon></Button>
                </Show>
            </div>
            <div class="dialog-content">{props.children}</div>
            <div class="dialog-actions" data-justify={toggleAttribute(props.justifyActions)}>{props.actions}</div>
        </div>
    </dialog>)
}

export default Dialog