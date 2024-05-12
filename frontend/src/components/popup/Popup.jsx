import React from 'react';
import './Popup.css';

const Popup = ({ isOpen, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup">
        {children}
      </div>
    </div>
  );
};

export default Popup;