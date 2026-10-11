import { useState } from "react";
import toast from "react-hot-toast";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { DownloadIcon, CloseIcon, CheckIcon } from "./StoreIcons";

function InstallPrompt() {
  const { isInstallable, install, dismiss } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isInstallable) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const loadToast = toast.loading("Installing app...");

    const result = await install();

    setInstalling(false);

    if (result.success) {
      toast.success("App installed successfully! 🎉", {
        id: loadToast,
        icon: <CheckIcon size={18} />,
      });
    } else if (result.outcome === "dismissed") {
      toast.dismiss(loadToast);
    } else {
      toast.error("Installation failed", { id: loadToast });
    }
  };

  const handleDismiss = () => {
    dismiss();
  };

  return (
    <div className="pwa-install-prompt">
      <button
        className="pwa-dismiss-btn"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <CloseIcon size={14} />
      </button>

      <div className="pwa-install-header">
        <div className="pwa-install-icon">
          <DownloadIcon size={22} />
        </div>
        <div className="pwa-install-info">
          <strong>Install AwaisStore App</strong>
          <p>Faster access, offline support & notifications</p>
        </div>
      </div>

      <div className="pwa-install-features">
        <span>✓ Works offline</span>
        <span>✓ Home screen icon</span>
        <span>✓ Push notifications</span>
      </div>

      <div className="pwa-install-actions">
        <button
          className="pwa-btn pwa-btn-primary"
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? "Installing..." : "Install App"}
        </button>
        <button
          className="pwa-btn pwa-btn-ghost"
          onClick={handleDismiss}
          disabled={installing}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;