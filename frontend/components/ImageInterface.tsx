import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Camera, Upload, RotateCcw, CheckCircle } from "lucide-react"
import ResultDisplay from "./ResultDisplay"
import { getApiUrl } from '@/lib/utils';

// Add props interface
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImageInterfaceProps {}

// Update component to accept props
const ImageInterface: React.FC<ImageInterfaceProps> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("en")
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  const [location, setLocation] = useState<string>("")
  const [date, setDate] = useState<string>("")

  // Get user location when component mounts
  useEffect(() => {
    setDate(new Date().toLocaleDateString())

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude},${pos.coords.longitude}`
          setLocation(coords)
        },
        (err) => {
          console.warn("Location permission denied:", err)
          setLocation("Unknown")
        }
      )
    } else {
      setLocation("Not Supported")
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("language", language)
    formData.append("location", location)
    formData.append("date", date)

    try {
      const response = await axios.post(getApiUrl("/upload"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResult(response.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setResult({
        error: error.response?.data?.detail || "Failed to process image",
      })
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Upload Card */}
      <Card className="border-0 leaf-shadow bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-gray-800">
            AI Disease Detection
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Upload crop images for instant AI-powered disease analysis
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                Select Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                  <SelectItem value="gu">Gujarati</SelectItem>
                  <SelectItem value="pa">Punjabi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Upload Crop Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPreview(null)
                        setSelectedFile(null)
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4 text-lg">Drag and drop an image here, or click to select</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-700 transition-colors font-medium"
                    >
                      <Camera className="w-4 h-4" />
                      Select Image
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Image...
                </div>
              ) : (
                "Analyze Crop Image"
              )}
            </Button>
          </form>

          {/* Tips Card */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-serif font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tips for Best Results
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Take clear, well-lit photos of affected plant parts</li>
                <li>• Include close-ups of symptoms (spots, discoloration, etc.)</li>
                <li>• Ensure the image is in focus and not blurry</li>
                <li>• Include healthy parts for comparison if possible</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && <ResultDisplay result={result} />}


    </div>
  )
}

export default ImageInterface
