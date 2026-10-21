import { Component, type ReactNode } from 'react'

// Last line of defence: a crash in any screen shows this instead of a blank page.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="crash" role="alert">
        <h1>حدث خطأ غير متوقع</h1>
        <p className="muted">ملاحظاتك وعلاماتك محفوظة على الجهاز. أعد فتح التطبيق للمتابعة.</p>
        <div className="row">
          <button className="btn" onClick={() => location.reload()}>
            إعادة التحميل
          </button>
          <button className="btn secondary" onClick={() => this.setState({ error: null })}>
            المحاولة مرة أخرى
          </button>
        </div>
        <pre>{error.message}</pre>
      </div>
    )
  }
}
