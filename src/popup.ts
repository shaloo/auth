import { generateID, RedirectParams } from './utils';

class Popup {
  private window: Window | null;
  private id: string;
  constructor(public url: string) {
    this.id = generateID();
  }

  public open(): void {
    const windowFeatures = getWindowFeatures();
    this.window = window.open(this.url, '_blank', windowFeatures);
  }

  public getWindowResponse(): Promise<RedirectParams> {
    return new Promise((resolve, reject) => {
      let safeClose = false;
      const closedMonitor = setInterval(() => {
        if (!safeClose && this.window?.closed) {
          reject('popup closed by user');
        }
      }, 500);
      const handler = async (event: MessageEvent) => {
        if (!event?.data?.status) {
          return;
        }
        const { status, error = null, params } = this.getParams(event.data);
        safeClose = true;
        clearInterval(closedMonitor);
        this.clear(handler);
        if (params.state && params.state !== this.id) {
          return reject(`state mismatch`);
        }
        if (status === 'success' && !error) {
          return resolve(params);
        } else {
          return reject(`${error}: ${params.error_description}`);
        }
      };
      window.addEventListener('message', handler, false);
    });
  }

  private getParams(data: MessageEvent['data']) {
    const {
      status,
      params,
    }: { error: string | null; status: string; params: RedirectParams } = data;

    return { status, error: params.error, params };
  }

  private clear(handler: (ev: MessageEvent) => void): void {
    window.removeEventListener('message', handler);
    this.window?.close();
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
