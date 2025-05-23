import { contentfulClient } from '../../clients/contentful'
import { environment } from '../../environment'

// Useful when wanting to filter by tags
const tagIds: string[] = []

const limit = 25

/**
 * Publish all the entries based on a given content type
 */
export default async () => {
  const space = await contentfulClient.getSpace(environment.contentful.spaceId)
  const env = await space.getEnvironment(environment.contentful.env)

  let entriesFetched = 0
  while (true) {
    const entries = await env.getEntries({
      content_type: environment.contentful.contentType,
      // If you want to filter by tags
      // 'metadata.tags.sys.id[in]': tagIds.join(','),
      limit,
      skip: entriesFetched,
    })
    if (entries.items.length === 0) return
    const responses = entries.items.map(async entry => {
      // Set your criteria to update the entries
      const isPublished =
        entry.sys.version && entry.sys.publishedVersion && entry.sys.version === entry.sys.publishedVersion + 1
      if (!isPublished) return entry.publish()
    })
    await Promise.all(responses)
    entriesFetched += limit
  }
}
