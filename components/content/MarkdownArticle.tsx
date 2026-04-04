'use client';

import ReactMarkdown from 'react-markdown';
import { MermaidDiagram } from './MermaidDiagram';

interface MarkdownArticleProps {
  content: string;
}

export function MarkdownArticle({ content }: MarkdownArticleProps) {
  return (
    <ReactMarkdown
      components={{
        code(props) {
          const { className, children } = props;
          const match = /language-(\w+)/.exec(className || '');
          const language = match?.[1];
          const code = String(children).replace(/\n$/, '');

          if (language === 'mermaid') {
            return <MermaidDiagram chart={code} />;
          }

          return (
            <code className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
