import { createContext, useContext } from "react";

import { Streamdown } from "streamdown";

import { CITE_PREFIX } from "~/lib/citations";

import { Badge } from "~/shared/shadcn/badge";

import type { ComponentProps } from "react";
import type { Components } from "streamdown";

// Streamdown's default text elements carry Tailwind classes that would override typeset.
// Plain elements let typeset style them; tables and code blocks keep Streamdown's controls.
const plainElements: Components = {
  h1: ({ node: _node, children, ...props }) => <h1 {...props}>{children}</h1>,
  h2: ({ node: _node, children, ...props }) => <h2 {...props}>{children}</h2>,
  h3: ({ node: _node, children, ...props }) => <h3 {...props}>{children}</h3>,
  h4: ({ node: _node, children, ...props }) => <h4 {...props}>{children}</h4>,
  h5: ({ node: _node, children, ...props }) => <h5 {...props}>{children}</h5>,
  h6: ({ node: _node, children, ...props }) => <h6 {...props}>{children}</h6>,
  ul: ({ node: _node, ...props }) => <ul {...props} />,
  ol: ({ node: _node, ...props }) => <ol {...props} />,
  li: ({ node: _node, ...props }) => <li {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} />,
  hr: ({ node: _node, ...props }) => <hr {...props} />,
  strong: ({ node: _node, ...props }) => <strong {...props} />,
};

type Citations = { titles: Record<string, string>; onOpen: (source: string) => void };

const CitationsContext = createContext<Citations | undefined>(undefined);

// A link to "#cite-<file>" is a citation: draw it as a small badge that opens the document.
function Link({ node: _node, href, children, ...props }: ComponentProps<"a"> & { node?: unknown }) {
  const citations = useContext(CitationsContext);

  if (!href?.startsWith(CITE_PREFIX)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    );
  }

  const source = href.slice(CITE_PREFIX.length);
  const title = citations?.titles[source] ?? source;
  return (
    <Badge
      variant="secondary"
      className="mx-0.5 h-4 min-w-4 px-1 align-text-top text-[0.625rem] hover:bg-primary/20 hover:text-primary"
      render={
        <button
          type="button"
          title={title}
          aria-label={`Open ${title}`}
          onClick={() => citations?.onOpen(source)}
        />
      }
    >
      {children}
    </Badge>
  );
}

const components: Components = { ...plainElements, a: Link };

type Props = { children: string; isStreaming: boolean; citations?: Citations };

export function Markdown({ children, isStreaming, citations }: Props) {
  return (
    <CitationsContext value={citations}>
      <div className="typeset typeset-docs max-w-[42em]">
        <Streamdown className="space-y-0" components={components} isAnimating={isStreaming}>
          {children}
        </Streamdown>
      </div>
    </CitationsContext>
  );
}
