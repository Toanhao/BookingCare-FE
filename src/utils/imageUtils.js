/** @format */

const computeImageUrl = (img) => {
  if (!img) return null;
  try {
    if (typeof img === 'string') {
      if (
        img.startsWith('data:') ||
        img.startsWith('http') ||
        img.startsWith('/')
      ) {
        return img;
      }
      return `data:image/jpeg;base64,${img}`;
    }

    if (img.data && Array.isArray(img.data)) {
      try {
        const bytes = img.data;
        const uint8 = new Uint8Array(bytes);

        try {
          const text =
            typeof TextDecoder !== 'undefined'
              ? new TextDecoder().decode(uint8)
              : null;
          if (text) {
            if (
              text.startsWith('data:') ||
              text.startsWith('http') ||
              text.startsWith('/')
            ) {
              return text;
            }
            if (text.indexOf('base64,') !== -1) {
              return text;
            }
          }
        } catch (e) {}

        const blob = new Blob([uint8], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      } catch (e) {
        return null;
      }
    }

    // nested structures
    if (typeof img === 'object') {
      if (img.image) return computeImageUrl(img.image);
      if (img.buffer && img.buffer.data)
        return computeImageUrl(img.buffer.data);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export default computeImageUrl;
