import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a0033 0%, #0a0a0a 100%)',
          color: '#ffffff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '48px',
            background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '20px'
          }}>
            Oops! Something went wrong
          </h1>
          <p style={{ fontSize: '18px', color: '#cccccc', marginBottom: '30px' }}>
            The Cyber Duck Race encountered an unexpected error.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #ff00ff, #9d00ff)',
              border: 'none',
              borderRadius: '5px',
              padding: '15px 30px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.5)';
            }}
          >
            Reload Application
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: '40px',
              textAlign: 'left',
              background: '#0a0a0a',
              padding: '20px',
              borderRadius: '5px',
              border: '1px solid #ff00ff',
              maxWidth: '800px'
            }}>
              <summary style={{ cursor: 'pointer', color: '#ff00ff', marginBottom: '10px' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                color: '#00ffff',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
