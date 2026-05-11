import { useState, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const useBackendAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithState = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
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
  }, []);

  const generateRecommendation = useCallback(async (lat, lng, name, criteria = {}) => {
    return fetchWithState(`${API_BASE}/recommendations/generate`, {
      method: 'POST',
      body: JSON.stringify({ 
        latitude: lat, 
        longitude: lng, 
        name,
        radius_m: criteria.radius_m,
        population: criteria.population,
        traffic_kmh: criteria.traffic_kmh,
        lot_area: criteria.lot_area,
        business_sectors: criteria.business_sectors
      })
    });
  }, [fetchWithState]);

  const getHazards = useCallback(async (bounds, hazardType = null, zoom = 12) => {
    let url = `${API_BASE}/hazards/?xmin=${bounds.xmin}&ymin=${bounds.ymin}&xmax=${bounds.xmax}&ymax=${bounds.ymax}&zoom=${zoom}`;
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

  const getBuyingProperties = useCallback(async (bounds) => {
    const url = `${API_BASE}/properties/buying?min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  return {
    generateRecommendation,
    getHazards,
    getTraffic,
    getRegions,
    getBuyingProperties,
    isLoading,
    error
  };
};
