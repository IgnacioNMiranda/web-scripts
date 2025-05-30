import { contentfulClient } from '../../clients/contentful'
import { environment } from '../../environment'

// Use when wanting to filter by Contentful ID
const ids: string[] = []

const limit = 10

/**
 * Refresh all entries of a given content type to the previous snapshot
 */
export default async () => {
  const space = await contentfulClient.getSpace(environment.contentful.spaceId)
  const env = await space.getEnvironment(environment.contentful.env)

  let entriesFetched = 0
  let entriesRefreshed = 0
  while (true) {
    const entries = await env.getEntries({
      content_type: environment.contentful.contentType,
      limit,
      ...(ids.length && { 'sys.id[in]': ids }),
      skip: entriesFetched,
    })

    if (entries.items.length === 0) return

    for (const entry of entries.items) {
      if (
        !!entry.sys.publishedAt &&
        !!entry.sys.publishedVersion &&
        entry.sys.version !== entry.sys.publishedVersion + 1
      ) {
        entriesRefreshed++
        console.log(entry.sys)
        const snapshots = await entry.getSnapshots()
        entry.fields = snapshots.items[0].snapshot.fields
        await entry.update()
      }
    }
    entriesFetched += limit
    console.log(`Entries refreshed: ${entriesRefreshed}`)
  }
}
