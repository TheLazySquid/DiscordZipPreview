import { chainPatch, onStart, onStop } from "lazypluginlib"
// @ts-ignore vscode sometimes bugs out and can't find the "*.css" module
import css from './styles.css'
import ZipPreview from "./ZipPreview"

const fileModule = BdApi.Webpack.getModule(m => m?.default && m?.default?.toString?.()?.includes("mediaAttachments:"));

let previews = new Map<string, React.ReactElement>()

onStart(() => {
    BdApi.DOM.addStyle("ZipPreview", css)

    chainPatch(fileModule, (_, args, returnVal) => {
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
    },
        { path: ["default"] },
        { customPath: { finalProp: "type", run(object) {
            let objs: any[] = [];

            for(let child of object.props.children) {
                if(!child) continue;
                if(!Array.isArray(child.props.children)) continue;
    
                for(let child2 of child.props.children) {
                    if(!child2) continue;
    
                    let item = child2.props.children.props.props.attachment;
    
                    if(item.content_type !== "application/zip") continue;
    
                    objs.push(child2.props.children)
                }
            }

            return objs;
        }, }},
        { path: ["props", "children", "type"] },
        { path: ["props", "children", "props", "children", 0, "type"] },
        { path: ["type"] }
    )
})

onStop(() => {
    BdApi.DOM.removeStyle("ZipPreview")
    BdApi.Patcher.unpatchAll("ZipPreview")
})