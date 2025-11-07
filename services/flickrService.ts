import { FlickrApiResponse, FlickrPhoto, FlickrUserResponse } from '../types';

const API_KEY = process.env.FLICKR_API_KEY;
const API_BASE_URL = 'https://api.flickr.com/services/rest/';

// Hard-coded user ID for British Library's Flickr account
export const BRITISH_LIBRARY_USER_ID = '12403504@N02';

export const findFlickrUserByUsername = async (username: string): Promise<string | null> => {
  // Return hard-coded ID for British Library to skip API lookup
  if (username.toLowerCase() === 'britishlibrary') {
    return BRITISH_LIBRARY_USER_ID;
  }

  if (!API_KEY) {
    throw new Error('Flickr API key is not configured.');
  }

  const params = new URLSearchParams({
    method: 'flickr.people.findByUsername',
    api_key: API_KEY,
    username: username,
    format: 'json',
    nojsoncallback: '1',
  });

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Flickr API request failed with status: ${response.status}`);
  }

  const data: FlickrUserResponse = await response.json();

  if (data.stat === 'ok' && data.user) {
    return data.user.id;
  }
  
  if (data.stat === 'fail') {
    // A 'fail' stat with code 1 specifically means "User not found"
    if (data.code === 1) {
      return null;
    }
    throw new Error(`Flickr API returned an error finding user: ${data.message || 'Unknown error'}`);
  }
  
  return null;
}

export const searchFlickrPhotos = async (query: string, count: number, userId?: string): Promise<FlickrPhoto[]> => {
  if (!API_KEY) {
    throw new Error('Flickr API key is not configured. Please set FLICKR_API_KEY environment variable.');
  }

  const commonParams: Record<string, string> = {
    method: 'flickr.photos.search',
    api_key: API_KEY,
    text: query,
    tag_mode: 'any',
    sort: 'relevance',
    per_page: String(count),
    format: 'json',
    content_types: '2',
    is_commons: '1',
    nojsoncallback: '1',
    extras: 'url_l,owner_name,tags',
  };

  if (userId) {
    commonParams.user_id = userId;
  } else {
    // Only apply license filter for global searches
    commonParams.license = '4,5,6,7,9,10'; // Creative Commons licenses
  }

  const params = new URLSearchParams(commonParams);

  const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Flickr API request failed with status: ${response.status}`);
  }

  const data: FlickrApiResponse = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(`Flickr API returned an error: ${data.stat}`);
  }

  return data.photos.photo.filter(p => p.url_l); // Filter for photos that have the large URL
};
