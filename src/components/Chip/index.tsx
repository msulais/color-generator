import { Component, JSX, ParentProps, splitProps } from "solid-js";
import Button from "../Button";
import './index.scss'
import { toggleAttribute } from "../../utils/attributes";

type ChipProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & ParentProps & {
    variant?: 'outlined' | 'filled-tonal'
    selected?: boolean
    elevation?: 1 | 2 | 3 | 4 | 5
}

const Chip: Component<ChipProps> = (_props) => {
    const [props, other] = splitProps(_props, ['variant', 'children', 'selected', 'elevation', 'classList'])
    return (<Button 
        compact 
        elevation={props.elevation} 
        variant={props.selected? 'filled' : (props.variant || 'outlined')} 
        classList={{chip: true, ...props.classList}} 
        data-selected-chip={toggleAttribute(props.selected)}
        {...other}>
        { props.children }
    </Button>)
}

export default Chip