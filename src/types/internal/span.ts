import { Span } from '../../span/span.document.js';

export type MainSpan = Omit<Span, 'attributes'> & {
  attributes: Omit<
    Span['attributes'],
    'history' | 'response' | 'prompt' | 'traceId' | 'version'
  > & {
    version: NonNullable<Span['attributes']['version']>;
    history: NonNullable<Span['attributes']['history']>;
    prompt: NonNullable<Span['attributes']['prompt']>;
    traceId: NonNullable<Span['attributes']['traceId']>;
    response: NonNullable<Span['attributes']['response']>;
  };
};
