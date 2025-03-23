// components/SpotifyCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthHandler from '../utils/AuthHandler';
import ErrorHandler from '../utils/ErrorHandler';

const SpotifyCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const queryParams = new URLSearchParams(window.location.search);
        
        // Handle Spotify callback
        const success = await AuthHandler.handleAuthRedirect('spotify', queryParams);
        
        if (success) {
          setStatus('success');
          // Redirect back to the app after a brief delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setError('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during Spotify callback processing:', error);
        const handledError = ErrorHandler.handleApiError(error);
        setStatus('error');
        setError(handledError.message);

        // Redirect back to the app after showing error
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          {status === 'processing' ? 'Connecting to Spotify...' : 
           status === 'success' ? 'Successfully Connected!' : 
           'Connection Error'}
        </h1>
        
        {status === 'processing' && (
          <div style={{
            display: 'inline-block',
            width: '2rem',
            height: '2rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        
        {status === 'success' && (
          <div>
            <span role="img" aria-label="success" style={{ fontSize: '3rem' }}>
              ✅
            </span>
            <p style={{ marginTop: '1rem' }}>
              You've successfully connected to Spotify! Redirecting back to the app...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <span role="img" aria-label="error" style={{ fontSize: '3rem' }}>
              ❌
            </span>
            <p style={{ marginTop: '1rem', color: '#dc2626' }}>
              {error || 'An unknown error occurred'}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Redirecting back to the app...
            </p>
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SpotifyCallback;