import { Streamdown } from "streamdown";

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

type Props = { children: string; isStreaming: boolean };

export function Markdown({ children, isStreaming }: Props) {
  return (
    <div className="typeset typeset-docs max-w-[42em]">
      <Streamdown className="space-y-0" components={plainElements} isAnimating={isStreaming}>
        {children}
      </Streamdown>
    </div>
  );
}
