"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Terminal, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OutputConsoleProps {
  output: string;
  executionTime?: string;
  status?: "success" | "error" | "running" | "idle";
}

export const OutputConsole = ({ output, executionTime, status = "idle" }: OutputConsoleProps) => {
  const [consoleOutput] = useState(output);

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleOutput);
    toast.success("Output copied to clipboard");
  };

  const handleClear = () => {
    toast.success("Console cleared");
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-status-success";
      case "error":
        return "text-status-error";
      case "running":
        return "text-status-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "running":
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-panel-bg border-l border-panel-border">
      <div className="flex items-center justify-between p-2 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <h2 className="text-sm font-semibold">Console</h2>
          </div>
          {executionTime && (
            <span className="text-xs text-muted-foreground">
              {executionTime}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {consoleOutput ? (
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
            {consoleOutput}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No output yet</p>
              <p className="text-xs mt-1">Run your code to see results here</p>
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="p-3 border-t border-panel-border bg-destructive/10">
          <p className="text-xs text-destructive font-medium">Execution failed</p>
        </div>
      )}
      {status === "success" && (
        <div className="p-3 border-t border-panel-border bg-status-success/10">
          <p className="text-xs text-status-success font-medium">Execution completed successfully</p>
        </div>
      )}
    </div>
  );
};
