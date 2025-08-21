// src/components/storage/ImageGallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Download,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProcessedImage, storageService } from '@/lib/storage';
import { usePermissions } from '@/lib/auth-guards';

interface ImageGalleryProps {
  images: ProcessedImage[];
  placeId?: string;
  showControls?: boolean;
  onImageToggle?: (imageId: string, hidden: boolean) => void;
}

export function ImageGallery({ 
  images, 
  placeId, 
  showControls = false,
  onImageToggle 
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { canModerate } = usePermissions();

  const visibleImages = images.filter(img => !img.hidden);
  const selectedImage = visibleImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : visibleImages.length - 1);
  };

  const handleNext = () => {
    setSelectedIndex(prev => prev < visibleImages.length - 1 ? prev + 1 : 0);
  };

  const handleImageToggle = async (image: ProcessedImage) => {
    if (!canModerate || !onImageToggle) return;
    
    const newHiddenState = !image.hidden;
    onImageToggle(image.id, newHiddenState);
  };

  if (visibleImages.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Image className="mx-auto h-12 w-12" />
          </div>
          <p className="text-gray-600">Chưa có ảnh nào</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleImages.map((image, index) => {
          const { src, srcSet, sizes } = storageService.getOptimizedImageUrls(image);
          
          return (
            <Dialog key={image.id} open={isDialogOpen && selectedIndex === index} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div 
                  className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-100"
                  onClick={() => {
                    setSelectedIndex(index);
                    setIsDialogOpen(true);
                  }}
                >
                  <Image
                    src={src}
                    srcSet={srcSet}
                    sizes={sizes}
                    alt={image.alt || `Ảnh ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {image.credit || 'Chưa có credit'}
                    </p>
                  </div>

                  {/* Moderator controls */}
                  {showControls && canModerate && (
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant={image.hidden ? "destructive" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageToggle(image);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        {image.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] bg-black">
                    <Image
                      src={storageService.getOptimizedImageUrls(selectedImage).src}
                      alt={selectedImage?.alt || `Ảnh ${selectedIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                    
                    {/* Navigation */}
                    {visibleImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handlePrevious}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleNext}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedIndex + 1} / {visibleImages.length}
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">Thông tin ảnh</h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Kích thước:</span>
                            <span className="ml-2">{selectedImage?.width} × {selectedImage?.height}px</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Credit:</span>
                            <span className="ml-2">{selectedImage?.credit || 'Chưa có'}</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">File gốc:</span>
                            <span className="ml-2">{selectedImage?.originalFileName}</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500">Trạng thái:</span>
                            <Badge variant={selectedImage?.hidden ? "destructive" : "default"} className="ml-2">
                              {selectedImage?.hidden ? 'Ẩn' : 'Hiển thị'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = storageService.getOptimizedImageUrls(selectedImage).src;
                            window.open(url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        {showControls && canModerate && (
                          <Button
                            variant={selectedImage?.hidden ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleImageToggle(selectedImage)}
                          >
                            {selectedImage?.hidden ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Hiện
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Ẩn
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {/* Gallery Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{visibleImages.length} ảnh hiển thị</span>
        {images.length !== visibleImages.length && (
          <span>{images.length - visibleImages.length} ảnh bị ẩn</span>
        )}
      </div>
    </div>
  );
}

