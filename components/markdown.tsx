// components/markdown.tsx
'use client';

import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { CodeBlock } from './code-block';
import { cn } from '@/lib/utils';

//
// ✅ Table wrapper: stays inside the chat bubble (max-w-3xl) and scrolls horizontally if needed
//
const TableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-x-auto ring-1 ring-white rounded-md bg-sidebar max-w-3xl mx-auto my-8">
    <table className="min-w-fit w-full border-collapse text-base leading-6 text-white">
      {children}
    </table>
  </div>
);

// ✅ Move components object outside component to prevent re-creation on every render
const components: any = {
  // Inline vs fenced code
  code({ inline, className, children, ...props }: any) {
    if (inline) {
      return (
        <code
          className="rounded-md max-w-3xl border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[0.9em] text-white"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    );
  },

  pre: ({ children }: any) => <>{children}</>,

  // Headings
  h1: ({ children, ...props }: any) => (
    <h1 className="mt-8 mb-3 text-3xl tracking-tight text-white" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="mt-7 mb-2.5 text-2xl tracking-tight text-white" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="mt-6 mb-2 text-xl tracking-tight text-white" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="mt-5 mb-2 text-lg text-white" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: any) => (
    <h5 className="mt-4 mb-2 text-base text-white" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: any) => (
    <h6 className="mt-4 mb-2 text-sm text-white" {...props}>
      {children}
    </h6>
  ),

  // Text blocks
  p: ({ children, ...props }: any) => (
    <p className="leading-7 my-3 text-white" {...props}>
      {children}
    </p>
  ),
  hr: () => <hr className="my-6 border-border/60" />,

  // Lists
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-outside ml-6 space-y-1 text-white" {...props}>
      {children}
    </ol>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-outside ml-6 space-y-1 text-white" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-7 text-white" {...props}>
      {children}
    </li>
  ),

  // Emphasis
  strong: ({ children, ...props }: any) => (
    <strong className="text-white font-bold text-2xl" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-white" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="my-4 border-l-4 border-border/60 pl-4 italic text-white"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Links
  a: ({ children, href, ...props }: any) => {
    const url = typeof href === 'string' ? href : '#';
    return (
      <Link
        href={url}
        className="text-blue-400 underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },

  // Images
  img: (props: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="my-3 rounded-lg border border-border/60"
      loading="lazy"
      alt={props?.alt ?? ''}
      {...props}
    />
  ),

  //
  // ✅ Tables
  //
  table: ({ children }: any) => <TableWrapper>{children}</TableWrapper>,

  thead: ({ children, ...props }: any) => (
    <thead
      className={cn(
        'bg-sidebar text-white font-bold [&>tr>th:last-child]:border-r-0'
      )}
      {...props}
    >
      {children}
    </thead>
  ),

  tbody: ({ children, ...props }: any) => (
    <tbody
      className="[&>tr>td:last-child]:border-r-0 text-white text-start"
      {...props}
    >
      {children}
    </tbody>
  ),

  tr: ({ children, ...props }: any) => (
    <tr
      className="transition-colors text-start hover:bg-sidebar/80 cursor-pointer text-white"
      {...props}
    >
      {children}
    </tr>
  ),

  th: ({ children, ...props }: any) => (
    <th
      className={cn(
        'px-5 py-4 text-left text-white text-base whitespace-nowrap',
        'border-b border-r border-border/50 align-middle'
      )}
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: any) => (
    <td
      className={cn(
        'px-5 py-4 align-middle text-white',
        'border-t text-start border-r border-border/40 break-words'
      )}
      {...props}
    >
      {children}
    </td>
  ),
};

// ✅ Move plugins outside component as well to prevent re-creation
const remarkPlugins = [remarkGfm];


const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prev, next) => prev.children === next.children,
);