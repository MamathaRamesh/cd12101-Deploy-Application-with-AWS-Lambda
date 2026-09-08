import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodo } from '../../dataLayer/todosAccess.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('createTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    const newTodo = JSON.parse(event.body)
    const authHeader = event.headers.Authorization || event.headers.authorization
    const token = authHeader.split(' ')[1]
    const userId = parseUserId(token)

    const todoId = uuidv4()
    const newItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      name: newTodo.name,
      dueDate: newTodo.dueDate,
      done: false
    }

    logger.info('Creating a new todo item', { todoId, userId })

    const item = await createTodo(newItem)

    return {
      statusCode: 201,
      body: JSON.stringify({ item })
    }
  })