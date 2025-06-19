import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    autoSave: true,
    language: "en",
    graphics: "high",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const handleResetProgress = () => {
    if (
      confirm(
        "Are you sure you want to reset all progress? This action cannot be undone!"
      )
    ) {
      // TODO: Implement reset progress
      alert("Reset progress functionality will be implemented later.");
    }
  };

  return (
    <div className="settings-screen">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h2>⚙️ Settings</h2>
        </div>

        {/* Audio Settings */}
        <div className="settings-section">
          <h3>🔊 Audio Settings</h3>
          <div className="setting-item">
            <label>
              <span>Sound Effects</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  handleSettingChange("soundEnabled", e.target.checked)
                }
              />
            </label>
          </div>
          <div className="setting-item">
            <label>
              <span>Background Music</span>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) =>
                  handleSettingChange("musicEnabled", e.target.checked)
                }
              />
            </label>
          </div>
        </div>

        {/* Game Settings */}
        <div className="settings-section">
          <h3>🎮 Game Settings</h3>
          <div className="setting-item">
            <label>
              <span>Auto Save</span>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) =>
                  handleSettingChange("autoSave", e.target.checked)
                }
              />
            </label>
          </div>
          <div className="setting-item">
            <label>
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  handleSettingChange("notificationsEnabled", e.target.checked)
                }
              />
            </label>
          </div>
          <div className="setting-item">
            <label>
              <span>Graphics Quality</span>
              <select
                value={settings.graphics}
                onChange={(e) =>
                  handleSettingChange("graphics", e.target.value)
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </label>
          </div>
          <div className="setting-item">
            <label>
              <span>Language</span>
              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
              >
                <option value="en">English</option>
                <option value="th">ไทย</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </label>
          </div>
        </div>

        {/* Account Actions */}
        <div className="settings-section">
          <h3>🔐 Account Actions</h3>
          <div className="action-buttons">
            <button className="action-button change-password">
              🔑 Change Password
            </button>
            <button className="action-button export-data">
              📤 Export Save Data
            </button>
            <button className="action-button import-data">
              📥 Import Save Data
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <div className="action-buttons">
            <button
              className="action-button reset-progress"
              onClick={handleResetProgress}
            >
              🗑️ Reset All Progress
            </button>
            <button className="action-button logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <p>🎮 Idle: Picoen v1.0.0</p>
          <p>Made with ❤️ for gamers</p>
        </div>
      </div>
    </div>
  );
}
