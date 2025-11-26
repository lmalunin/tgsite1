import type { Control, FieldErrors } from "react-hook-form";
import type { TelegramWebApp } from "./telegram";

export type FormValues = {
  firstName: string;
  lastName: string;
};

export type TelegramWindow = Window &
  typeof globalThis & {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  };

export type DebugPanelProps = {
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
};

export type WelcomePageProps = {
  onStartRegistration: () => void;
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
  isTelegramEnvironment: boolean;
};

export type FormPageProps = {
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
};

export type UserState = {
  success: boolean;
  firstName?: string;
  lastName?: string;
  verified?: "inprogress" | "discarded" | "approved";
  isConfirmed?: boolean;
  message?: string;
};

export type VerificationStatusProps = {
  userState: UserState;
  onCheckStatus: () => void;
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
  isTelegramEnvironment: boolean;
};

export type ContractPageProps = {
  userState: UserState;
  onConfirm: () => void;
  debugLogs: string[];
  setDebugLogs: React.Dispatch<React.SetStateAction<string[]>>;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
  isTelegramEnvironment: boolean;
};
