import React from 'react';
import Typography from '../atoms/Typography';
import RatingDisplay from '../molecules/RatingDisplay';
import Icon from '../atoms/Icon';

const LocationHeaderCard = ({ title, rating, count, category }) => {
  return (
    <div className="p-3 bg-white" style={{ borderRadius: '8px 8px 0 0' }}>
      <Typography variant="h2" color="#202124">{title}</Typography>
      <Typography variant="caption" color="#5F6368" className="mt-1">Recommendation Level</Typography>
      <div className="mt-1">
        <RatingDisplay rating={rating} count={count} />
      </div>
      <div className="d-flex align-items-center gap-1 mt-1">
        <Typography variant="body" color="#70757A">{category}</Typography>
        <Icon name="accessibility" size={14} color="#007AFF" />
      </div>
    </div>
  );
};

export default LocationHeaderCard;
