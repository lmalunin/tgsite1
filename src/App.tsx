import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { TelegramWindow, FormValues, UserState } from "./types";
import { WelcomePage } from "./components/WelcomePage";

import { VerificationStatus } from "./components/VerificationStatus";
import { ContractPage } from "./components/ContractPage";
import "./App.scss";
import { decodeStartParam } from "./utils/startParam";
import { FormPage } from "./components/FormPage";

type AppPage = "welcome" | "form" | "verification" | "contract";

// Функция для парсинга initData
function parseInitData(initData: string): { user?: { id: number } } {
  const params = new URLSearchParams(initData);
  const userStr = params.get("user");
  if (userStr) {
    try {
      return { user: JSON.parse(userStr) };
    } catch (e) {
      console.error("Failed to parse user from initData", e);
    }
  }
  return {};
}

function App() {
  const telegramApp = (window as TelegramWindow).Telegram?.WebApp;
  const isTelegramEnvironment = Boolean(telegramApp);
  const urlParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  const [currentPage, setCurrentPage] = useState<AppPage>("welcome");
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clientConfig = useMemo(() => {
    const rawStartParam = telegramApp?.initDataUnsafe?.start_param ?? null;
    const fallbackParam = urlParams.get("tgWebAppStartParam") ?? null;
    const paramToUse = rawStartParam || fallbackParam;
    return decodeStartParam(paramToUse);
  }, [telegramApp, urlParams]);

  const messageApiUrl = clientConfig.backend ?? "";
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  }, []);

  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<any | null>(null);

  // Функция для получения chatId
  const getChatId = useCallback(() => {
    if (!telegramApp) return null;

    // Способ 1: из initDataUnsafe
    if (telegramApp.initDataUnsafe?.user?.id) {
      return telegramApp.initDataUnsafe.user.id;
    }

    // Способ 2: парсим initData вручную
    if (telegramApp.initData) {
      const parsed = parseInitData(telegramApp.initData);
      if (parsed.user?.id) {
        return parsed.user.id;
      }
    }

    // Способ 3: из start_param
    if (clientConfig.chatId) {
      return clientConfig.chatId;
    }

    return null;
  }, [telegramApp, clientConfig]);

  // Загрузка состояния пользователя
  const loadUserState = useCallback(async () => {
    if (!telegramApp) {
      setIsLoading(false);
      return;
    }

    const chatId = getChatId();
    if (!chatId) {
      addDebugLog("❌ Не удалось получить chatId");
      addDebugLog(`initData: ${telegramApp.initData}`);
      addDebugLog(
        `initDataUnsafe: ${JSON.stringify(telegramApp.initDataUnsafe)}`
      );
      setIsLoading(false);
      return;
    }

    addDebugLog(`🔍 Загрузка состояния пользователя chatId: ${chatId}`);

    try {
      const response = await fetch(`${messageApiUrl}/api/user/state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (response.ok) {
        const data: UserState = await response.json();
        setUserState(data);
        addDebugLog(`✅ Состояние пользователя: ${JSON.stringify(data)}`);

        // Логика маршрутизации по флоу:
        // Если пользователь уже заполнил анкету (есть данные), сразу показываем статус проверки
        // Если нет - показываем приветствие
        if (data.success && data.firstName && data.lastName) {
          setCurrentPage("verification");
        } else {
          setCurrentPage("welcome");
        }
      } else {
        addDebugLog("❌ Ошибка при загрузке состояния пользователя");
        setCurrentPage("welcome");
      }
    } catch (error) {
      addDebugLog(`❌ Ошибка: ${error}`);
      setCurrentPage("welcome");
    } finally {
      setIsLoading(false);
    }
  }, [telegramApp, messageApiUrl, addDebugLog, getChatId]);

  // Функции для опроса статуса
  const startPolling = useCallback(() => {
    addDebugLog("🔄 Запуск опроса статуса проверки...");

    // Останавливаем предыдущий интервал если есть
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Запускаем новый интервал опроса каждые 5 секунд
    const interval = setInterval(() => {
      loadUserState();
    }, 5000);

    setPollingInterval(interval);
  }, [pollingInterval, loadUserState, addDebugLog]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      addDebugLog("🛑 Остановка опроса статуса");
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval, addDebugLog]);

  useEffect(() => {
    if (!telegramApp) return;

    telegramApp.ready();
    telegramApp.expand();

    // Логируем отладочную информацию
    addDebugLog(`🌐 Telegram WebApp инициализирован`);
    addDebugLog(`initData: ${telegramApp.initData}`);
    addDebugLog(
      `initDataUnsafe: ${JSON.stringify(telegramApp.initDataUnsafe)}`
    );
    addDebugLog(`themeParams: ${JSON.stringify(telegramApp.themeParams)}`);

    const chatId = getChatId();
    if (chatId) {
      addDebugLog(`✅ ChatId получен: ${chatId}`);
    } else {
      addDebugLog(`❌ ChatId не получен`);
    }

    // Применяем тему Telegram
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

    // Загружаем состояние пользователя
    loadUserState();
  }, [telegramApp, loadUserState, getChatId, addDebugLog]);

  // Управление опросом статуса
  useEffect(() => {
    if (currentPage === "verification" && telegramApp) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [currentPage, telegramApp, startPolling, stopPolling]);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending");
    setStatusMessage(null);

    const chatId = getChatId();
    if (!chatId) {
      setStatus("error");
      setStatusMessage("Не удалось идентифицировать пользователя");
      addDebugLog("❌ Не удалось получить chatId в onSubmit");
      return;
    }

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      chatId: chatId,
    };

    try {
      addDebugLog(`📤 Отправка данных на сервер: ${JSON.stringify(payload)}`);

      const response = await fetch(`${messageApiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addDebugLog("✅ Данные успешно отправлены на сервер");
          setStatus("sent");
          setStatusMessage("Данные отправлены на проверку!");

          // Переходим на страницу проверки и обновляем состояние
          setCurrentPage("verification");
          loadUserState();
        } else {
          throw new Error(data.message || "Ошибка сервера");
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setStatus("error");
      setStatusMessage("Ошибка при отправке. Попробуйте снова.");
      addDebugLog(`❌ Ошибка при отправке: ${error}`);
    }
  });

  const handleConfirmContract = async () => {
    if (!telegramApp || !userState) return;

    try {
      const chatId = getChatId();
      if (!chatId) return;

      addDebugLog("📝 Подтверждение договора...");

      const response = await fetch(`${messageApiUrl}/api/user/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (response.ok) {
        addDebugLog("✅ Договор подтвержден!");
        setUserState((prev) => (prev ? { ...prev, isConfirmed: true } : null));
        // Остаемся на странице договора, но показываем чекбокс
      } else {
        addDebugLog("❌ Ошибка при подтверждении договора");
      }
    } catch (error) {
      addDebugLog(`❌ Ошибка: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <main className="app">
        <div className="card">
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  // Рендерим соответствующую страницу
  switch (currentPage) {
    case "welcome":
      return (
        <WelcomePage
          onStartRegistration={() => setCurrentPage("form")}
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          isTelegramEnvironment={isTelegramEnvironment}
        />
      );

    case "form":
      return (
        <FormPage
          onSubmit={onSubmit}
          control={control}
          errors={errors}
          isValid={isValid}
          status={status}
          statusMessage={statusMessage}
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          isTelegramEnvironment={isTelegramEnvironment}
        />
      );

    case "verification":
      return (
        <VerificationStatus
          userState={userState || { success: false }}
          onCheckStatus={() => setCurrentPage("contract")}
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          isTelegramEnvironment={isTelegramEnvironment}
        />
      );

    case "contract":
      return (
        <ContractPage
          userState={userState || { success: false }}
          onConfirm={handleConfirmContract}
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          isTelegramEnvironment={isTelegramEnvironment}
        />
      );

    default:
      return (
        <WelcomePage
          onStartRegistration={() => setCurrentPage("form")}
          debugLogs={debugLogs}
          setDebugLogs={setDebugLogs}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          isTelegramEnvironment={isTelegramEnvironment}
        />
      );
  }
}

export default App;
