import React from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ICON_MAP = {
  danger: <AlertTriangle size={16} color="#ef4444" />,
  warning: <AlertTriangle size={16} color="#f59e0b" />,
  info: <Info size={16} color="#3b82f6" />,
  success: <CheckCircle size={16} color="#10b981" />,
};

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.uid} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{ICON_MAP[t.type] ?? <Bell size={16} />}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.msg}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(t.uid)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
