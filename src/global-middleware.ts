import { registerGlobalMiddleware } from '@tanstack/react-start';
import { loggingMiddleware, sessionMiddleware } from './middleware';

registerGlobalMiddleware({
  middleware: [sessionMiddleware, loggingMiddleware],
});
