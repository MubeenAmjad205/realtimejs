import React, { createContext, useContext, ReactNode } from 'react';
import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from './features';
import { DEFAULT_UI_CONFIG, UIConfig } from './ui';

export interface GlobalConfig {
  features: FeatureFlags;
  ui: UIConfig;
}

const DEFAULT_CONFIG: GlobalConfig = {
  features: DEFAULT_FEATURE_FLAGS,
  ui: DEFAULT_UI_CONFIG,
};

const ConfigContext = createContext<GlobalConfig>(DEFAULT_CONFIG);

export interface UIConfigProviderProps {
  config?: Partial<{
    features: Partial<FeatureFlags>;
    ui: Partial<UIConfig>;
  }>;
  children: ReactNode;
}

export function UIConfigProvider({ config, children }: UIConfigProviderProps) {
  const mergedConfig: GlobalConfig = {
    features: { ...DEFAULT_FEATURE_FLAGS, ...config?.features },
    ui: { ...DEFAULT_UI_CONFIG, ...config?.ui },
  };

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useUIConfig() {
  return useContext(ConfigContext);
}
