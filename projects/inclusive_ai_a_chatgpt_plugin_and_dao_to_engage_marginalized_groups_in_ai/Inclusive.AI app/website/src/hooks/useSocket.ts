import { useState, useEffect } from 'react'
import { io as socketIo, Socket } from 'socket.io-client'

export type UseSocketParams = {
  namespace: string
  jwtToken: string | undefined
  url?: string
  autoJoin?: boolean
  autoJoinChannel?: string // usually the user id (email)
}

export function useSocket(opts: UseSocketParams) {
  const { namespace, jwtToken, url: _url, autoJoin, autoJoinChannel } = opts

  const [socket, setSocket] = useState<Socket | undefined>(undefined)

  const url = _url || (process.env.NEXT_PUBLIC_WS_URL as string)
  const urlNamespaced = `${url}/${namespace}`

  useEffect(() => {
    if (!urlNamespaced || !jwtToken) return
    // console.log('socket', socket)

    // todo: if already connected to the same `urlNamespace`, then skip

    const _socket = socketIo(urlNamespaced, {
      path: '/socket', // socket.io server opened at /socket not /socket.io
      transports: ['websocket'],
      auth: { token: `Bearer ${jwtToken}` },
    })

    setSocket(_socket)
    // clean up
    return () => {
      _socket.disconnect()
    }
  }, [urlNamespaced, jwtToken])

  useEffect(() => {
    if (!socket || !autoJoin || !autoJoinChannel) return

    socket.emit('join', { channel: autoJoinChannel })
    return () => {
      socket.emit('leave', { channel: autoJoinChannel })
    }
  }, [socket, autoJoin, autoJoinChannel])

  return socket
}
