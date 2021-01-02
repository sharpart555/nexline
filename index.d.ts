declare const nexline: {
  (param: nexline.NexlineOption): nexline.NexlineMethod;
};

declare namespace nexline {
  import { ReadStream } from 'fs';
  type NexlineInput = number | ReadStream | string | Buffer;
  interface NexlineOption {
    input: NexlineInput | NexlineInput[];
    lineSeparator?: string | string[];
    encoding?: string;
    reverse?: boolean;
    autoCloseFile?: boolean;
  }

  interface NexlineMethod {
    next: () => Promise<string | null>;
    close: () => void;
  }
}

export = nexline;
