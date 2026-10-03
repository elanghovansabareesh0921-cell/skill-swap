import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'privacy-policy.md');
  const content = fs.readFileSync(filePath, 'utf-8');

  return (
    <main className="min-h-screen bg-mist text-ink py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl font-display font-extrabold text-lagoon mt-2 mb-8" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-ink mt-10 mb-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-ink mt-8 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-sm text-ink/80" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-sm text-ink/80" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-sm text-ink/80" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              a: ({node, ...props}) => <a className="text-lagoon hover:underline font-medium" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-ink" {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto my-8 border border-ink/10 rounded-xl"><table className="min-w-full divide-y divide-ink/10" {...props} /></div>,
              th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-ink uppercase tracking-wider bg-ink/5" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-ink/80 border-t border-ink/5" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-saffron pl-4 py-2 italic bg-saffron/5 my-6 rounded-r-lg text-ink/70" {...props} />,
              hr: ({node, ...props}) => <hr className="my-10 border-ink/10" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
