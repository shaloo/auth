import { generateID, RedirectParams } from './utils';

class Popup {
  private window: Window | null;
  private id: string;
  constructor(public url: string) {}

  public async open(): Promise<RedirectParams> {
    this.id = generateID();
    const windowFeatures = getWindowFeatures();
    this.window = window.open(this.url, '_blank', windowFeatures);
    if (this.window) {
      const response = await this.handleWindowResponse(this.id);
      return response;
    } else {
      throw new Error('Could not open popup window');
    }
  }

  private handleWindowResponse(id: string): Promise<RedirectParams> {
    return new Promise((resolve, reject) => {
      let safeClose = false;
      const closedMonitor = setInterval(() => {
        if (!safeClose && this.window?.closed) {
          reject(new Error('popup closed by user'));
        }
      }, 500);
      const handler = async (event: MessageEvent) => {
        const { status, error = null } = event.data;
        const params: RedirectParams = event.data.params;
        safeClose = true;
        clearInterval(closedMonitor);
        if (params.state && params.state !== id) {
          return;
        }
        window.removeEventListener('message', handler);
        this.window?.close();
        if (status === 'success') {
          return resolve(params);
        } else {
          return reject(error);
        }
      };
      window.addEventListener('message', handler, false);
    });
  }
}

const popupFeatures: { [key: string]: number } = {
  titlebar: 0,
  toolbar: 0,
  status: 0,
  menubar: 0,
  resizable: 0,
  height: 700,
  width: 1200,
};

const getWindowFeatures = (): string => {
  let f = '';
  for (const feature in popupFeatures) {
    f += `${feature}=${popupFeatures[feature]}`;
  }
  return f;
};

export default Popup;
