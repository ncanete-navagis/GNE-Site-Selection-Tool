import React from 'react';
import { AccordionList } from './AccordionList';
import { AccordionItem } from '../atoms/AccordionItem';

export const ChatMessage = ({ role, content }) => {
  const getMessageStyle = (msgRole) => ({
    padding: '12px 16px',
    borderRadius: msgRole === 'user' ? 'var(--border-radius-md) var(--border-radius-md) 4px var(--border-radius-md)' : 'var(--border-radius-md) var(--border-radius-md) var(--border-radius-md) 4px',
    maxWidth: '85%',
    alignSelf: msgRole === 'user' ? 'flex-end' : 'flex-start',
    background: msgRole === 'user'
      ? 'var(--accent-primary)'
      : 'var(--bg-secondary)',
    color: msgRole === 'user'
      ? '#ffffff'
      : '#cfcfcf',
    fontSize: '14px',
    lineHeight: '1.5',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border-primary)',
    transition: 'all var(--transition-fast)',
    textAlign: 'justify',
  });

  const parseMessage = (text) => {
    if (!text) return [];

    // Try parsing as JSON first for the new compact format
    try {
      const data = JSON.parse(text);
      const jsonBlocks = [];
      
      if (data.summary) {
        jsonBlocks.push({ type: 'paragraph', content: data.summary });
      }
      
      if (data.accordion && Array.isArray(data.accordion)) {
        jsonBlocks.push({ 
          type: 'list', 
          items: data.accordion.map(item => ({ 
            title: item.title, 
            desc: item.content 
          })) 
        });
      }
      
      if (jsonBlocks.length > 0) return jsonBlocks;
    } catch (e) {
      // Not JSON, continue with normal parsing
    }

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
