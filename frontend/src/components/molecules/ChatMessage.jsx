import React from 'react';
import { AccordionList } from './AccordionList';
import { AccordionItem } from '../atoms/AccordionItem';

export const ChatMessage = ({ role, content }) => {
  const getMessageStyle = (msgRole) => ({
    padding: '16px 20px',
    borderRadius: msgRole === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
    maxWidth: '90%',
    alignSelf: msgRole === 'user' ? 'flex-end' : 'flex-start',
    background: msgRole === 'user' 
      ? 'linear-gradient(135deg, #ff2a85 0%, #ff6b6b 100%)' 
      : 'rgba(255, 255, 255, 0.05)',
    color: '#FFF',
    fontSize: '15px',
    lineHeight: '1.6',
    boxShadow: msgRole === 'user' 
      ? '0 8px 20px rgba(255, 42, 133, 0.2)' 
      : 'none',
    border: msgRole === 'model' ? '1px solid rgba(255,255,255,0.08)' : 'none',
    letterSpacing: '0.1px',
    position: 'relative',
    transition: 'all 0.3s ease',
  });

  const parseMessage = (text) => {
    if (!text) return [];

    const lines = text.split('\n');
    const blocks = [];
    
    let currentSection = null;
    let currentParagraph = [];

    const pushParagraph = () => {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'paragraph', content: currentParagraph.join('\n') });
        currentParagraph = [];
      }
    };

    const pushSection = () => {
      if (currentSection) {
        if (currentSection.items.length > 0) {
          blocks.push(currentSection);
        }
        currentSection = null;
      }
    };

    const headingRegex = /^#+\s+(.*)$/;
    const listItemRegex = /^\s*(?:\d+\.|\-|\*)\s+(.+?)(?:\s+[-:]\s+|\s*:\s*)(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        pushParagraph();
        continue;
      }

      const headingMatch = line.match(headingRegex);
      if (headingMatch) {
        pushParagraph();
        pushSection();
        let title = headingMatch[1].replace(/\*\*/g, '').trim();
        currentSection = { type: 'section', title: title, items: [] };
        continue;
      }

      let cleanLine = line.replace(/\*\*/g, '');
      const listMatch = cleanLine.match(listItemRegex);
      
      if (listMatch) {
        pushParagraph();
        let title = listMatch[1].trim();
        title = title.replace(/[:\-]+$/, '').trim();
        let content = listMatch[2].trim();
        
        if (currentSection) {
          currentSection.items.push({ title, desc: content });
        } else {
          let lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.type === 'list') {
            lastBlock.items.push({ title, desc: content });
          } else {
            blocks.push({ type: 'list', items: [{ title, desc: content }] });
          }
        }
        continue;
      }

      pushSection();
      currentParagraph.push(line);
    }

    pushParagraph();
    pushSection();

    return blocks;
  };

  const blocks = parseMessage(content);

  return (
    <div style={getMessageStyle(role)}>
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          return (
            <p 
              key={idx} 
              style={{ 
                margin: idx === blocks.length - 1 ? '0' : '0 0 8px 0', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {block.content}
            </p>
          );
        }
        if (block.type === 'list') {
          return <AccordionList key={idx} items={block.items} />;
        }
        if (block.type === 'section') {
          return (
            <AccordionItem 
              key={idx} 
              title={block.title} 
              desc={<AccordionList items={block.items} />} 
              isSection={true}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
