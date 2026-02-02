'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  X, 
  FileImage, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react'

interface PhotoUploadProps {
  onUpload: (files: File[]) => Promise<void>
  onClose: () => void
}

interface UploadedFile {
  file: File
  preview: string
  status: 'uploading' | 'success' | 'error'
  id: string
}

export default function PhotoUpload({ onUpload, onClose }: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera functionality
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      setStream(mediaStream)
      setShowCamera(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error starting camera:', error)
      alert('Unable to access camera. Please use file upload instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context?.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' })
        handleFiles([file])
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isImage && isValidSize
    })

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      id: Math.random().toString(36).substr(2, 9)
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate processing each file
    newFiles.forEach(async (fileItem, index) => {
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: Math.random() > 0.1 ? 'success' : 'error' }
            : f
        ))
      }, 1000 + index * 500)
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }, [handleFiles])

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const retryFile = (id: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' } : f
    ))

    // Simulate retry
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'success' } : f
      ))
    }, 1000)
  }

  const handleProcessFiles = async () => {
    const successfulFiles = uploadedFiles
      .filter(f => f.status === 'success')
      .map(f => f.file)

    if (successfulFiles.length === 0) return

    setIsProcessing(true)
    try {
      await onUpload(successfulFiles)
      // Cleanup preview URLs
      uploadedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const successCount = uploadedFiles.filter(f => f.status === 'success').length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload Receipts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showCamera ? (
            <>
              {/* Upload Area */}
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragOver 
                    ? 'border-primary-400 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-gray-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Choose Files</span>
                    </button>
                    
                    <button
                      onClick={startCamera}
                      className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Camera className="h-8 w-8 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-primary-700">Take Photo</span>
                    </button>
                  </div>
                  
                  <div className="text-gray-500">
                    <p className="font-medium">Drag and drop receipt photos here</p>
                    <p className="text-sm mt-1">Supports JPG, PNG, WebP up to 10MB</p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Files */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <h3 className="font-medium text-gray-900 mb-3">
                      Uploaded Files ({uploadedFiles.length})
                    </h3>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {uploadedFiles.map((fileItem) => (
                        <motion.div
                          key={fileItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={fileItem.preview}
                            alt="Receipt preview"
                            className="h-12 w-12 object-cover rounded"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(fileItem.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {fileItem.status === 'uploading' && (
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            {fileItem.status === 'success' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {fileItem.status === 'error' && (
                              <div className="flex space-x-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <button
                                  onClick={() => retryFile(fileItem.id)}
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            
                            <button
                              onClick={() => removeFile(fileItem.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Camera View */
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={capturePhoto}
                    className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="text-center text-gray-600">
                <p className="text-sm">Position the receipt clearly in the frame</p>
                <p className="text-xs">Make sure text is readable and lighting is good</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showCamera && (
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {successCount > 0 && (
                <span>{successCount} file{successCount > 1 ? 's' : ''} ready to process</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessFiles}
                disabled={successCount === 0 || isProcessing}
                className="btn-primary flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4" />
                    <span>Process Receipts ({successCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}