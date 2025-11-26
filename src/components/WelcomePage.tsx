import { DebugPanel } from "./DebugPanel";
import type { WelcomePageProps } from "../types";

export function WelcomePage({
  onStartRegistration,
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
  isTelegramEnvironment,
}: WelcomePageProps) {
  // Получаем данные из Telegram WebApp
  const telegramApp = (window as any).Telegram?.WebApp;
  const user = telegramApp?.initDataUnsafe?.user;

  return (
    <main className="app">
      <div className="card welcome-card">
        <h1>Добро пожаловать!</h1>

        <div className="user-info">
          <p>
            <strong>Ваши данные из Telegram:</strong>
          </p>
          <p>Имя: {user?.first_name || "Не указано"}</p>
          <p>Фамилия: {user?.last_name || "Не указано"}</p>
          <p>Логин: @{user?.username || "Не указан"}</p>
          <p>Телефон: {user?.phone || "Не указан"}</p>
        </div>

        <p className="welcome-message">
          Для продолжения работы необходимо заполнить анкету и пройти проверку
          данных.
        </p>

        <button
          className="submit"
          onClick={onStartRegistration}
          style={{ marginTop: "20px" }}
        >
          📝 Заполнить анкету
        </button>
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
