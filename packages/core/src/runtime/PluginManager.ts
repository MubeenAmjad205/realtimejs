export interface RealtimePlugin {
  name: string;
  version: string;
  onInit?: (client: any) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}

export function createPluginManager() {
  const plugins = new Map<string, RealtimePlugin>();

  return {
    register: async (plugin: RealtimePlugin, client: any) => {
      if (plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is already registered.`);
      }
      
      plugins.set(plugin.name, plugin);
      if (plugin.onInit) {
        await plugin.onInit(client);
      }
    },
    
    unregister: async (pluginName: string) => {
      const plugin = plugins.get(pluginName);
      if (plugin) {
        if (plugin.onDestroy) {
          await plugin.onDestroy();
        }
        plugins.delete(pluginName);
      }
    },
    
    getPlugin: (name: string) => plugins.get(name),
    getAllPlugins: () => Array.from(plugins.values()),
  };
}
