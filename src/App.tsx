import { Component, For, Match, Switch, createContext, createSignal, onMount, useContext } from "solid-js"
import { addClassListModule } from "./utils/element"
import { SetStoreFunction } from 'solid-js/store'
import { ParentComponent } from 'solid-js'
import { PopoverPosition } from "./lib/position"
import { GlobalStore } from "./types/store"
import { createStore } from 'solid-js/store'
import { ThemeData } from "./lib/theme"

import './styles/variables.scss'
import './styles/animations.scss'
import './styles/index.scss'

import Tooltip from "./components/Tooltip"
import Icon from "./components/Icon"
import Button from "./components/Button"
import Body from "./components/Body"
import s from './styles/index.module.scss'
import { RGB, generateColor, hexToHSL, hexToRGB } from "./utils/color"
import { ColorListItem } from "./types/colors"
import List from "./components/List"
import { CookieKeys } from "./lib/cookies"
import { getCookie, setCookie } from "./utils/cookie"



const Input: Component = () => {
    const [store, setStore] = useStore()!
    const [theme, setTheme] = createSignal<ThemeData>(ThemeData.system)
    let inputRef!: HTMLInputElement

    function rgbToCSSValue(rgb: RGB): string {
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`
    }

    function changeColor(color: string): void {
        const result = generateColor(color)
        setStore('colors', {
            seed: color, 
            ...result
        })
        setCookie(CookieKeys.color, color, {path: document.URL})
        const root = document.documentElement
        root.style.setProperty('--color-primary-light', rgbToCSSValue(hexToRGB(result.color)))
        root.style.setProperty('--color-on-primary-light', rgbToCSSValue(hexToRGB(result.onColor)))
        root.style.setProperty('--color-primary-dark', rgbToCSSValue(hexToRGB(result.colorDark)))
        root.style.setProperty('--color-on-primary-dark', rgbToCSSValue(hexToRGB(result.onColorDark)))
    }

    function addToList(): void {
        for (const c of store.colorLists) {
            if (c.color == store.colors.color) return
        }
        
        setStore('colorLists', e => [...e, {
            seed: store.colors.seed, 
            ...generateColor(store.colors.seed)
        }])
    }

    function changeTheme(): void  {
        const root = document.documentElement
        let $theme: ThemeData = ThemeData.dark

        switch (theme()){
            case ThemeData.light:
                setTheme(ThemeData.dark)
                root.setAttribute('class', ThemeData.dark)
                $theme = ThemeData.dark
                break
            case ThemeData.dark:
                setTheme(ThemeData.system)
                root.setAttribute('class', ThemeData.system)
                $theme = ThemeData.system
                break
            case ThemeData.system:
                setTheme(ThemeData.light)
                root.setAttribute('class', ThemeData.light)
                $theme = ThemeData.light
                break
        }
        setCookie(CookieKeys.theme, $theme, {path: document.URL})
    }

    onMount(() => {
        const root = document.documentElement
        const theme = getCookie(CookieKeys.theme)
        const color = getCookie(CookieKeys.color)
        if (theme && [ThemeData.system, ThemeData.light, ThemeData.dark].includes(theme as any)) {
            root.setAttribute('class', theme)
            setTheme(theme as ThemeData)
        }
        if (color) {
            changeColor(color)
            inputRef!.value = color
        }
    })

    return (<div class={s.input}>
        <Tooltip child="Change theme" position={PopoverPosition.CENTER_BOTTOM}>
            <Button onClick={changeTheme} variant="filled-tonal">
                <Switch>
                    <Match when={theme() == ThemeData.system}><Icon>&#xE289;</Icon>System</Match>
                    <Match when={theme() == ThemeData.dark}><Icon>&#xF2B3;</Icon>Dark</Match>
                    <Match when={theme() == ThemeData.light}><Icon>&#xF2CD;</Icon>Light</Match>
                </Switch>
            </Button>
        </Tooltip>
        <Tooltip child="Change color" position={PopoverPosition.CENTER_BOTTOM}>
            <label class="btn btn-filled-tonal" classList={addClassListModule(s.colorInput)} data-icon>
                <div class="btn-layer">
                    <input ref={inputRef} type="color" onChange={(e) => changeColor(e.currentTarget.value)} value={store.colors.seed}/>
                    { store.colors.seed.toUpperCase() }
                </div>
            </label>
        </Tooltip>
        <Button variant="filled-tonal" onClick={addToList}>
            <Icon>&#xE007;</Icon>
            Add to list
        </Button>
    </div>)
}

const Result: Component = () => {
    const [store, setStore] = useStore()!

    return (<div class={s.result}>
        <div>
            <div class={s.primary}>Primary Light<br/><span>{store.colors.color.toUpperCase()}</span></div>
            <div class={s.onPrimary}>On Primary Light<br/><span>{store.colors.onColor.toUpperCase()}</span></div>
        </div>
        <div>
            <div class={s.primaryDark}>Primary Dark<br/><span>{store.colors.colorDark.toUpperCase()}</span></div>
            <div class={s.onPrimaryDark}>On Primary Dark<br/><span>{store.colors.onColorDark.toUpperCase()}</span></div>
        </div>
    </div>)
}

const Lists: Component = () => {
    const [store, setStore] = useStore()!
    return (<div class={s.lists}>
        <For each={store.colorLists}>{c => 
            <List 
                leading={<div style={{"background-color": c.seed}}/>}
                child={c.seed.toUpperCase()}
                subtitle={[c.color, c.onColor, c.colorDark, c.onColorDark].map(v => v.toUpperCase()).join(', ')} 
            />
        }</For>
    </div>)
}

const App: ParentComponent = () => {
    const [store, setStore] = createStore<GlobalStore>({
        tooltip: {
            isOpen: false, 
            timeoutId: null
        }, 
        colors: {
            seed: '#52099a', 
            ...generateColor('#52099a')
        }, 
        colorLists: []
    })

    return (<StoreContext.Provider value={[store, setStore]}>
        <Body classList={addClassListModule(s.body)}>
            <h1 class={s.h1}>Color Pallette Generator</h1>
            <Input/>
            <Result/>
            <Lists/>
        </Body>
    </StoreContext.Provider>)
}

export const StoreContext = createContext<[GlobalStore, SetStoreFunction<GlobalStore>] | null>(null)
export const useStore = (): [GlobalStore, SetStoreFunction<GlobalStore>] | null => useContext(StoreContext)
export default App
