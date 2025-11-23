import type { DebugPanelProps } from "../types";

export function DebugPanel({
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
}: DebugPanelProps) {
  return (
    <div className="debug-panel">
      <button
        type="button"
        onClick={() => setShowDebug(!showDebug)}
        className="debug-toggle"
      >
        {showDebug ? "🔽 Скрыть логи" : "🔼 Показать логи"}
      </button>
      {showDebug && (
        <div className="debug-logs">
          <div className="debug-header">
            <strong>Логи отладки:</strong>
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="debug-clear"
            >
              Очистить
            </button>
          </div>
          {debugLogs.length === 0 ? (
            <p className="debug-empty">Логи пусты</p>
          ) : (
            <div className="debug-content">
              {debugLogs.map((log, idx) => (
                <div key={idx} className="debug-log-line">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

