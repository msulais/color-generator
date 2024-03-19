import { JSX, ParentComponent, createSignal, mergeProps, onMount, splitProps } from 'solid-js'
import { toggleAttribute } from '../../utils/attributes'
import Button from '../Button'
import './index.scss'

type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    labelText?: JSX.Element
    messageText?: JSX.Element
    type?: 'text' | 'password' | 'tel' | 'number' | 'email' | 'url'
    labelElement?: JSX.LabelHTMLAttributes<HTMLLabelElement>
    onInput?: (ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
    oninput?: (ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
    onFocus?: (ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
    onfocus?: (ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
    onBlur?: (ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
    onblur?: (ev: FocusEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}) => void
}

export const TextFieldTrailingButton: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = (_props) => {
    const [props, other] = splitProps(_props, ['children', 'classList'])
    return (<Button {...other} compact classList={{'text-field-btn': true, ...props.classList}}>
        { props.children }
    </Button>)
}

const TextField: ParentComponent<TextFieldProps> = (_props) => {
    const __props = mergeProps({type: 'text'}, _props)
    const [props, other] = splitProps(__props, [
        'leading', 'oninput', 'onInput', 'labelText', 
        'autocomplete', 'id', 'messageText', 'trailing', 
        'type', 'labelElement', 'disabled', 'readOnly', 
        'readonly', 'onFocus', 'onfocus', 'onBlur', 'onblur'
    ])
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const [isInvalid, setIsInvalid] = createSignal<boolean>(false)

    return (<label 
        class='text-field' 
        for={props.id}
        data-focus={toggleAttribute(isFocus())}
        data-invalid={toggleAttribute(isInvalid())}
        data-disabled={toggleAttribute(props.disabled)}
        data-trailing={toggleAttribute(props.trailing)}
        data-readonly={toggleAttribute(props.readOnly || props.readonly)}
        {...props.labelElement} 
    >
        <div class='text-field-message-text'>{props.messageText}</div>
        <div class='text-field-label-text'>{props.labelText}</div>
        <div class='text-field-leading'>{props.leading}</div>
        <input 
            id={props.id}
            onInput={(ev) => {
                setIsInvalid(!ev.currentTarget.checkValidity())
                if (props.onInput) props.onInput(ev)
                if (props.oninput) props.oninput(ev)
            }}
            onFocus={(ev) => {
                setIsInvalid(!ev.currentTarget.checkValidity())
                setIsFocus(true)
                    if (props.onFocus) props.onFocus(ev)
                    if (props.onfocus) props.onfocus(ev)
                }}
            onBlur={(ev) => {
                setIsFocus(false)
                if (props.onBlur) props.onBlur(ev)
                if (props.onblur) props.onblur(ev)
            }}
            type={props.type}
            disabled={props.disabled}
            autocomplete={props.autocomplete ?? 'off'}
            readonly={props.readonly}
            readOnly={props.readOnly}
            {...other}
        />
        <div class='text-field-trailing'>{props.trailing}</div>
    </label>)
}

export default TextField