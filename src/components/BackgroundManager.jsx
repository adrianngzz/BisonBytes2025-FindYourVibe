// components/BackgroundManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BackgroundManager = ({ mood, apiKey }) => {
  const [backgroundVideo, setBackgroundVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opacity, setOpacity] = useState(0);

  // Mapping moods to nature scene queries
  const moodToNatureScene = {
    happy: ['sunny meadow', 'beach sunset', 'blooming flowers', 'butterfly garden', 'rainbow nature'],
    sad: ['gentle rain', 'misty forest', 'foggy mountains', 'autumn leaves falling', 'cloudy sky'],
    energetic: ['waterfall', 'ocean waves', 'mountain summit sunrise', 'rushing river', 'thunderstorm timelapse'],
    calm: ['still lake reflection', 'gentle stream', 'quiet forest', 'zen garden', 'peaceful meadow'],
    anxious: ['light wind through trees', 'passing clouds', 'light rain on leaves', 'swaying grass field'],
    tired: ['sunset over mountains', 'starry night sky', 'moonlight on water', 'evening forest'],
    bored: ['timelapse clouds', 'seasonal forest changes', 'flower blooming timelapse', 'desert landscape'],
    neutral: ['nature landscape', 'mountain scenery', 'forest canopy', 'green valley', 'wildlife sanctuary'],
    angry: ['volcanic landscape', 'crashing waves', 'stormy mountains', 'desert windstorm'],
  };

  // Get a random query from the mood's nature scene array
  const getRandomQuery = (mood) => {
    const defaultMood = 'neutral';
    const sceneOptions = moodToNatureScene[mood.toLowerCase()] || moodToNatureScene[defaultMood];
    const randomIndex = Math.floor(Math.random() * sceneOptions.length);
    return `${sceneOptions[randomIndex]} nature scene relaxing background no people ambient`;
  };

  // Fetch background video based on mood
  const fetchBackgroundVideo = async (currentMood) => {
    if (!apiKey) {
      setError("YouTube API key is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setOpacity(0);
      
      const query = getRandomQuery(currentMood);
      
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          maxResults: 5,
          q: query,
          type: 'video',
          videoEmbeddable: true,
          videoDuration: 'long', // Prefer longer videos for backgrounds
          videoDefinition: 'high', // Prefer HD videos
          key: apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        // Get additional video details to check if it has embedding enabled
        const videoIds = response.data.items.map(item => item.id.videoId).join(',');
        
        const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'status,contentDetails',
            id: videoIds,
            key: apiKey
          }
        });

        // Filter videos that allow embedding
        const embeddableVideos = videoDetailsResponse.data.items.filter(
          video => video.status.embeddable
        );

        if (embeddableVideos.length > 0) {
          // Find the original video data from search results
          const selectedVideoId = embeddableVideos[0].id;
          const selectedVideo = response.data.items.find(item => item.id.videoId === selectedVideoId);
          
          setBackgroundVideo({
            id: selectedVideoId,
            title: selectedVideo.snippet.title,
            thumbnail: selectedVideo.snippet.thumbnails.high.url
          });
          
          // Fade in the new background
          setTimeout(() => setOpacity(1), 100);
        } else {
          throw new Error("No embeddable videos found for this mood");
        }
      } else {
        throw new Error("No videos found for this mood");
      }
    } catch (error) {
      console.error("Error fetching background video:", error);
      setError(error.message);
      // Use a default background color based on mood
      document.body.style.backgroundColor = getMoodColor(currentMood);
    } finally {
      setLoading(false);
    }
  };

  // Get a color representing the mood as fallback
  const getMoodColor = (mood) => {
    const moodColors = {
      happy: '#FFDB58', // Mustard yellow
      sad: '#6495ED', // Cornflower blue
      energetic: '#FF5733', // Bright red/orange
      calm: '#90EE90', // Light green
      anxious: '#9370DB', // Medium purple
      tired: '#6B4226', // Brown
      bored: '#C0C0C0', // Silver
      neutral: '#87CEEB', // Sky blue
      angry: '#8B0000', // Dark red
    };

    return moodColors[mood.toLowerCase()] || moodColors.neutral;
  };

  // Update background when mood changes
  useEffect(() => {
    if (mood) {
      fetchBackgroundVideo(mood);
    }
    
    return () => {
      // Cleanup function
      setBackgroundVideo(null);
    };
  }, [mood, apiKey]);

  return (
    <div className="background-container">
      {loading && (
        <div className="background-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {error && !backgroundVideo && (
        <div 
          className="background-fallback"
          style={{ backgroundColor: getMoodColor(mood) }}
        />
      )}
      
      {backgroundVideo && (
        <div 
          className="background-video-container"
          style={{ opacity }}
        >
          <div className="background-overlay"></div>
          <iframe
            title="Background Nature Scene"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${backgroundVideo.id}?autoplay=1&mute=1&controls=0&showinfo=0&disablekb=1&modestbranding=1&loop=1&playlist=${backgroundVideo.id}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      <style jsx="true">{`
        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        
        .background-video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transition: opacity 1.5s ease-in-out;
        }
        
        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.15); /* More transparent overlay */
          z-index: 1;
        }
        
        .background-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: background-color 1.5s ease-in-out;
        }
        
        .background-loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        
        iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100vw;
          height: 100vh;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        
        @media (min-aspect-ratio: 16/9) {
          iframe {
            /* height = 100 * (9/16) = 56.25 */
            height: 56.25vw;
          }
        }
        
        @media (max-aspect-ratio: 16/9) {
          iframe {
            /* width = 100 / (9/16) = 177.78 */
            width: 177.78vh;
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundManager;