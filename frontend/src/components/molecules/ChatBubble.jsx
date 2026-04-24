import React from 'react';
import Avatar from '../atoms/Avatar';
import Typography from '../atoms/Typography';

const ChatBubble = ({ text, isAI = true, avatarSrc }) => {
  return (
    <div className={`d-flex gap-2 ${isAI ? 'flex-row' : 'flex-row-reverse'} align-items-end mb-3`}>
      {isAI && <Avatar src={avatarSrc} size={28} />}
      <div 
        className="p-2" 
        style={{ 
          background: isAI ? '#3F4147' : '#007AFF', 
          borderRadius: isAI ? '12px 12px 12px 0' : '12px 12px 0 12px',
          maxWidth: '80%'
        }}
      >
        <Typography variant="body" color="white">{text}</Typography>
      </div>
    </div>
  );
};

export default ChatBubble;
