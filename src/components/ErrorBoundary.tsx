import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-[#2C2A2F] rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">出错了</h1>
            <p className="text-gray-300 mb-4">页面渲染时发生错误：</p>
            <div className="bg-black/30 p-4 rounded mb-4 overflow-auto">
              <pre className="text-sm text-red-300">
                {this.state.error?.toString()}
              </pre>
            </div>
            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  详细信息
                </summary>
                <div className="bg-black/30 p-4 rounded mt-2 overflow-auto">
                  <pre className="text-xs text-gray-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#3fda8c] text-black rounded-lg hover:bg-[#35c279] transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
