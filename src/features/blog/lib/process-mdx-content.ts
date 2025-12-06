/**
 * Process MDX content to convert JSX-style iframes to HTML
 * This allows react-markdown to properly render embedded content
 */
export function processMDXContent(content: string): string {
  let processed = content;
  
  // Convert JSX-style iframe divs to HTML
  // Pattern: <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
  //          <iframe src="..." title="..." style={{...}} frameBorder="0" allowFullScreen></iframe>
  //          </div>
  
  // Match JSX-style div with iframe
  const jsxIframePattern = /<div\s+style=\{\{\s*position:\s*"relative",\s*paddingBottom:\s*"56\.25%",\s*height:\s*0\s*\}\}\s*>[\s\n]*<iframe\s+([\s\S]*?)>[\s\n]*<\/iframe>[\s\n]*<\/div>/g;
  
  processed = processed.replace(jsxIframePattern, (match, iframeContent) => {
    // Extract attributes from iframe
    const srcMatch = iframeContent.match(/src=["']([^"']+)["']/);
    const titleMatch = iframeContent.match(/title=["']([^"']+)["']/);
    
    if (srcMatch) {
      const src = srcMatch[1];
      const title = titleMatch ? titleMatch[1] : "Embedded content";
      
      return `<div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; margin: 2rem 0;">
  <iframe 
    src="${src}" 
    title="${title}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    frameborder="0" 
    allowfullscreen
  ></iframe>
</div>`;
    }
    
    return match;
  });
  
  return processed;
}

