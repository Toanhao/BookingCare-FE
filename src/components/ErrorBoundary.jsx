import React from 'react';

/**
 * Error Boundary component to catch React errors in child components
 * and prevent entire app from crashing
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development')
      || process.env.NODE_ENV === 'development';
    if (isDev) {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            border: '1px solid #f5222d',
            borderRadius: '4px',
            backgroundColor: '#fff1f0',
            color: '#f5222d',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '10px' }}>
            Oops! Có lỗi xảy ra
          </h2>
          <details
            style={{
              whiteSpace: 'pre-wrap',
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#fafafa',
              borderRadius: '2px',
              fontSize: '12px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5222d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
