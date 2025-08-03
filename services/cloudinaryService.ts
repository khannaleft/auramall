// services/cloudinaryService.ts

interface CloudinaryResponse {
    secure_url: string;
    // other properties are available, but we only need secure_url
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    // Use the named unsigned upload preset.
    formData.append('upload_preset', 'aurakhannaleft');

    const cloudName = 'dfbz4neaf';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Cloudinary upload failed');
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
