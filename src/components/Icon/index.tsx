import { toggleAttribute } from '../../utils/attributes'
import './index.scss'

import { Component, JSX, Show, splitProps } from "solid-js"

type IconProps = JSX.HTMLAttributes<HTMLSpanElement> & {
    children: string | JSX.Element
    filled?: boolean
    inline?: boolean
}

const Icon: Component<IconProps> = (_props) => {
    const [props, other] = splitProps(_props, ['children', 'filled', 'inline'])
    return (<i class='icon' translate='no' data-inline={toggleAttribute(props.inline)} {...other}>
        <Show fallback={props.children} when={ props.filled }>
            { String.fromCharCode(`${props.children}`.charCodeAt(0) - 1) }
        </Show>
    </i>)
}

export default Icon