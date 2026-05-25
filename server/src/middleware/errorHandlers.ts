import type { Request, Response, NextFunction } from 'express'

export function payloadErrorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large' })
    return
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }
  next(err)
}
