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

export interface ConfigContextType extends GlobalConfig {
  updateConfig: (newConfig: Partial<GlobalConfig>) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  ...DEFAULT_CONFIG,
  updateConfig: () => {}
});

export interface UIConfigProviderProps {
  config?: Partial<{
    features: Partial<FeatureFlags>;
    ui: Partial<UIConfig>;
  }>;
  children: ReactNode;
}

export function UIConfigProvider({ config, children }: UIConfigProviderProps) {
  const [currentConfig, setCurrentConfig] = React.useState<GlobalConfig>({
    features: { ...DEFAULT_FEATURE_FLAGS, ...config?.features },
    ui: { ...DEFAULT_UI_CONFIG, ...config?.ui }
  });

  const updateConfig = (newConfig: Partial<GlobalConfig>) => {
    setCurrentConfig(prev => ({
      features: { ...prev.features, ...(newConfig.features || {}) },
      ui: { ...prev.ui, ...(newConfig.ui || {}) }
    }));
  };

  return (
    <ConfigContext.Provider value={{ ...currentConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useUIConfig() {
  return useContext(ConfigContext);
}
