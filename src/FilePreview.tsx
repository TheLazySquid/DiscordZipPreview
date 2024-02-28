// @ts-ignore
import Download from "../assets/download.svg"

const React = BdApi.React

export default function FilePreview({ name, type: startType, blob, buff }:
    { name: string, type: string, blob: Blob, buff: ArrayBuffer }) {
    const [type, setType] = React.useState(startType)
    const url = URL.createObjectURL(blob)

    function downloadFile() {
        // create a link and click it
        let a = document.createElement("a")
        document.body.appendChild(a)
        a.href = url
        a.download = name
        a.click()

        document.body.removeChild(a)
    }

    return (
        <div className="zp-file-preview">
            <div className="zp-file-download" dangerouslySetInnerHTML={{ __html: Download }}
            onClick={() => downloadFile()}>
            </div>
            <div className="zp-preview-content">
                {type == "image" ? <img src={url} /> : null}
                {type == "video" ? <video autoPlay controls src={url} /> : null}
                {type == "audio" ? <audio autoPlay controls src={url} /> : null}
                {type == "text" ? <pre>{new TextDecoder().decode(buff)}</pre> : null}
                {type == "binary" ? <div>
                    Can't preview this file :(
                    <button className="zp-preview-override" onClick={() => setType('text')}>
                        Do it anyways
                    </button>
                </div> : null}
            </div>
        </div>
    )
}