export async function uploadImage(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/cloudinary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: reader.result,
            upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          }),
        });
        const data = await response.json();
        resolve(data.url);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
}