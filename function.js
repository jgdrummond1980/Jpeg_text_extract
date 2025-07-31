window.function = async function (imageUrl) {
  const url = imageUrl.value;
  if (!url) return "No image URL provided.";

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (window.Tesseract) {
        clearInterval(interval);
        try {
          const { data: { text } } = await window.Tesseract.recognize(url, 'eng');
          resolve(text.trim());
        } catch (err) {
          resolve(`Error: ${err.message}`);
        }
      }
    }, 100);
  });
};
