import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-neutral-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/5 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-white font-display mb-3">
              Oops! Something went wrong.
            </h1>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              We encountered an unexpected error while loading this page. 
              Don't worry, your data is safe. Let's try refreshing.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
            >
              <RefreshCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
              Reload Application
            </button>
          </motion.div>
        </div>
      );
    } // End fallback UI

    return this.props.children; 
  }
}

export default ErrorBoundary;
