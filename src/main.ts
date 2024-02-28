const testUrl = "https://greggman.github.io/unzipit/test/data/large.zip"

import { chainPatch, onStart, onStop } from "lazypluginlib"
// @ts-ignore vscode sometimes bugs out and can't find the "*.css" module
import css from './styles.css'
import ZipPreview from "./ZipPreview"

const fileModule = BdApi.Webpack.getByKeys("isMediaAttachment", "getAttachmentKind")

let previews = new Map<string, React.ReactElement>()

onStart(() => {
    BdApi.DOM.addStyle("ZipPreview", css)

    chainPatch(fileModule, (_, args, returnVal) => {
        let props = returnVal.props.children[0].props
        props.className += " zp-zip"

        let url = args[0].url

        // if the preview doesn't exist, create it
        if(!previews.has(url)) {
            const newPreview = BdApi.React.createElement(ZipPreview, {
                url: args[0].url
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
    }, {
        path: ["default"],
        validate: (_, props) => {
            return props[0]?.attachment?.content_type == "application/zip"
        }
    }, {
        path: ["props", "children", "props", "children", 0, "type"]
    }, {
        path: ["type"]
    })
})

onStop(() => {
    BdApi.DOM.removeStyle("ZipPreview")
    BdApi.Patcher.unpatchAll("ZipPreview")
})