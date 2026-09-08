import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { deleteTodo } from '../../dataLayer/todosAccess.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const authHeader = event.headers.Authorization || event.headers.authorization
    const token = authHeader.split(' ')[1]
    const userId = parseUserId(token)

    logger.info('Deleting todo item', { todoId, userId })

    await deleteTodo(userId, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  })