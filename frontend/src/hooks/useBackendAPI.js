import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000/api/v1';

export const useBackendAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pull idToken from AuthContext — null when the user is not signed in
  const auth = useContext(AuthContext);
  const idToken = auth?.idToken ?? null;

  const fetchWithState = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Attach the Google ID token only when the user is signed in
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [idToken]);

  const generateRecommendation = useCallback(async (lat, lng, name) => {
    return fetchWithState(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      body: JSON.stringify({ latitude: lat, longitude: lng, name })
    });
  }, [fetchWithState]);

  const getHazards = useCallback(async (bounds, hazardType = null) => {
    let url = `${API_BASE}/hazards/?xmin=${bounds.xmin}&ymin=${bounds.ymin}&xmax=${bounds.xmax}&ymax=${bounds.ymax}`;
    if (hazardType) url += `&hazard_type=${hazardType}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  const getTraffic = useCallback(async (bounds) => {
    const url = `${API_BASE}/traffic/?xmin=${bounds.xmin}&ymin=${bounds.ymin}&xmax=${bounds.xmax}&ymax=${bounds.ymax}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  const getRegions = useCallback(async () => {
    return fetchWithState(`${API_BASE}/regions/`);
  }, [fetchWithState]);

  return {
    generateRecommendation,
    getHazards,
    getTraffic,
    getRegions,
    isLoading,
    error,
    isAuthenticated: !!idToken,
  };
};
