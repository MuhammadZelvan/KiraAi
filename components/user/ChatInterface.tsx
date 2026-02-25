import { useState } from "react";
import { Mic, ArrowUp, Paperclip, Settings2, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInterfaceProps {
  userName?: string;
}

export function ChatInterface({ userName = "Mas Prabowo" }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT 3.5");

  const models = ["GPT 3.5", "GPT 4", "GPT 4 Turbo", "Claude 3"];

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message (dummy for now)
      console.log("Sending:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Welcome Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* AI Avatar */}
        <div className="mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/60 via-primary to-primary/80 p-1 shadow-lg shadow-primary/20">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-violet-500 opacity-80" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className="mb-2 text-3xl font-bold text-primary">
          Hello, {userName}
        </h1>
        <p className="text-xl text-muted-foreground">
          What can I help you with today?
        </p>
      </div>

      {/* Input Section */}
      <div className="px-6 pb-6">
        <div className="mx-auto max-w-3xl">
          {/* Text Input */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Bottom Controls */}
            <div className="mt-3 flex items-center justify-between">
              {/* Model Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {selectedModel}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model}
                      onClick={() => setSelectedModel(model)}
                    >
                      {model}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Add Attachment
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Tool Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
