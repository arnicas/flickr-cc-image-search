
import React from 'react';
import { FlickrPhoto } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  photos: FlickrPhoto[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ photos }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4 md:p-8">
      {photos.map((photo) => (
        <ImageCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
};

export default ImageGrid;
