import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.setState({
        hasError: false,
      })
      return true
    } else {
      return false
    }
  }

  componentDidCatch() {
    this.setState({
      hasError: true,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <p className="text-xl font-bold text-gray-500 pb-2 border-b border-gray-300">Something went wrong</p>
          <div className="mt-4 text-capitalize">
            Either there are some widget configuration missing or props settings missing
          </div>
        </>
      )
    } else {
      return this.props.children
    }
  }
}

export default ErrorBoundary
