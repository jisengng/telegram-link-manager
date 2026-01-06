import axios from 'axios';
import * as cheerio from 'cheerio';

// URL pattern-based categorization
const categorizeUrl = (url) => {
  const urlLower = url.toLowerCase();

  // Video platforms
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'video';
  if (urlLower.includes('vimeo.com')) return 'video';
  if (urlLower.includes('twitch.tv')) return 'video';
  if (urlLower.includes('tiktok.com')) return 'video';

  // Code/Tech platforms
  if (urlLower.includes('github.com')) return 'tech';
  if (urlLower.includes('stackoverflow.com')) return 'tech';
  if (urlLower.includes('gitlab.com')) return 'tech';
  if (urlLower.includes('bitbucket.org')) return 'tech';

  // Product/Shopping
  if (urlLower.includes('amazon.')) return 'product';
  if (urlLower.includes('producthunt.com')) return 'product';
  if (urlLower.includes('etsy.com')) return 'product';
  if (urlLower.includes('ebay.com')) return 'product';
  if (urlLower.includes('aliexpress.com')) return 'product';

  // News/Articles
  if (urlLower.includes('medium.com')) return 'article';
  if (urlLower.includes('dev.to')) return 'article';
  if (urlLower.includes('substack.com')) return 'article';
  if (urlLower.includes('bloomberg.com')) return 'article';
  if (urlLower.includes('techcrunch.com')) return 'article';
  if (urlLower.includes('theverge.com')) return 'article';
  if (urlLower.includes('arstechnica.com')) return 'article';
  if (urlLower.includes('wired.com')) return 'article';

  // Documentation
  if (urlLower.includes('docs.') || urlLower.includes('/docs/')) return 'docs';
  if (urlLower.includes('documentation')) return 'docs';

  // Social media
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'social';
  if (urlLower.includes('reddit.com')) return 'social';
  if (urlLower.includes('linkedin.com')) return 'social';
  if (urlLower.includes('facebook.com')) return 'social';
  if (urlLower.includes('instagram.com')) return 'social';

  // Default to article if no specific pattern matches
  return 'article';
};

// Get default logo for known sites
const getDefaultLogo = (url) => {
  const urlLower = url.toLowerCase();

  // Social media logos
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png';
  }
  if (urlLower.includes('facebook.com')) {
    return 'https://www.facebook.com/images/fb_icon_325x325.png';
  }
  if (urlLower.includes('instagram.com')) {
    return 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png';
  }
  if (urlLower.includes('linkedin.com')) {
    return 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca';
  }
  if (urlLower.includes('reddit.com')) {
    return 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';
  }

  // Tech platforms
  if (urlLower.includes('github.com')) {
    return 'https://github.githubassets.com/assets/apple-touch-icon-144x144-b882e354c005.png';
  }
  if (urlLower.includes('stackoverflow.com')) {
    return 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon@2.png';
  }

  // Video platforms
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png';
  }
  if (urlLower.includes('vimeo.com')) {
    return 'https://f.vimeocdn.com/images_v6/share/vimeo_icon_white.png';
  }
  if (urlLower.includes('tiktok.com')) {
    return 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png';
  }

  // Other popular sites
  if (urlLower.includes('medium.com')) {
    return 'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png';
  }
  if (urlLower.includes('dev.to')) {
    return 'https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png';
  }
  if (urlLower.includes('producthunt.com')) {
    return 'https://ph-static.imgix.net/ph-ios-icon.png';
  }

  return '';
};

// Extract title from X.com/Twitter URL
const getTitleFromXUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p);

    // Extract username and tweet ID if available
    // Format: x.com/username/status/tweetid
    if (pathParts.length >= 1) {
      const username = pathParts[0];
      if (pathParts.length >= 3 && pathParts[1] === 'status') {
        return `Tweet by @${username}`;
      }
      return `@${username} on X`;
    }
    return 'Post on X';
  } catch (e) {
    return 'Post on X';
  }
};

// Extract metadata from URL
export const extractMetadata = async (url) => {
  const urlLower = url.toLowerCase();

  // Special handling for X.com/Twitter - don't attempt to scrape
  if (urlLower.includes('x.com') || urlLower.includes('twitter.com')) {
    console.log('X.com/Twitter link detected, using fallback metadata');
    return {
      title: getTitleFromXUrl(url),
      description: 'Click to view on X',
      imageUrl: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
      category: 'social'
    };
  }

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title (priority: og:title > twitter:title > title tag)
    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'Untitled';

    // Clean title
    title = title.trim().substring(0, 200);

    // Extract description (priority: og:description > twitter:description > meta description)
    let description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Clean description
    description = description.trim().substring(0, 500);

    // Extract image (priority: og:image > twitter:image > first img tag)
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('img').first().attr('src') ||
      '';

    // Handle relative image URLs
    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        if (imageUrl.startsWith('//')) {
          imageUrl = urlObj.protocol + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = urlObj.origin + imageUrl;
        } else {
          imageUrl = urlObj.origin + '/' + imageUrl;
        }
      } catch (e) {
        imageUrl = '';
      }
    }

    // Categorize based on URL
    const category = categorizeUrl(url);

    // If no image found, use default logo for known sites or generic
    if (!imageUrl) {
      imageUrl = getDefaultLogo(url);
      // If still no logo, use a generic link icon
      if (!imageUrl) {
        imageUrl = 'https://cdn-icons-png.flaticon.com/512/2058/2058947.png'; // Generic link icon
      }
    }

    return {
      title,
      description,
      imageUrl,
      category
    };
  } catch (error) {
    console.error('Error extracting metadata:', error.message);

    // Return minimal metadata if extraction fails
    let defaultLogo = getDefaultLogo(url);
    // Generic fallback
    if (!defaultLogo) {
      defaultLogo = 'https://cdn-icons-png.flaticon.com/512/2058/2058947.png';
    }

    return {
      title: url.substring(0, 100),
      description: '',
      imageUrl: defaultLogo,
      category: categorizeUrl(url)
    };
  }
};
