import { cn } from '@/lib/classes';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { createFileRoute } from '@tanstack/react-router';
import { FileText, SendIcon, Sparkles, Paperclip, User, Inbox, FileQuestion, AudioLines, Mail } from 'lucide-react';

export const Route = createFileRoute('/')({
  component() {
    return (
      <div className="flex flex-col items-center min-h-screen h-screen bg-gray-50 p-4 pt-[15%]">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-3">
            <Textarea
              placeholder="Ask a question"
              className={cn(
                'w-full border-none focus-visible:outline-none focus-visible:ring-0 resize-none text-base p-0 h-16 shadow-none',
                'placeholder:text-gray-500 placeholder:text-sm',
              )}
            />

            <div className="flex items-center mt-2 justify-end">
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="AI Assistant"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="sr-only">AI Assistant</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Attach an email"
                >
                  <Mail className="w-4 h-4" />
                  <span className="sr-only">Attach an email</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="sr-only">Attach File</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Record audio"
                >
                  <AudioLines className="w-4 h-4" />
                  <span className="sr-only">Attach File</span>
                </Button>

                <Button
                  size="sm"
                  className="ml-1 h-7 w-7 p-0"
                >
                  <SendIcon className="w-4 h-4 mr-[2px] mt-px" />
                  <span className="sr-only">Send Message</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {suggestionButtons.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                size="sm"
                className="bg-white rounded-lg text-gray-500"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  },
});

const suggestionButtons = [
  { icon: User, label: 'Attach to user' },
  { icon: FileText, label: 'Upload a document' },
  { icon: Inbox, label: 'Attach an email' },
  { icon: FileQuestion, label: 'Ask a question' },
];
