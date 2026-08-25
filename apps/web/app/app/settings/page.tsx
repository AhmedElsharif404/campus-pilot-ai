"use client";

import { Check, Download, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="workspace-page settings-page">
      <header className="workspace-page-header">
        <div>
          <p className="date-line">Account and preferences</p>
          <h1>Settings</h1>
          <p>
            Control planning boundaries, offline behavior, notifications, and
            your data.
          </p>
        </div>
      </header>
      {saved && (
        <div className="success-banner" role="status">
          <Check size={17} /> Preferences saved.
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <section className="settings-section">
          <div>
            <h2>Study availability</h2>
            <p>
              These windows constrain suggestions. CampusPilot never assumes
              every free hour is study time.
            </p>
          </div>
          <div className="settings-fields">
            <label>
              Typical weekday start
              <input type="time" defaultValue="09:00" />
            </label>
            <label>
              Latest study end
              <input type="time" defaultValue="19:00" />
            </label>
            <label>
              Preferred session length
              <select defaultValue="45">
                <option value="25">25 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>
          </div>
        </section>
        <section className="settings-section">
          <div>
            <h2>Notifications</h2>
            <p>
              Use restraint: warnings are for meaningful changes, not routine
              activity.
            </p>
          </div>
          <div className="toggle-list">
            <label>
              <span>
                <strong>Deadline reminders</strong>
                <small>24 hours and 2 hours before confirmed deadlines</small>
              </span>
              <input type="checkbox" defaultChecked />
            </label>
            <label>
              <span>
                <strong>Workload pressure</strong>
                <small>When weighted work clusters into a short window</small>
              </span>
              <input type="checkbox" defaultChecked />
            </label>
            <label>
              <span>
                <strong>Daily agenda</strong>
                <small>One morning summary on active study days</small>
              </span>
              <input type="checkbox" />
            </label>
          </div>
        </section>
        <section className="settings-section">
          <div>
            <h2>Privacy and data</h2>
            <p>
              Export or remove your records. Document-derived data includes its
              full provenance trail.
            </p>
          </div>
          <div className="data-actions">
            <button type="button" className="button button-secondary">
              <Download size={16} /> Export my data
            </button>
            <button type="button" className="danger-button">
              <Trash2 size={16} /> Delete account and data
            </button>
          </div>
        </section>
        <div className="settings-submit">
          <button className="button" type="submit">
            Save preferences
          </button>
          <button className="button-quiet" type="button">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </form>
    </div>
  );
}
