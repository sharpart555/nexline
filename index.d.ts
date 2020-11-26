import { ReadStream } from 'fs';
type NexlineInput = number | ReadStream | string | Buffer;

declare function nexline(option: {
  input: NexlineInput | NexlineInput[];
  lineSeparator?: string | string[];
  encoding?: string;
  reverse?: boolean;
  autoCloseFile?: boolean;
}): {
  next: () => Promise<string | null>;
  close: () => void;
};

export default nexline;
