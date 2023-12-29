import { Destructor } from '../createDestructor';
import { PenpalMessage } from '../types';
import CommsAdapter from '../CommsAdapter';

class IframeToParentAdapter implements CommsAdapter {
  private _log: Function;
  private _messageCallbacks: Set<(message: PenpalMessage) => void> = new Set();
  private _originForSending: string | undefined;

  constructor(log: Function, destructor: Destructor) {
    this._log = log;

    self.addEventListener('message', this._handleMessageFromParent);

    destructor.onDestroy(() => {
      self.removeEventListener('message', this._handleMessageFromParent);
      this._messageCallbacks.clear();
    });
  }

  private _handleMessageFromParent = (event: MessageEvent): void => {
    if (!event.data?.penpal) {
      return;
    }

    const penpalMessage: PenpalMessage = event.data;

    for (const callback of this._messageCallbacks) {
      callback(penpalMessage);
    }
  };

  sendMessage = (message: PenpalMessage) => {
    self.postMessage(message, this._originForSending!);
  };

  addMessageHandler = (callback: (message: PenpalMessage) => void): void => {
    this._messageCallbacks.add(callback);
  };

  removeMessageHandler = (callback: (message: PenpalMessage) => void): void => {
    this._messageCallbacks.delete(callback);
  };
}

export default IframeToParentAdapter;
