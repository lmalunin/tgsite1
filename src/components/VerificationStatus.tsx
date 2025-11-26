import { DebugPanel } from "./DebugPanel";
import type { VerificationStatusProps } from "../types";

export function VerificationStatus({
  userState,
  onCheckStatus,
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
  isTelegramEnvironment,
}: VerificationStatusProps) {
  const getStatusMessage = () => {
    switch (userState.verified) {
      case "inprogress":
        return {
          title: "Идет проверка",
          message:
            "Ваши данные находятся на проверке. Пожалуйста, подождите. Статус обновляется автоматически...",
          color: "var(--tg-theme-button-color, #2481cc)",
          icon: "⏳",
          showButton: false,
        };
      case "approved":
        return {
          title: "Данные проверены",
          message: "Поздравляем! Ваши данные успешно проверены.",
          color: "var(--tg-theme-button-color, #31b545)",
          icon: "✅",
          showButton: true,
        };
      case "discarded":
        return {
          title: "Данные не прошли проверку",
          message:
            "К сожалению, ваши данные не прошли проверку. Обратитесь к администратору.",
          color: "var(--tg-theme-destructive-color, #ff3b30)",
          icon: "❌",
          showButton: false,
        };
      default:
        return {
          title: "Статус неизвестен",
          message: "Не удалось определить статус проверки.",
          color: "var(--tg-theme-hint-color, #999999)",
          icon: "❓",
          showButton: false,
        };
    }
  };

  const status = getStatusMessage();

  return (
    <main className="app">
      <div className="card">
        <div
          className="status-header"
          style={{ borderLeftColor: status.color }}
        >
          <h1>
            {status.icon} {status.title}
          </h1>
          <p>{status.message}</p>
        </div>

        {/* Показываем информацию о пользователе */}
        {userState.firstName && userState.lastName && (
          <div className="user-info" style={{ marginTop: "16px" }}>
            <p>
              <strong>Ваши данные:</strong>
            </p>
            <p>Имя: {userState.firstName}</p>
            <p>Фамилия: {userState.lastName}</p>
          </div>
        )}

        {/* Кнопка "Дальше" только для approved */}
        {status.showButton && (
          <button
            className="submit"
            onClick={onCheckStatus}
            style={{ marginTop: "20px" }}
          >
            Дальше
          </button>
        )}

        {userState.verified === "approved" && userState.isConfirmed && (
          <div className="success-section">
            <div className="success-checkmark">✓</div>
            <p
              style={{
                textAlign: "center",
                color: "var(--tg-theme-button-color, #31b545)",
              }}
            >
              Договор успешно подтвержден!
            </p>
          </div>
        )}

        {/* Прогресс-бар для визуализации ожидания */}
        {userState.verified === "inprogress" && (
          <div style={{ marginTop: "20px" }}>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
                color: "var(--tg-theme-hint-color)",
                marginTop: "8px",
              }}
            >
              Автоматическое обновление каждые 5 секунд...
            </p>
          </div>
        )}
      </div>

      {isTelegramEnvironment && (
        <DebugPanel
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
        />
      )}
    </main>
  );
}
