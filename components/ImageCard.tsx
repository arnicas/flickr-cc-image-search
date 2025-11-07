
import React from 'react';
import { FlickrPhoto } from '../types';

interface ImageCardProps {
  photo: FlickrPhoto;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo }) => {
  const photoUrl = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;

  return (
    <a
      href={photoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative w-full h-72 bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105"
    >
      <img
        src={photo.url_l}
        alt={photo.title}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-bold text-lg leading-tight truncate">{photo.title || 'Untitled'}</h3>
        <p className="text-gray-300 text-sm">by {photo.owner_name}</p>
        {photo.tags && <p className="text-gray-400 text-xs mt-2 truncate">{photo.tags.split(' ').slice(0, 5).join(', ')}</p>}
      </div>
    </a>
  );
};

export default ImageCard;
