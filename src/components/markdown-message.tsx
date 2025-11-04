"use client"

import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import "katex/dist/katex.min.css"
import type { Components } from "react-markdown"

interface MarkdownMessageProps {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const components: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "")
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      )
    },
    p({ children }) {
      return <p className="mb-2 leading-relaxed">{children}</p>
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    },
    li({ children }) {
      return <li className="ml-4">{children}</li>
    },
    strong({ children }) {
      return <strong className="font-semibold text-foreground">{children}</strong>
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mt-2 mb-1">{children}</h3>
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic my-2">
          {children}
        </blockquote>
      )
    },
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}