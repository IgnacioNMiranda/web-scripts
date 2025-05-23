import { input } from '@inquirer/prompts'
import { environment } from '../../environment'

export default async () => {
  const secretKey = await input({
    message: 'Enter the secret key:',
    default: 'secret_key',
  })

  const secretValue = await input({
    message: 'Enter the secret value:',
    default: 'test',
  })

  const response = await fetch(`https://api.vercel.com/v10/projects/${environment.vercel.projectId}/env?upsert=true`, {
    body: JSON.stringify({
      key: secretKey,
      value: secretValue,
      type: 'encrypted',
      target: ['preview', 'development'],
    }),
    headers: {
      Authorization: `Bearer ${environment.vercel.token}`,
    },
    method: 'post',
  })
  const data = await response.json()
  return data
}
