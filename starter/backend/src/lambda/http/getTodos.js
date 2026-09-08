import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodosForUser } from '../../dataLayer/todosAccess.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getTodos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    const authHeader = event.headers.Authorization || event.headers.authorization
    const token = authHeader.split(' ')[1]
    const userId = parseUserId(token)

    logger.info('Getting todos for user', { userId })

    const items = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items })
    }
  })