import { type ZipInfo, unzip, type ZipEntry } from "unzipit";
// I won't lie, I got pretty desperate trying to find a library that a) works b) builds
import { isBinaryFile } from "arraybuffer-isbinary";

// @ts-ignore
import ExpandDown from "../assets/arrow-expand-down.svg"
// @ts-ignore
import ExpandUp from "../assets/arrow-expand-up.svg"
// @ts-ignore
import FolderReturn from "../assets/folder-arrow-left-outline.svg"
import FilePreview from "./FilePreview";

const React = BdApi.React

interface IFolder {
    parent?: IFolder
    path: string
    folders: Record<string, IFolder>
    files: Record<string, ZipEntry>
}

function ZipPreview({ url }: { url: string }) {
    const [expanded, setExpanded] = React.useState(false)
    const [folderContents, setFolderContents] = React.useState<IFolder| null>(null)

    let zipInfo: ZipInfo | null = null

    function toggleExpanded() {     
        setExpanded(!expanded);
        if(!(!expanded && zipInfo == null)) return

        // need to do this because CORS
        BdApi.Net.fetch(url)
            .then(res => res.blob())
            .then(blob => unzip(blob))
            .then(info => {
                let contents: IFolder = { folders: {}, files: {}, path: "/" }

                // parse the folder structure
                for(let filename in info.entries) {
                    let file = info.entries[filename]
                    if(file.isDirectory) continue;

                    // it's theoretically possible to have slashes in the filename, but I don't care
                    let path = filename.split("/")

                    let current = contents;
                    for(let i = 0; i < path.length - 1; i++) {
                        if(!current.folders[path[i]]) {
                            current.folders[path[i]] = {
                                folders: {},
                                files: {},
                                path: current.path + path[i] + "/",
                                parent: current
                            }
                        }
                        current = current.folders[path[i]]
                    }

                    current.files[path[path.length - 1]] = file
                }

                console.log("[ZipPreview] extracted zip", contents)
                setFolderContents(contents)
            })
    }

    async function openFile(name: string, file: ZipEntry) {
        let [blob, buff] = await Promise.all([file.blob(), file.arrayBuffer()])

        const ext = name.split(".").pop()

        // probably not comprehensive, but it's good enough
        const images = ["png", "jpg", "jpeg", "webp", "avif"]
        const videos = ["mp4", "webm", "mov", "avi", "mkv"]
        const audio = ["mp3", "wav", "ogg", "opus"]

        let type = "text"
        if(ext) {
            if(images.includes(ext)) type = "image"
            else if(videos.includes(ext)) type = "video"
            else if(audio.includes(ext)) type = "audio"
        }
        if(type == "text") {
            // @ts-ignore Buffer and ArrayBuffer are close enough and a type conversion would be slow
            if(isBinaryFile(buff)) type = "binary"
        }

        let el = document.createElement("div");
        document.body.appendChild(el);

        // @ts-ignore type missing for some reason
        BdApi.ReactDOM.createRoot(el).render(<FilePreview
            name={name}
            type={type}
            blob={blob}
            buff={buff}
            onClose={() => document.body.removeChild(el)}
        />);
    }

    function formatSize(size: number) {
        if(size < 1024) return size + " B"
        if(size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB"
        if(size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + " MB"
        return (size / 1024 / 1024 / 1024).toFixed(2) + " GB"
    }

    return (
        <div>
            <div className={"zp-zip-preview " + (expanded ? "expanded" : "")}>
                {folderContents ? [
                    <div className="zp-path">
                        <div dangerouslySetInnerHTML={{ __html: FolderReturn }}
                        className="zp-folderReturn"
                            onClick={() => {
                                if(folderContents.parent) {
                                    setFolderContents(folderContents.parent)
                                }
                            }}>
                        </div>
                        <div>
                            {folderContents.path}
                        </div>
                    </div>,
                    Object.keys(folderContents.folders).map(name => {
                        return (
                            <div key={name} className="zp-entry"
                                onClick={() => {
                                    setFolderContents(folderContents.folders[name])
                                }}>
                                {name}/
                            </div>
                        )
                    }),
                    Object.entries(folderContents.files).map(parts => {
                        return (
                            <div key={parts[0]} onClick={() => openFile(parts[0], parts[1])}>
                                <span className="zp-entry">
                                    {parts[0]}
                                </span>
                                <span className="zp-filesize">
                                    ({formatSize(parts[1].size)})
                                </span>
                            </div>
                        )
                    })
                ] : "Loading..."}
            </div>
            <div className="zp-dropdown-expander" dangerouslySetInnerHTML={{ __html: expanded ? ExpandUp : ExpandDown }}
            onClick={toggleExpanded}>
            </div>
        </div>
    )
}

export default React.memo(ZipPreview)