window.function = async function (imageUrl) {
  const url = imageUrl.value;
  if (!url) return "No image URL provided.";

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (window.Tesseract) {
        clearInterval(interval);

        try {
          // Preload image for processing
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url;

          img.onload = async () => {
            // Draw on canvas for preprocessing
            const canvas = document.createElement("canvas");
            const scale = 2; // upscale for better OCR
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");

            // Convert to grayscale
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const binary = avg > 180 ? 255 : 0; // simple threshold
              data[i] = data[i + 1] = data[i + 2] = binary;
            }

            ctx.putImageData(imgData, 0, 0);

            // Run OCR on preprocessed image
            const { data: { text } } = await window.Tesseract.recognize(canvas, 'eng', {
              tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/.-$* ',
            });

            // Basic cleanup: remove double spaces, trim edges
            const cleaned = text
              .replace(/\s{2,}/g, ' ')
              .replace(/Dockat/g, 'Docket')
              .replace(/ELEPOSI/g, 'ELEPOS1')
              .replace(/\.{2,}/g, '.')
              .replace(/\n{2,}/g, '\n')
              .trim();

            resolve(cleaned);
          };
        } catch (err) {
          resolve(`Error: ${err.message}`);
        }
      }
    }, 100);
  });
};
