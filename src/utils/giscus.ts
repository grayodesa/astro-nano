export async function getCommentCount(path: string) {
  try {
    const response = await fetch(
      `https://giscus.app/api/discussions?repo=grayodesa/tg-comments&term=${path}&strict=0`
    );
    const data = await response.json();
    return data.discussion?.totalCommentCount || 0;
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }
} 