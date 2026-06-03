import { MetadataRoute } from 'next';
import { getApiUrl } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rawwire.onrender.com';

  // Fetch articles for sitemap
  let newsUrls: MetadataRoute.Sitemap = [];
  
  try {
    const res = await fetch(`${getApiUrl()}/news?limit=1000`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const newsItems = data.data || [];
      
      newsUrls = newsItems.map((item: any) => ({
        url: `${baseUrl}/news/${item._id}`,
        lastModified: new Date(item.updatedAt || item.createdAt),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
  }

  // Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...newsUrls];
}
