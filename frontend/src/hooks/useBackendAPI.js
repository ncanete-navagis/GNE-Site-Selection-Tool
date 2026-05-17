import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const useBackendAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pull idToken from AuthContext — null when the user is not signed in.
  // When signed in, the Bearer token is injected into every request so the
  // backend can optionally or mandatorily verify the user identity.
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

      // Attach the Google ID token only when the user is signed in.
      // Endpoints using get_optional_user will use it to link the result to
      // the user's account; endpoints using get_current_user will require it.
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

  // Uses criteria object pattern (new branch's cleaner API — preserved)
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

  // Added in new branch — preserved as-is
  const getBuyingProperties = useCallback(async (bounds) => {
    const url = `${API_BASE}/properties/buying?min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  // Added in new branch — preserved as-is
  const searchRestaurants = useCallback(async (region = 'Cebu', filters = '') => {
    const url = `${API_BASE}/places/search?region=${region}&filters=${filters}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  const getPOIs = useCallback(async (region = 'Cebu', types = '', lat = null, lng = null, radius = null) => {
    let url = `${API_BASE}/places/pois?region=${region}&types=${types}`;
    if (lat !== null && lng !== null) {
      url += `&lat=${lat}&lng=${lng}`;
    }
    if (radius !== null) {
      url += `&radius=${radius}`;
    }
    return fetchWithState(url);
  }, [fetchWithState]);

  const getBuildings = useCallback(async (bounds, region = 'Cebu') => {
    const { xmin, ymin, xmax, ymax } = bounds;
    const url = `${API_BASE}/buildings/?region=${region}&xmin=${xmin}&ymin=${ymin}&xmax=${xmax}&ymax=${ymax}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  const getChoropleth = useCallback(async (region = 'Cebu') => {
    const url = `${API_BASE}/choropleth/population?region=${region}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  const getChoroplethRadius = useCallback(async (lat, lng) => {
    const url = `${API_BASE}/choropleth/radius?lat=${lat}&lng=${lng}`;
    return fetchWithState(url);
  }, [fetchWithState]);

  return {
    generateRecommendation,
    getHazards,
    getTraffic,
    getRegions,
    getBuyingProperties,
    searchRestaurants,
    getPOIs,
    getBuildings,
    getChoropleth,
    getChoroplethRadius,
    isLoading,
    error,
    isAuthenticated: !!idToken,
  };
};
