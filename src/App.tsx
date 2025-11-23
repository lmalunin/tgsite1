import { useEffect, useMemo, useState } from "react";
import type { TelegramWebApp } from "./telegram";
import { Controller, useForm } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import "./App.scss";

type FormValues = {
  firstName: string;
  lastName: string;
};

const REGISTRATION_HINT =
  "Эти данные увидит только бот и сразу поздоровается с вами по имени.";

// Данные отправляются напрямую через Telegram WebApp API,
// не требуется HTTP запрос к бэкенду

type TelegramWindow = Window &
  typeof globalThis & {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  };

function WelcomePage({
  firstName,
  lastName,
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
  isTelegramEnvironment,
}: {
  firstName: string;
  lastName: string;
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
  isTelegramEnvironment: boolean;
}) {
  return (
    <main className="app">
      <div className="card welcome-card">
        <h1>
          Привет, {firstName} {lastName}!
        </h1>
        <p className="welcome-message">
          Регистрация успешно завершена. Ваши данные сохранены в базу данных.
        </p>
        <p
          className="welcome-hint"
          style={{
            fontSize: "0.9rem",
            color: "var(--tg-muted)",
            marginTop: "12px",
          }}
        >
          💡 Проверьте чат с ботом для подтверждения сохранения данных
        </p>
      </div>

      {/* Панель отладки на странице приветствия */}
      {isTelegramEnvironment && (
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
      )}
    </main>
  );
}

function RegistrationForm({
  onSubmit,
  control,
  errors,
  isValid,
  status,
  statusMessage,
  isTelegramEnvironment,
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
}: {
  onSubmit: (e: React.FormEvent) => void;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  isValid: boolean;
  status: "idle" | "sending" | "sent" | "error";
  statusMessage: string | null;
  isTelegramEnvironment: boolean;
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Регистрация</p>
        <h1>Заполните форму</h1>
        <p className="intro">
          {REGISTRATION_HINT} Пожалуйста, укажите реальные имя и фамилию.
        </p>
      </header>

      <form className="card" onSubmit={onSubmit} noValidate>
        <Controller
          name="firstName"
          control={control}
          rules={{
            required: "Введите имя",
            minLength: {
              value: 2,
              message: "Имя должно быть длиннее 1 символа",
            },
          }}
          render={({ field }) => (
            <label className="field">
              <span>Имя</span>
              <input
                {...field}
                type="text"
                inputMode="text"
                placeholder="Иван"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <small className="error">{errors.firstName.message}</small>
              )}
            </label>
          )}
        />

        <Controller
          name="lastName"
          control={control}
          rules={{
            required: "Введите фамилию",
            minLength: {
              value: 2,
              message: "Фамилия должна быть длиннее 1 символа",
            },
          }}
          render={({ field }) => (
            <label className="field">
              <span>Фамилия</span>
              <input
                {...field}
                type="text"
                inputMode="text"
                placeholder="Петров"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <small className="error">{errors.lastName.message}</small>
              )}
            </label>
          )}
        />

        <button
          type="submit"
          className="submit"
          disabled={!isValid || status === "sending"}
        >
          {status === "sending" ? "Отправляем..." : "Отправить"}
        </button>
        {statusMessage && (
          <p className={`status status-${status}`}>{statusMessage}</p>
        )}
      </form>

      {!isTelegramEnvironment && (
        <div className="warning">
          <strong>Подсказка:</strong> откройте этого бота в Telegram и нажмите
          кнопку «Регистрация». Тогда бот получит данные и поприветствует вас.
        </div>
      )}

      {/* Панель отладки для Telegram WebApp */}
      {isTelegramEnvironment && (
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
                <p className="debug-empty">Логи появятся при отправке формы</p>
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
      )}
    </main>
  );
}

function App() {
  const telegramApp = (window as TelegramWindow).Telegram?.WebApp;
  const isTelegramEnvironment = Boolean(telegramApp);

  // Проверяем URL параметры для страницы приветствия
  const urlParams = new URLSearchParams(window.location.search);
  const isWelcomePage = urlParams.get("welcome") === "1";
  const welcomeFirstName = urlParams.get("firstName") || "";
  const welcomeLastName = urlParams.get("lastName") || "";

  const defaultValues = useMemo<FormValues>(() => {
    const user = telegramApp?.initDataUnsafe?.user;
    return {
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
    };
  }, [telegramApp]);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onChange",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Панель отладки для просмотра логов в Telegram WebApp
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!telegramApp) {
      return;
    }
    telegramApp.ready();
    telegramApp.expand();

    const root = document.documentElement;
    const theme = telegramApp.themeParams;
    if (theme?.bg_color) root.style.setProperty("--tg-bg", theme.bg_color);
    if (theme?.text_color)
      root.style.setProperty("--tg-text", theme.text_color);
    if (theme?.hint_color)
      root.style.setProperty("--tg-muted", theme.hint_color);
    if (theme?.button_color)
      root.style.setProperty("--tg-accent", theme.button_color);
    if (theme?.button_text_color)
      root.style.setProperty("--tg-accent-text", theme.button_text_color);
  }, [telegramApp]);

  // Функция для добавления логов в панель отладки
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message); // Также в консоль для обычных браузеров
  };

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    setStatusMessage(null);
    // НЕ очищаем логи - они должны сохраняться при переходе на страницу приветствия

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      timestamp: new Date().toISOString(),
    };

    try {
      if (telegramApp) {
        addDebugLog("✅ telegramApp доступен");
        addDebugLog(`📤 Подготовка данных: ${JSON.stringify(payload)}`);

        // Используем sendData() для отправки данных боту
        // ВАЖНО: sendData() работает только если WebApp открыт через Reply Keyboard
        const dataString = JSON.stringify(payload);
        addDebugLog(`📦 Данные сериализованы: ${dataString.length} символов`);
        addDebugLog(
          `🔍 sendData доступен: ${typeof telegramApp.sendData === "function"}`
        );

        try {
          // Используем sendData() для отправки данных боту
          // WebApp закроется автоматически после sendData()
          // Бот сохранит данные и отправит кнопку "Продолжить" для открытия страницы приветствия
          addDebugLog("🚀 Вызов sendData()...");
          addDebugLog(
            "⚠️ Внимание: WebApp закроется автоматически после sendData()"
          );
          addDebugLog("💡 Бот сохранит данные и отправит кнопку 'Продолжить'");

          // Отправляем данные через sendData()
          // WebApp закроется автоматически
          // Бот получит данные, сохранит в db.json и отправит кнопку "Продолжить"
          telegramApp.sendData(dataString);
          addDebugLog("✅ sendData() вызван успешно!");
          addDebugLog("💡 WebApp закроется, бот отправит кнопку 'Продолжить'");

          setStatus("sent");
          setStatusMessage(
            "Данные отправлены! WebApp закроется, затем нажмите кнопку 'Продолжить' в чате."
          );
        } catch (sendError) {
          const errorMsg = `❌ Ошибка при вызове sendData(): ${sendError}`;
          addDebugLog(errorMsg);
          console.error("Error calling sendData():", sendError);
          throw sendError;
        }
      } else {
        // Фолбэк для тестирования вне Telegram
        console.log("Form payload (not in Telegram):", payload);
        setStatus("sent");
        setStatusMessage(
          "Форма работает. Откройте её через Telegram, чтобы завершить регистрацию."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Что-то пошло не так. Попробуйте снова."
      );
    }
  });

  // Если это страница приветствия из URL параметров (после сохранения в БД)
  // Бот открывает WebApp через кнопку "Продолжить" с параметрами
  if (isWelcomePage && welcomeFirstName && welcomeLastName) {
    return (
      <WelcomePage
        firstName={welcomeFirstName}
        lastName={welcomeLastName}
        debugLogs={debugLogs}
        setDebugLogs={setDebugLogs}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        isTelegramEnvironment={isTelegramEnvironment}
      />
    );
  }

  // Иначе показываем форму регистрации
  return (
    <RegistrationForm
      onSubmit={onSubmit}
      control={control}
      errors={errors}
      isValid={isValid}
      status={status}
      statusMessage={statusMessage}
      isTelegramEnvironment={isTelegramEnvironment}
      debugLogs={debugLogs}
      setDebugLogs={setDebugLogs}
      showDebug={showDebug}
      setShowDebug={setShowDebug}
    />
  );
}

export default App;
