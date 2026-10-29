/**
 * Image compression and optimization utilities for Masud Digital Hub.
 * Prevents QuotaExceededError in localStorage by keeping avatars compact (~10-25KB).
 */

export function compressImageForAvatar(
  imageSource: string | File,
  maxDimension = 200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's a standard web URL (http/https), no canvas compression needed
    if (typeof imageSource === 'string' && !imageSource.startsWith('data:')) {
      resolve(imageSource);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof imageSource === 'string' ? imageSource : '');
          return;
        }

        // Fill background to avoid transparent PNGs turning black when converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.warn('Canvas image compression failed, falling back to original:', err);
        resolve(typeof imageSource === 'string' ? imageSource : '');
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during compression:', err);
      resolve(typeof imageSource === 'string' ? imageSource : '');
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve('');
        }
      };
      reader.onerror = (err) => {
        console.warn('FileReader error:', err);
        reject(err);
      };
      reader.readAsDataURL(imageSource);
    }
  });
}
