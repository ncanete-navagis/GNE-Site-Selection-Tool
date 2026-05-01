import React, { useState, useRef, useEffect } from 'react';

export const AccordionItem = ({ title, desc, isSection = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('0px');

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  const containerStyle = {
    marginBottom: '8px',
    backgroundColor: isSection ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: isSection ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'border-color 0.3s, background-color 0.3s',
  };

  const headerStyle = {
    padding: isSection ? '16px 18px' : '14px 16px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isOpen || isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
  };

  const titleStyle = {
    margin: 0,
    fontSize: isSection ? '16px' : '15px',
    fontWeight: isSection ? '600' : '500',
    color: isOpen ? '#FFF' : 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    paddingRight: '16px',
    lineHeight: '1.4',
    transition: 'color 0.2s',
  };

  const iconStyle = {
    color: isOpen ? '#FFF' : 'rgba(255, 255, 255, 0.5)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  };

  const contentWrapperStyle = {
    height: contentHeight,
    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    opacity: isOpen ? 1 : 0,
  };

  const contentStyle = {
    padding: '0 16px 16px 16px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div 
        style={headerStyle} 
        onClick={toggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h4 style={titleStyle}>{title}</h4>
        <div style={iconStyle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <div style={{ ...contentWrapperStyle, transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s' }}>
        <div ref={contentRef}>
          <div style={{...contentStyle, paddingTop: '4px'}}>
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
};
