'use client';

import * as React from 'react';
import { useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { CloudUpload, ImageIcon, Loader2, Upload, XIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverUploadProps {
  maxSize?: number;
  accept?: string;
  className?: string;
  value?: string;
  onChange?: (url: string | null) => void;
}

export function CoverUpload({
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = 'image/*',
  className,
  value,
  onChange,
}: CoverUploadProps) {
  const [coverImage, setCoverImage] = React.useState<FileWithPreview | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(value || null);
  const [imageLoading, setImageLoading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Update imageUrl when value prop changes
  React.useEffect(() => {
    if (value) {
      setImageUrl(value);
    }
  }, [value]);

  const uploadToR2 = async (file: File): Promise<string> => {
    // Upload file via FormData to our API (server-side upload to R2)
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const { publicUrl } = await response.json();
    return publicUrl;
  };

  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept,
    multiple: false,
    onFilesChange: async (files) => {
      if (files.length > 0) {
        const file = files[0];
        setImageLoading(true);
        setIsUploading(true);
        setUploadProgress(10);
        setUploadError(null);
        setCoverImage(file);

        try {
          // Simulate progress while uploading
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
          }, 200);

          // Actually upload to R2
          const url = await uploadToR2(file.file as File);

          clearInterval(progressInterval);
          setUploadProgress(100);
          setImageUrl(url);
          onChange?.(url);

          // Reset progress after a moment
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        } catch (error) {
          console.error('Upload error:', error);
          setUploadError(error instanceof Error ? error.message : 'Upload failed');
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    },
  });

  const removeCoverImage = () => {
    setCoverImage(null);
    setImageUrl(null);
    setImageLoading(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    onChange?.(null);
  };

  const retryUpload = async () => {
    if (coverImage && coverImage.file instanceof File) {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(10);

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const url = await uploadToR2(coverImage.file);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setImageUrl(url);
        onChange?.(url);

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (error) {
        console.error('Retry upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const hasImage = imageUrl || (coverImage && coverImage.preview);
  const displayUrl = imageUrl || coverImage?.preview;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Cover Upload Area */}
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl transition-all duration-200 border border-border',
          isDragging
            ? 'border-dashed border-primary bg-primary/5'
            : hasImage
              ? 'border-border bg-background hover:border-primary/50'
              : 'border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input {...getInputProps()} className="sr-only" />

        {hasImage ? (
          <>
            {/* Cover Image Display */}
            <div className="relative aspect-[21/9] w-full">
              {/* Loading placeholder */}
              {imageLoading && (
                <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">Loading image...</span>
                  </div>
                </div>
              )}

              {/* Actual image */}
              <img
                src={displayUrl}
                alt="Cover"
                className={cn(
                  'h-full w-full object-cover transition-opacity duration-300',
                  imageLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

              {/* Action buttons overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={openFileDialog}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Upload className="size-4 mr-1" />
                    Change Cover
                  </Button>
                  <Button type="button" onClick={removeCoverImage} variant="destructive" size="sm">
                    <XIcon className="size-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="relative">
                    <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-white/20"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                        className="text-white transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            className="flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center"
            onClick={openFileDialog}
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Cover Image</h3>
              <p className="text-sm text-muted-foreground">Drag and drop an image here, or click to browse</p>
              <p className="text-xs text-muted-foreground">Recommended size: 1200x514px • Max size: 10MB</p>
            </div>

            <Button type="button" variant="outline" size="sm" className="pointer-events-none">
              <ImageIcon className="size-4 mr-1" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(errors.length > 0 || uploadError) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
          <AlertTriangle className="size-4 text-destructive shrink-0" />
          <div className="flex-1">
            {errors.map((error, index) => (
              <p key={index} className="text-destructive">
                {error}
              </p>
            ))}
            {uploadError && (
              <div className="flex items-center justify-between">
                <p className="text-destructive">{uploadError}</p>
                <Button type="button" onClick={retryUpload} variant="outline" size="sm" className="ml-2">
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Tips - only show when no image */}
      {!hasImage && (
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">Cover Image Guidelines</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Use high-quality images with good lighting and composition</li>
            <li>• Recommended aspect ratio: 21:9 (ultrawide) for best results</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
          </ul>
        </div>
      )}
    </div>
  );
}
