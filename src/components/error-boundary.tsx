"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center"
        role="alert"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" aria-hidden />
        </div>
        <div>
          <p className="font-medium text-destructive">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {this.props.fallbackDescription ??
              "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={this.handleReset}
          className="gap-2"
          aria-label="Try again"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Try again
        </Button>
      </div>
    );
  }
}
