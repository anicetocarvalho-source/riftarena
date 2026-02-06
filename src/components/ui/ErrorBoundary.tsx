import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-rift opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-destructive/10 blur-[120px] rounded-full" />

          <div className="relative w-full max-w-md mx-4 text-center">
            <div className="rounded-sm border border-border bg-card p-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              <h1 className="font-display text-2xl font-bold uppercase tracking-wide mb-2">
                Algo correu mal
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Ocorreu um erro inesperado. Tenta recarregar a página ou voltar ao início.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-3 rounded-sm bg-destructive/5 border border-destructive/20 text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="rift"
                  className="flex-1"
                  onClick={this.handleReload}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar
                </Button>
                <Button
                  variant="rift-outline"
                  className="flex-1"
                  onClick={this.handleGoHome}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
