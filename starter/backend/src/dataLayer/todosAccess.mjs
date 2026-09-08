import AWSXRay from 'aws-xray-sdk-core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todosAccess')

const client = AWSXRay.captureAWSv3Client(new DynamoDBClient())
const docClient = DynamoDBDocumentClient.from(client)

const todosTable = process.env.TODOS_TABLE

export async function createTodo(todo) {
  logger.info('Creating new todo', { todoId: todo.todoId })

  await docClient.send(
    new PutCommand({
      TableName: todosTable,
      Item: todo
    })
  )

  return todo
}

export async function getTodosForUser(userId) {
  logger.info('Getting todos for user', { userId })

  const result = await docClient.send(
    new QueryCommand({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
  )

  return result.Items
}

export async function updateTodo(userId, todoId, updatedTodo) {
  logger.info('Updating todo', { userId, todoId })

  await docClient.send(
    new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    })
  )
}

export async function deleteTodo(userId, todoId) {
  logger.info('Deleting todo', { userId, todoId })

  await docClient.send(
    new DeleteCommand({
      TableName: todosTable,
      Key: { userId, todoId }
    })
  )
}

export async function updateAttachmentUrl(userId, todoId, attachmentUrl) {
  logger.info('Updating attachment URL', { userId, todoId })

  await docClient.send(
    new UpdateCommand({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
  )
}