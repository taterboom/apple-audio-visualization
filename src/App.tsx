import { useEffect, useState } from "react"
import Visualization from "./components/Visualization/Visualization"
import AppleVisualization from "./components/Visualization/AppleVisualization"
import { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"

function App() {
  const [inputType, setInputType] = useState<"songs" | "upload" | "record">("songs")
  const [source, setSource] = useState<string | MediaStream | null>(null)
  const [type, setType] = useState<"normal" | "apple">("normal")

  useEffect(() => {
    if (inputType === "record") {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        setSource(stream)
      })
    }
  }, [inputType])

  console.log("source", source)

  return (
    <>
      <h1 className="mt-4 px-4 text-lg font-semibold">Apple Audio Visualization</h1>
      <main className="p-4 space-y-4">
        <div>
          <ToggleGroup
            type="single"
            className="justify-start"
            value={inputType}
            onValueChange={(v: never) => setInputType(v)}
          >
            <ToggleGroupItem value="songs">Songs</ToggleGroupItem>
            <ToggleGroupItem value="record">Record</ToggleGroupItem>
            <ToggleGroupItem value="upload">Upload</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {inputType === "songs" && (
          <Select onValueChange={(v) => setSource(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a song" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Songs</SelectLabel>
                <SelectItem value="/example-pretender.mp3">pretender</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {inputType === "upload" && (
          <input
            type="file"
            onChange={(e) => {
              e.target.files && setSource(URL.createObjectURL(e.target.files[0]))
            }}
          />
        )}
        <div>
          <ToggleGroup
            type="single"
            className="justify-start"
            value={type}
            onValueChange={(v: never) => setType(v)}
          >
            <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
            <ToggleGroupItem value="apple">Apple</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {!!source && (
          <div>
            {type === "normal" ? (
              <Visualization source={source}></Visualization>
            ) : (
              <AppleVisualization source={source}></AppleVisualization>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default App
