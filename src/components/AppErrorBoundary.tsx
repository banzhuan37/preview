import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Icon } from "../icons";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("BioVision interface error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <main className="fatal-error-page">
      <span><Icon name="alert"/></span>
      <small>INTERFACE RECOVERY</small>
      <h1>页面暂时无法显示</h1>
      <p>项目和分析结果仍安全保存在本地。请重新加载界面；如果问题持续出现，请保留当前项目并检查本地服务日志。</p>
      <details><summary>错误详情</summary><code>{this.state.error.message || "未知界面错误"}</code></details>
      <button onClick={() => window.location.reload()}>重新加载 BioVision</button>
    </main>;
  }
}
