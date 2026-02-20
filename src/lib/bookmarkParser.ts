export interface Bookmark {
  title: string;
  url: string;
  addDate: number;
}

export function parseBookmarksHtml(htmlString: string): Bookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const links = Array.from(doc.querySelectorAll('a'));
  
  return links.map(link => {
    const addDateAttr = link.getAttribute('add_date');
    const addDate = addDateAttr ? parseInt(addDateAttr, 10) * 1000 : Date.now(); // Netscape format uses seconds
    
    return {
      title: link.textContent || 'Untitled',
      url: link.href,
      addDate,
    };
  }).filter(bookmark => bookmark.url && bookmark.url.startsWith('http')); // basic filter
}
