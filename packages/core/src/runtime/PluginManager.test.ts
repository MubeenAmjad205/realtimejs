import { describe, it, expect, vi } from 'vitest';
import { createPluginManager } from './PluginManager';

describe('PluginManager', () => {
  it('should register and initialize a plugin', async () => {
    const plugins = createPluginManager();
    const mockInit = vi.fn();
    
    const myPlugin = {
      name: 'test-plugin',
      version: '1.0',
      onInit: mockInit,
    };
    
    await plugins.register(myPlugin, { client: true });
    expect(mockInit).toHaveBeenCalledWith({ client: true });
    expect(plugins.getPlugin('test-plugin')).toBe(myPlugin);
  });

  it('should unregister a plugin and call onDestroy', async () => {
    const plugins = createPluginManager();
    const mockDestroy = vi.fn();
    
    const myPlugin = {
      name: 'test-plugin',
      version: '1.0',
      onDestroy: mockDestroy,
    };
    
    await plugins.register(myPlugin, {});
    await plugins.unregister('test-plugin');
    expect(mockDestroy).toHaveBeenCalled();
    expect(plugins.getPlugin('test-plugin')).toBeUndefined();
  });
});
