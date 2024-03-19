import './index.scss'

import { toggleAttribute } from '../../utils/attributes';
import { Component, JSX, ParentProps, mergeProps, splitProps } from 'solid-js'

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & ParentProps & {
    variant?: 'filled' | 'outlined' | 'filled-tonal' | 'transparent'
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    selected?: boolean
    indicatorPosition?: 'top' | 'right' | 'bottom' | 'left'
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & ParentProps & {
    variant?: 'filled' | 'outlined' | 'filled-tonal' | 'transparent'
    focus?: boolean
    iconOnly?: boolean
    compact?: boolean
    openInNewTab?: boolean
    selected?: boolean
    indicatorPosition?: 'top' | 'right' | 'bottom' | 'left'
    elevation?: 1 | 2 | 3 | 4 | 5
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

const Button: Component<ButtonProps> = (_props) => {
    const __props = mergeProps({variant: 'transparent', indicatorPosition: 'bottom'}, _props)
    const [props, other] = splitProps(__props, [
        'children', 'indicatorPosition', 'variant', 'classList', 
        'focus', 'compact', 'selected', 'elevation', 'iconOnly', 
        'layerAttr'
    ])

    return (<button 
        class='btn'
        classList={{
            'btn-transparent' : props.variant == 'transparent',
            'btn-filled'      : props.variant == 'filled', 
            'btn-outlined'    : props.variant == 'outlined', 
            'btn-filled-tonal': props.variant == 'filled-tonal', 
            'btn-elevated'    : props.variant == 'elevated', 
            ...props.classList
        }}
        data-icon={toggleAttribute(props.iconOnly)}
        data-indicator={props.selected? props.indicatorPosition : undefined}
        data-selected={toggleAttribute(props.selected)}
        data-elevation={toggleAttribute(props.elevation, true)}
        data-focus={toggleAttribute(props.focus)}
        data-compact={toggleAttribute(props.compact)}
        {...other}>
        <div class='btn-layer' {...props.layerAttr}>{props.children}</div>
    </button>)
}

export const LinkButton: Component<LinkButtonProps> = (_props) => {
    const __props = mergeProps({variant: 'transparent', indicatorPosition: 'bottom'}, _props)
    const [props, other] = splitProps(__props, [
        'openInNewTab', 'children', 'indicatorPosition', 'variant', 
        'classList', 'focus', 'compact', 'selected', 'elevation', 
        'iconOnly', 'layerAttr'
    ])

    return (<a 
        class='btn'
        classList={{
            'btn-transparent' : props.variant == 'transparent',
            'btn-filled'      : props.variant == 'filled', 
            'btn-outlined'    : props.variant == 'outlined', 
            'btn-filled-tonal': props.variant == 'filled-tonal', 
            'btn-elevated'    : props.variant == 'elevated', 
            ...props.classList
        }}
        data-icon={toggleAttribute(props.iconOnly)}
        data-indicator={props.selected? props.indicatorPosition : undefined}
        data-selected={toggleAttribute(props.selected)}
        data-elevation={toggleAttribute(props.elevation, true)}
        data-focus={toggleAttribute(props.focus)}
        data-compact={toggleAttribute(props.compact)}
        target={props.openInNewTab? "_blank" : undefined} 
        rel={props.openInNewTab? "noopener noreferrer" : undefined}
        {...other}>
        <div class='btn-layer' {...props.layerAttr}>{props.children}</div>
    </a>)
}

export default Button