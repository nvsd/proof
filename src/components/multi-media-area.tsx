import {
  BarChart,
  ChevronDown,
  Sparkles,
  Paperclip,
  ArrowUp,
  Camera,
  Figma,
  FileText,
  LayoutTemplate,
  Droplet,
} from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';

const suggestionButtons = [
  { icon: Camera, label: 'Clone a Screenshot' },
  { icon: Figma, label: 'Import from Figma' },
  { icon: FileText, label: 'Upload a Project' },
  { icon: LayoutTemplate, label: 'Landing Page' },
  { icon: Droplet, label: 'Sign Up Form' },
];

export function MultiMediaArea() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-3">
          <Textarea
            placeholder="recreate this input component"
            className="w-full border-none focus-visible:outline-none focus-visible:ring-0 resize-none text-base p-0 h-16"
          />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <BarChart className="w-4 h-4 mr-2" />
              <span className="font-medium">v0-1.5-lg</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-800"
              >
                <Sparkles className="w-4 h-4" />
                <span className="sr-only">Enhance</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-800"
              >
                <Paperclip className="w-4 h-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg">
                <ArrowUp className="w-4 h-4" />
                <span className="sr-only">Submit</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {suggestionButtons.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              className="bg-white rounded-lg text-gray-500"
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
