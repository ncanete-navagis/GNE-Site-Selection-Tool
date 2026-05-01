import React from 'react';
import { AccordionItem } from '../atoms/AccordionItem';

export const AccordionList = ({ items }) => {
  if (!items || items.length === 0) return null;

  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
    marginBottom: '8px',
  };

  return (
    <div style={listStyle}>
      {items.map((item, idx) => (
        <AccordionItem key={idx} title={item.title} desc={item.desc} />
      ))}
    </div>
  );
};
