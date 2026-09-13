import { useState, useRef } from 'react';
import { Upload, X, Play, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export interface UploadedMedia {
  id: string;
  type: 'photo' | 'video' | 'loop' | 'story' | 'live';
  file: File;
  preview: string;
  size: number;
  duration?: number;
  error?: string;
}

interface MediaUploadProps {
  onMediasChange: (medias: UploadedMedia[]) => void;
  medias: UploadedMedia[];
  contentType?: 'photo' | 'video' | 'loop' | 'story' | 'live';
  multiple?: boolean;
}

export function MediaUpload({ 
  onMediasChange, 
  medias, 
  contentType = 'photo',
  multiple = true 
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newMedias: UploadedMedia[] = [];

    try {
      Array.from(files).forEach((file, idx) => {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a supported file type`);
          return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          const media: UploadedMedia = {
            id: `${Date.now()}-${idx}`,
            type: contentType,
            file,
            preview: e.target?.result as string,
            size: file.size
          };

          // For videos, get duration
          if (isVideo) {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
              media.duration = video.duration;
              newMedias.push(media);
              if (newMedias.length === files.length) {
                onMediasChange(multiple ? [...medias, ...newMedias] : newMedias);
                toast.success(`${files.length} file(s) uploaded`);
              }
            };
            video.src = media.preview;
          } else {
            newMedias.push(media);
            if (newMedias.length === files.length) {
              onMediasChange(multiple ? [...medias, ...newMedias] : newMedias);
              toast.success(`${files.length} file(s) uploaded`);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeMedia = (id: string) => {
    onMediasChange(medias.filter(m => m.id !== id));
  };

  const retryMedia = (id: string) => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {medias.length === 0 || multiple ? (
        <motion.div
          ref={dragZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Upload className="w-8 h-8 text-foreground-secondary mx-auto mb-2" />
          <p className="font-semibold text-foreground mb-1">
            {isDragging ? 'Drop files here' : 'Drag files here or click to select'}
          </p>
          <p className="text-sm text-foreground-secondary">
            {contentType === 'video' || contentType === 'loop'
              ? 'MP4, WebM up to 500MB'
              : contentType === 'story'
              ? 'Photo or video for story'
              : 'JPG, PNG up to 10MB'}
          </p>
        </motion.div>
      ) : null}

      {/* Media List */}
      {medias.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            {medias.length} file{medias.length !== 1 ? 's' : ''} selected
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {medias.map(media => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0 relative aspect-square bg-muted">
                    {/* Preview */}
                    <img
                      src={media.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Video play icon */}
                    {media.type === 'video' || media.type === 'loop' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                        <Play className="w-8 h-8 text-white fill-white" />
                        {media.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {Math.floor(media.duration)}s
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* Remove button */}
                    <motion.button
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-error/90"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>

                    {/* Error state */}
                    {media.error && (
                      <div className="absolute inset-0 bg-error/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-error" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* File info */}
                <div className="text-xs text-foreground-secondary mt-1">
                  <p className="truncate">{media.file.name}</p>
                  <p>{formatFileSize(media.size)}</p>
                </div>

                {/* Retry button for errors */}
                {media.error && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryMedia(media.id)}
                    className="w-full mt-1"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple && medias.length === 0}
        accept={
          contentType === 'video' || contentType === 'loop'
            ? 'video/*'
            : contentType === 'story'
            ? 'image/*,video/*'
            : 'image/*'
        }
        onChange={e => handleFiles(e.target.files)}
        className="hidden"
      />

      {isUploading && (
        <p className="text-xs text-foreground-secondary text-center animate-pulse">
          Processing files...
        </p>
      )}
    </div>
  );
}
