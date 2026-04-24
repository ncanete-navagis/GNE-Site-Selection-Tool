import React from 'react';
import Icon from '../atoms/Icon';
import Typography from '../atoms/Typography';

const RatingDisplay = ({ rating, count }) => {
  return (
    <div className="d-flex align-items-center gap-1">
      <Typography variant="body" weight="600" color="#202124">{rating}</Typography>
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Icon 
            key={s} 
            name="star" 
            size={12} 
            color={s <= Math.floor(rating) ? '#FBBC04' : '#E0E0E0'} 
          />
        ))}
      </div>
      <Typography variant="caption" color="#70757A">({count.toLocaleString()})</Typography>
    </div>
  );
};

export default RatingDisplay;
