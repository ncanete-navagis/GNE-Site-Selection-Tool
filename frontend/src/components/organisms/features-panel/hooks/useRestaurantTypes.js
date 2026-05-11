import { useState, useEffect } from 'react';

/**
 * useRestaurantTypes Hook
 * Handles fetching and formatting of restaurant types.
 */
export const useRestaurantTypes = () => {
  const [restaurantTypes, setRestaurantTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  useEffect(() => {
    setIsLoadingTypes(true);
    // Fetching with a default region since the region filter is removed
    fetch(`http://localhost:8000/api/v1/places/filter-options?region=cebu`)
      .then(res => res.json())
      .then(data => {
        const typesList = data || [];
        const formatted = typesList.map(type => ({
          label: type.replaceAll('_', ' ')
        }));
        setRestaurantTypes(formatted);
      })
      .catch(err => console.error('Error fetching restaurant types:', err))
      .finally(() => setIsLoadingTypes(false));
  }, []);

  return { restaurantTypes, isLoadingTypes };
};

export default useRestaurantTypes;
