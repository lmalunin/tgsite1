import { Controller } from "react-hook-form";
import type { RegistrationFormProps } from "../types";
import { DebugPanel } from "./DebugPanel";

const REGISTRATION_HINT =
  "Эти данные увидит только бот и сразу поздоровается с вами по имени.";

export function RegistrationForm({
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
}: RegistrationFormProps) {
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

