import { JSX, ParentComponent, splitProps } from 'solid-js'
import './index.scss'

type BodyProps = JSX.HTMLAttributes<HTMLDivElement>

const Body: ParentComponent<BodyProps> = (_props) => {
    const [props, other] = splitProps(_props, ['children'])
    return (<div class='body' {...other}>{props.children}</div>)
}

export default Body