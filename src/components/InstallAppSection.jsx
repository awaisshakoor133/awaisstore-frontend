import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { DownloadIcon, CheckIcon, CloseIcon } from "./StoreIcons";

function InstallAppSection() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Agar already installed hai, toh kuch nahi dikhao
  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    const loadToast = toast.loading("Opening install dialog...");

    // Agar beforeinstallprompt event available hai
    if (isInstallable) {
      const result = await install();
      setInstalling(false);

      if (result.success) {
        toast.success("App installed successfully! 🎉", { id: loadToast });
      } else if (result.outcome === "dismissed") {
        toast.dismiss(loadToast);
      } else {
        toast.error("Installation cancelled", { id: loadToast });
      }
    } else {
      // Manual instructions
      setInstalling(false);
      toast.dismiss(loadToast);
      setShowManual(true);
    }
  };

  return (
    <div className="install-app-section">
      <div className="install-app-header">
        <div className="install-app-icon">
          <DownloadIcon size={24} />
        </div>
        <div className="install-app-info">
          <h3>Install AwaisStore App</h3>
          <p>
            Get faster access, offline support & notifications. Works like a
            native app on your device.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="install-app-features">
        <div className="install-feature">
          <CheckIcon size={14} />
          <span>Works offline</span>
        </div>
        <div className="install-feature">
          <CheckIcon size={14} />
          <span>Home screen icon</span>
        </div>
        <div className="install-feature">
          <CheckIcon size={14} />
          <span>Push notifications</span>
        </div>
        <div className="install-feature">
          <CheckIcon size={14} />
          <span>Faster loading</span>
        </div>
      </div>

      {/* Install Button */}
      <button
        className="install-app-btn"
        onClick={handleInstall}
        disabled={installing}
      >
        <DownloadIcon size={18} />
        <span>{installing ? "Installing..." : "Install AwaisStore"}</span>
      </button>

      {/* Manual Instructions Modal */}
      {showManual && (
        <div
          className="install-manual-overlay"
          onClick={() => setShowManual(false)}
        >
          <div
            className="install-manual-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="install-manual-close"
              onClick={() => setShowManual(false)}
              aria-label="Close"
            >
              <CloseIcon size={16} />
            </button>

            <h3>Install Manually</h3>
            <p className="muted">
              Your browser doesn't support automatic install. Follow these
              steps:
            </p>

            <div className="install-manual-steps">
              <div className="install-step">
                <span className="install-step-num">1</span>
                <div>
                  <strong>Chrome Menu</strong>
                  <p>Tap the ⋮ (3 dots) menu in top-right corner</p>
                </div>
              </div>

              <div className="install-step">
                <span className="install-step-num">2</span>
                <div>
                  <strong>Find "Install"</strong>
                  <p>
                    Look for "Install app" or "Add to Home screen" option
                  </p>
                </div>
              </div>

              <div className="install-step">
                <span className="install-step-num">3</span>
                <div>
                  <strong>Confirm</strong>
                  <p>Tap "Install" to add AwaisStore to your device</p>
                </div>
              </div>
            </div>

            <div className="install-manual-note">
              <strong>💡 iOS (iPhone/iPad):</strong>
              <p>
                Safari → Share button → "Add to Home Screen"
              </p>
            </div>

            <button
              className="install-manual-done"
              onClick={() => setShowManual(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallAppSection;