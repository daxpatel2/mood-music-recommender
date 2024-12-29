// src/contexts/DeviceContext.js
import React, { createContext, useState } from "react";

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);

  return (
    <DeviceContext.Provider value={{ deviceId, setDeviceId }}>
      {children}
    </DeviceContext.Provider>
  );
};
