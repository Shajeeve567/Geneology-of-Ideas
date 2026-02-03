import { toPng } from 'html-to-image';

function downloadImage(dataUrl) {
  const a = document.createElement('a');
  a.setAttribute('download', 'roadmap.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

export const handleDownloadImage = (nodes) => {
  // 1. Get the viewport element
  const viewport = document.querySelector('.react-flow__viewport');
  if (!viewport) return;

  // 2. Calculate the Bounding Box of all nodes
  // We use a safe default width/height (200/100) because custom nodes might vary
  const imagePadding = 50;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    // Fallback dimensions if React Flow hasn't measured them yet
    const width = node.width || 172; 
    const height = node.height || 90;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + height > maxY) maxY = y + height;
  });

  // 3. Determine total width and height required
  const width = maxX - minX + (imagePadding * 2);
  const height = maxY - minY + (imagePadding * 2);

  // 4. Generate Image with specific transform
  toPng(viewport, {
    backgroundColor: '#fff',
    width: width,
    height: height,
    style: {
      width: width,
      height: height,
      // Translate the graph so the top-left node starts at (padding, padding)
      // and reset any zoom (scale: 1)
      transform: `translate(${-minX + imagePadding}px, ${-minY + imagePadding}px) scale(1)`,
    },
  }).then(downloadImage);
};