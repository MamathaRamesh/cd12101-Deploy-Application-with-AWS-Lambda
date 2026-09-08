import { S3Client } from '@aws-sdk/client-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateAttachmentUrl } from '../../dataLayer/todosAccess.mjs'
import { parseUserId } from '../../auth/utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('generateUploadUrl')

const s3Client = new S3Client()
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = 300

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId
    const authHeader = event.headers.Authorization || event.headers.authorization
    const token = authHeader.split(' ')[1]
    const userId = parseUserId(token)

    logger.info('Generating upload URL', { todoId, userId })

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: todoId
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: urlExpiration })

    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await updateAttachmentUrl(userId, todoId, attachmentUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    }
  })