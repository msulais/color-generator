import { toggleAttribute } from '../../utils/attributes'
import './index.scss'

import { Component, JSX, splitProps } from "solid-js"

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
    leading?: JSX.Element
    child: JSX.Element
    subtitle?: JSX.Element
    trailing?: JSX.Element
    compact?: boolean
}

const List: Component<ListProps> = (_props) => {
    const [props, other] = splitProps(_props, ['leading', 'child', 'trailing', 'subtitle', 'compact'])
    return (<div 
        class='list' 
        data-trailing={toggleAttribute(props.trailing)}
        data-compact={toggleAttribute(props.compact)} 
        {...other}>
        <div class='list-leading'>{props.leading}</div>
        <div class='list-content'>
            <div class='list-title'>{props.child}</div>
            <div class='list-subtitle'>{props.subtitle}</div>
        </div>
        <div class='list-trailing'>{props.trailing}</div>
    </div>)
}

export default List