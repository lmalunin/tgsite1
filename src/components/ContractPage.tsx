import { DebugPanel } from "./DebugPanel";
import type { ContractPageProps } from "../types";
import { useState } from "react";

export function ContractPage({
  userState,
  onConfirm,
  debugLogs,
  setDebugLogs,
  showDebug,
  setShowDebug,
  isTelegramEnvironment,
}: ContractPageProps) {
  const [isConfirmed, setIsConfirmed] = useState(
    userState.isConfirmed || false
  );

  const handleDownload = () => {
    // Создаем временный URL для скачивания договора
    const contractContent = `
      ДОГОВОР НАЙМА ЖИЛОГО ПОМЕЩЕНИЯ
      
      г. Москва                              "${new Date().toLocaleDateString()}"
      
      _____________________________________________________________
      (ФИО Наймодателя)
      именуемый(ая) в дальнейшем "Наймодатель", с одной стороны, и
      
      ${userState.firstName} ${userState.lastName}
      именуемый(ая) в дальнейшем "Наниматель", с другой стороны,
      заключили настоящий Договор о нижеследующем:
      
      [Содержание договора...]
    `;

    const blob = new Blob([contractContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dogovor_naima_${userState.lastName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirm = async () => {
    await onConfirm();
    setIsConfirmed(true);
  };

  return (
    <main className="app">
      <div className="card">
        <h1>Договор найма жилого помещения</h1>

        <div className="contract-content">
          <p>
            Пожалуйста, ознакомьтесь с договором найма жилого помещения. После
            изучения документа вы можете его скачать и подтвердить согласие.
          </p>

          <div className="contract-actions">
            <button
              type="button"
              className="submit secondary"
              onClick={handleDownload}
              style={{ marginBottom: "12px" }}
            >
              📄 Скачать договор
            </button>

            {!isConfirmed ? (
              <button type="button" className="submit" onClick={handleConfirm}>
                ✅ Одобряю
              </button>
            ) : (
              <div
                className="success-checkmark"
                style={{ fontSize: "2rem", textAlign: "center" }}
              >
                ✅
                <p
                  style={{
                    fontSize: "1rem",
                    marginTop: "8px",
                    color: "var(--tg-theme-button-color, #31b545)",
                  }}
                >
                  Договор подтвержден!
                </p>
              </div>
            )}
          </div>
        </div>
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
