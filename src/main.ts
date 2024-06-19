import { onStart, onStop } from "lazypluginlib"
// @ts-ignore vscode sometimes bugs out and can't find the "*.css" module
import css from './styles.css'
import ZipPreview from "./ZipPreview"

const fileModule = BdApi.Webpack.getModule((exports) => Object.values<any>(exports).some(val => {
    if(typeof val !== "function") return false
    return val.toString().includes("ATTACHMENT_PROCESSING:")
}))

let previews = new Map<string, React.ReactElement>()

onStart(() => {
    BdApi.DOM.addStyle("ZipPreview", css)

    let key = (Object.entries(fileModule).find(([_, val]) => {
        if(typeof val !== "function") return false
        return val.toString().includes("fileNameLink");
    }) as [string, Function])[0]

    BdApi.Patcher.after("ZipPreview", fileModule, key, (_, args: any, returnVal) => {
        if(args[0].item.contentType !== "application/zip") return

        let props = returnVal.props.children[0].props
        let url = args[0].url
    
        props.className += " zp-zip"
    
        // if the preview doesn't exist, create it
        if(!previews.has(url)) {
            const newPreview = BdApi.React.createElement(ZipPreview, {
                url
            })
    
            previews.set(url, newPreview)
        }
        
        let preview = previews.get(url)
    
        const content = BdApi.React.createElement("div", {
            className: "zp-content"
        }, props.children)
    
        const wrapDiv = BdApi.React.createElement("div", {
            className: "zp-wrap"
        }, [content, preview])
    
        props.children = wrapDiv
    })
})

onStop(() => {
    BdApi.DOM.removeStyle("ZipPreview")
    BdApi.Patcher.unpatchAll("ZipPreview")
})