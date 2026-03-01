import type { SharedContent } from '@/types/post';

export type ShareKind = SharedContent['kind'];

export interface SharePayload {
  kind: ShareKind;
  title: string;
  text: string;
  url: string;
  feedCaption: string;
  sharedContent: SharedContent;
}
