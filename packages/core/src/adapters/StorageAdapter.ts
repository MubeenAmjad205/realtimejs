export interface StorageAdapter {
  upload(path: string, file: Uint8Array, mimeType: string): Promise<string>;
  download(path: string): Promise<Uint8Array>;
  delete(path: string): Promise<boolean>;
  getUrl(path: string): Promise<string>;
}
