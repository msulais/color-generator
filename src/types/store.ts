import { ColorListItem } from "./colors"

export type GlobalStore = {
    tooltip: {
        timeoutId: number | null
        isOpen: boolean
    }, 
    colors: ColorListItem, 
    colorLists: ColorListItem[]
}