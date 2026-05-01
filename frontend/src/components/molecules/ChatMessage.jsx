import React from 'react';
import { AccordionList } from './AccordionList';
import { AccordionItem } from '../atoms/AccordionItem';

export const ChatMessage = ({ role, content }) => {
  const getMessageStyle = (msgRole) => ({
    padding: '14px 18px',
    borderRadius: '20px',
    maxWidth: '88%',
    alignSelf: msgRole === 'user' ? 'flex-end' : 'flex-start',
    background: msgRole === 'user' ? 'linear-gradient(135deg, #FF3366 0%, #FF5588 100%)' : '#222222',
    color: '#FFF',
    fontSize: '15px',
    lineHeight: '1.6',
    boxShadow: msgRole === 'user' ? '0 4px 12px rgba(255, 51, 102, 0.25)' : '0 2px 10px rgba(0,0,0,0.15)',
    borderBottomRightRadius: msgRole === 'user' ? '4px' : '20px',
    borderBottomLeftRadius: msgRole === 'model' ? '4px' : '20px',
    border: msgRole === 'model' ? '1px solid rgba(255,255,255,0.05)' : 'none',
    letterSpacing: '0.2px',
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
