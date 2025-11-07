import React, { useState, useCallback, useEffect } from 'react';
import { FlickrPhoto } from './types';
import { searchFlickrPhotos, BRITISH_LIBRARY_USER_ID } from './services/flickrService';
import SearchBar from './components/SearchBar';
import ImageGrid from './components/ImageGrid';
import Loader from './components/Loader';
import Message from './components/Message';

const FLICKR_API_KEY = process.env.FLICKR_API_KEY;

const ApiKeyMessage = () => (
  <Message title="Configuration Needed" type="error">
    <p>The Flickr API key is missing.</p>
    <p>To use this application, you need to set the <code>FLICKR_API_KEY</code> environment variable in your deployment configuration.</p>
    <p>You can obtain a free API key from the <a href="https://www.flickr.com/services/api/keys/" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Flickr App Garden</a>.</p>
  </Message>
);

const WelcomeMessage = () => (<></>);


const App: React.FC = () => {
  const [photos, setPhotos] = useState<FlickrPhoto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<string>('');
  const [lastSearchUsername, setLastSearchUsername] = useState<string>('');
  const [imageCount, setImageCount] = useState<number>(10);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [wordImages, setWordImages] = useState<Record<string, FlickrPhoto | null>>({});
  const [wordResults, setWordResults] = useState<Record<string, FlickrPhoto[]>>({});
  const [loadingWordImages, setLoadingWordImages] = useState<boolean>(false);
  const [rerollingWord, setRerollingWord] = useState<string | null>(null);

  const selectRandomWords = useCallback((words: string[]) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const fetchResultsForWord = useCallback(async (word: string): Promise<FlickrPhoto[]> => {
    if (!FLICKR_API_KEY) {
      return [];
    }

    try {
      // First try British Library
      let results = await searchFlickrPhotos(word, 50, BRITISH_LIBRARY_USER_ID);
      
      // If no results, try all Flickr
      if (results.length === 0) {
        results = await searchFlickrPhotos(word, 50);
      }
      
      return results;
    } catch (err) {
      console.error(`Failed to fetch results for word "${word}":`, err);
      return [];
    }
  }, []);

  const selectRandomImageFromResults = useCallback((results: FlickrPhoto[]): FlickrPhoto | null => {
    if (results.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length);
      return results[randomIndex];
    }
    return null;
  }, []);

  const fetchImagesForWords = useCallback(async (words: string[]) => {
    if (!FLICKR_API_KEY || words.length === 0) {
      return;
    }

    setLoadingWordImages(true);
    const imageMap: Record<string, FlickrPhoto | null> = {};
    const resultsMap: Record<string, FlickrPhoto[]> = {};

    // Fetch results for all words in parallel
    const resultPromises = words.map(async (word) => {
      const results = await fetchResultsForWord(word);
      return { word, results };
    });

    const results = await Promise.all(resultPromises);
    results.forEach(({ word, results: wordResults }) => {
      resultsMap[word] = wordResults;
      imageMap[word] = selectRandomImageFromResults(wordResults);
    });

    setWordResults(resultsMap);
    setWordImages(imageMap);
    setLoadingWordImages(false);
  }, [fetchResultsForWord, selectRandomImageFromResults]);

  const handleRerollImage = useCallback((word: string) => {
    const results = wordResults[word];
    if (results && results.length > 0) {
      setRerollingWord(word);
      // Pick a different random image from cached results
      const newImage = selectRandomImageFromResults(results);
      setWordImages(prev => ({ ...prev, [word]: newImage }));
      setRerollingWord(null);
    }
  }, [wordResults, selectRandomImageFromResults]);

  useEffect(() => {
    const loadNouns = async () => {
      try {
        const response = await fetch('./top-1000-nouns.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch nouns file');
        }
        const text = await response.text();
        const words = text
          .split('\n')
          .map(word => word.trim())
          .filter(word => word.length >= 3);
        
        const wordsList = selectRandomWords(words);
        setAllWords(words);
        setSelectedWords(wordsList);
        
        // Fetch images for the selected words
        if (FLICKR_API_KEY) {
          fetchImagesForWords(wordsList);
        }
      } catch (err) {
        console.error('Failed to load nouns file:', err);
      }
    };

    loadNouns();
  }, [selectRandomWords, fetchImagesForWords]);

  const handleReroll = useCallback(() => {
    if (allWords.length > 0) {
      const newWords = selectRandomWords(allWords);
      setSelectedWords(newWords);
      fetchImagesForWords(newWords);
    }
  }, [allWords, selectRandomWords, fetchImagesForWords]);
  
  const handleSearch = useCallback(async (query: string) => {
    if (!FLICKR_API_KEY) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setPhotos(null);
    setLastSearch(query);

    try {
      // First search British Library, then fallback to all Flickr
      setLastSearchUsername('British Library');
      let results = await searchFlickrPhotos(query, imageCount, BRITISH_LIBRARY_USER_ID);
      
      // If no results from British Library, search all of Flickr
      if (results.length === 0) {
        setLastSearchUsername('all Flickr');
        results = await searchFlickrPhotos(query, imageCount);
      }
      
      setPhotos(results);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageCount]);

  const renderSelectedWords = () => {
    if (selectedWords.length === 0) {
      return null;
    }

    return (
      <div className="mb-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-sm font-medium">Suggested words:</span>
            {selectedWords.map((word, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-300/20 text-blue-200 rounded-full text-sm font-light border border-blue-300/30"
              >
                {word}
              </span>
            ))}
          </div>
          <button
            onClick={handleReroll}
            disabled={loadingWordImages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors duration-200 border border-gray-600 hover:border-gray-500"
          >
            {loadingWordImages ? 'Loading...' : 'Reroll'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedWords.map((word, index) => {
            const image = wordImages[word];
            const isLoading = loadingWordImages && !image;
            
            return (
              <div key={index} className="flex flex-col items-center">
                {isLoading ? (
                  <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-600">
                    <div className="text-gray-400 text-sm">Loading...</div>
                  </div>
                ) : image && image.url_l ? (
                  <a
                    href={`https://www.flickr.com/photos/${image.owner}/${image.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    <img
                      src={image.url_l}
                      alt={image.title || word}
                      className="w-full aspect-square object-contain rounded-lg border-2 border-gray-600 hover:border-brand-blue transition-colors duration-200 bg-gray-800"
                    />
                  </a>
                ) : (
                  <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-600">
                    <div className="text-gray-400 text-sm text-center px-4">No image found</div>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-4 py-2 bg-blue-300/20 text-blue-200 rounded-full text-sm font-light border border-blue-300/30">
                    {word}
                  </div>
                  <button
                    onClick={() => handleRerollImage(word)}
                    disabled={rerollingWord === word || !wordResults[word] || wordResults[word].length === 0}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-medium transition-colors duration-200 border border-gray-600 hover:border-gray-500"
                    title="Reroll image for this word"
                  >
                    {rerollingWord === word ? '...' : '↻'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSearchBar = () => {
    return (
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <div className="flex-shrink-0">
            <select
              id="image-count-select"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              disabled={isLoading}
              className="bg-gray-800 border-2 border-gray-700 text-white text-base rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:outline-none transition-colors duration-300 py-3 px-5 appearance-none pr-12 bg-no-repeat"
              style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.2em 1.2em'
              }}
              aria-label="Number of images to show"
            >
              {Array.from({ length: 8 }, (_, i) => i + 3).map(num => (
                  <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-center text-gray-400 text-sm">
          Searches British Library's Creative Commons images first, then falls back to all of Flickr if needed.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {renderSelectedWords()}
          {renderSearchBar()}
          <Loader />
        </>
      );
    }
    if (error) {
      return (
        <>
          {renderSelectedWords()}
          {renderSearchBar()}
          <Message title="An Error Occurred" type="error">
            <p>{error}</p>
          </Message>
        </>
      );
    }
    if (photos !== null) {
      if (photos.length > 0) {
        return (
          <>
            {renderSelectedWords()}
            {renderSearchBar()}
            <ImageGrid photos={photos} />
          </>
        );
      } else {
        return (
          <>
            {renderSelectedWords()}
            {renderSearchBar()}
            <Message title="No Results Found" type="info">
              <p>
                Your search for "{lastSearch}"
                {lastSearchUsername === 'British Library' 
                  ? ` in ${lastSearchUsername}'s photos` 
                  : lastSearchUsername === 'all Flickr'
                  ? ' across all Flickr'
                  : ` in @${lastSearchUsername}'s photos`}
                &nbsp;did not return any images. Try a different keyword or check the username.
              </p>
            </Message>
          </>
        );
      }
    }
    return (
      <>
        {renderSelectedWords()}
        {renderSearchBar()}
        <WelcomeMessage />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm shadow-lg p-6">
        <div className="container mx-auto">
          <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-pink">
                    Image Prompt Inspiration
                </span>
              </h1>
              <p className="text-gray-400 text-sm">3 random nouns and CC images from Flickr (<a href="https://www.flickr.com/photos/britishlibrary/albums">British Library scans</a> as default)</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8">
        {!FLICKR_API_KEY ? <ApiKeyMessage /> : renderContent()}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm space-y-2">
        <p>Powered by the <a href="https://www.flickr.com/services/api/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue">Flickr API</a>. Images are under various Creative Commons licenses.</p>
        <p className="text-gray-400">
          A small experiment to produce image and text prompts for writerly inspiration, inspired by <a href="https://alphachar.com/who-am-i" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue underline">Char Putney</a>. By{' '}
          <a href="https://www.ghostweather.com/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue underline">
            Lynn Cherny
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;