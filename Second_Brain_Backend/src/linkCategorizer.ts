export interface LinkCategory {
  type: string;
  category: string;
  domain: string;
}

export interface PlatformConfig {
  type: string;
  category: string;
  embedSupport?: boolean;
}

// Platform mapping for known domains
const platformMap: Record<string, PlatformConfig> = {
  // Social Media
  'twitter.com': { type: 'twitter', category: 'social', embedSupport: true },
  'x.com': { type: 'twitter', category: 'social', embedSupport: true },
  'instagram.com': { type: 'instagram', category: 'social', embedSupport: true },
  'linkedin.com': { type: 'linkedin', category: 'social', embedSupport: true },
  'facebook.com': { type: 'facebook', category: 'social', embedSupport: true },
  'tiktok.com': { type: 'tiktok', category: 'social', embedSupport: true },
  'reddit.com': { type: 'reddit', category: 'social', embedSupport: true },

  // Videos
  'youtube.com': { type: 'youtube', category: 'video', embedSupport: true },
  'youtu.be': { type: 'youtube', category: 'video', embedSupport: true },
  'vimeo.com': { type: 'vimeo', category: 'video', embedSupport: true },
  'twitch.tv': { type: 'twitch', category: 'video', embedSupport: true },
  'dailymotion.com': { type: 'dailymotion', category: 'video', embedSupport: true },

  // Code & Development
  'github.com': { type: 'github', category: 'code', embedSupport: false },
  'gitlab.com': { type: 'gitlab', category: 'code', embedSupport: false },
  'codepen.io': { type: 'codepen', category: 'code', embedSupport: true },
  'codesandbox.io': { type: 'codesandbox', category: 'code', embedSupport: true },
  'stackoverflow.com': { type: 'stackoverflow', category: 'code', embedSupport: false },
  'replit.com': { type: 'replit', category: 'code', embedSupport: true },

  // Articles & Blogs
  'medium.com': { type: 'medium', category: 'article', embedSupport: false },
  'dev.to': { type: 'dev', category: 'article', embedSupport: false },
  'hashnode.com': { type: 'hashnode', category: 'article', embedSupport: false },
  'substack.com': { type: 'substack', category: 'article', embedSupport: false },

  // Audio
  'spotify.com': { type: 'spotify', category: 'audio', embedSupport: true },
  'soundcloud.com': { type: 'soundcloud', category: 'audio', embedSupport: true },
  'music.apple.com': { type: 'apple-music', category: 'audio', embedSupport: true },

  // Images
  'imgur.com': { type: 'imgur', category: 'image', embedSupport: false },
  'pinterest.com': { type: 'pinterest', category: 'image', embedSupport: false },
  'flickr.com': { type: 'flickr', category: 'image', embedSupport: false },

  // Documents
  'docs.google.com': { type: 'google-docs', category: 'document', embedSupport: true },
  'notion.so': { type: 'notion', category: 'document', embedSupport: false },
  'dropbox.com': { type: 'dropbox', category: 'document', embedSupport: false },
};

// File extension patterns
const filePatterns = {
  image: /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
  video: /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i,
  audio: /\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i,
  document: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)(\?.*)?$/i,
};

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Remove www. prefix
    return hostname.replace(/^www\./, '');
  } catch (error) {
    return '';
  }
}

/**
 * Extract base domain (e.g., "example.com" from "blog.example.com")
 */
function getBaseDomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return domain;
}

/**
 * Check if URL matches a file pattern
 */
function checkFileType(url: string): { type: string; category: string } | null {
  if (filePatterns.image.test(url)) {
    return { type: 'image', category: 'image' };
  }
  if (filePatterns.video.test(url)) {
    return { type: 'video', category: 'video' };
  }
  if (filePatterns.audio.test(url)) {
    return { type: 'audio', category: 'audio' };
  }
  if (filePatterns.document.test(url)) {
    return { type: 'document', category: 'document' };
  }
  return null;
}

/**
 * Categorize a link based on its URL
 */
export function categorizeLink(url: string): LinkCategory {
  const domain = extractDomain(url);

  // Check for direct domain match
  if (platformMap[domain]) {
    const config = platformMap[domain];
    return {
      type: config.type,
      category: config.category,
      domain: domain,
    };
  }

  // Check for base domain match (e.g., subdomain.medium.com)
  const baseDomain = getBaseDomain(domain);
  if (baseDomain !== domain && platformMap[baseDomain]) {
    const config = platformMap[baseDomain];
    return {
      type: config.type,
      category: config.category,
      domain: baseDomain,
    };
  }

  // Check for file extensions
  const fileType = checkFileType(url);
  if (fileType) {
    return {
      type: fileType.type,
      category: fileType.category,
      domain: domain || 'unknown',
    };
  }

  // Default to article/other
  return {
    type: 'other',
    category: 'other',
    domain: domain || 'unknown',
  };
}

/**
 * Get all supported content types
 */
export const contentTypes = [
  // Social
  'twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'reddit',
  // Video
  'youtube', 'vimeo', 'twitch', 'dailymotion',
  // Code
  'github', 'gitlab', 'codepen', 'codesandbox', 'stackoverflow', 'replit',
  // Article
  'medium', 'dev', 'hashnode', 'substack', 'article',
  // Audio
  'spotify', 'soundcloud', 'apple-music',
  // Image
  'imgur', 'pinterest', 'flickr', 'image',
  // Document
  'google-docs', 'notion', 'dropbox', 'document',
  // Video/Audio generic
  'video', 'audio',
  // Other
  'other'
] as const;

/**
 * Get all categories
 */
export const categories = [
  'social',
  'video',
  'code',
  'article',
  'audio',
  'image',
  'document',
  'other'
] as const;

/**
 * Validate if a URL is valid
 */
export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Normalize URL (add https if missing)
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}
