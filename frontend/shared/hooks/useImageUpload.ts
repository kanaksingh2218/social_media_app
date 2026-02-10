import { useState, useEffect, useCallback, useRef } from 'react';

interface UseImageUploadOptions {
    maxFiles?: number;
    maxSizeInBytes?: number;
    initialImageUrls?: string[];
}

interface UseImageUploadReturn {
    selectedImages: File[]; // New files
    existingImages: string[]; // URLs of existing images
    imagePreviews: string[]; // Previews for NEW files
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addFiles: (files: File[]) => void;
    removeImage: (index: number) => void;
    removeExistingImage: (index: number) => void;
    clearImages: () => void;
    errors: string[];
}

export const useImageUpload = ({
    maxFiles = 10,
    maxSizeInBytes = 5 * 1024 * 1024, // 5MB
    initialImageUrls = []
}: UseImageUploadOptions = {}): UseImageUploadReturn => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialImageUrls);
    const [errors, setErrors] = useState<string[]>([]);

    // Use a ref to track the previous initialImageUrls to prevent infinite loops
    // when a new array reference is passed on every render (e.g. default value [])
    const prevInitialUrlsRef = useRef<string[] | undefined>(undefined);

    useEffect(() => {
        const prev = prevInitialUrlsRef.current;
        const current = initialImageUrls;

        // Simple array comparison
        const isSame = prev && current &&
            prev.length === current.length &&
            prev.every((val: string, index: number) => val === current[index]);

        if (!isSame) {
            setExistingImages(current);
            prevInitialUrlsRef.current = current;
        }
    }, [initialImageUrls]);

    // Keep track of previews in ref for stable clearImages
    const previewsRef = useRef<string[]>([]);
    useEffect(() => {
        previewsRef.current = imagePreviews;
    }, [imagePreviews]);

    const addFiles = useCallback((files: File[]) => {
        const newErrors: string[] = [];

        if (files.length + selectedImages.length + existingImages.length > maxFiles) {
            alert(`Maximum ${maxFiles} images allowed.`);
            return;
        }

        const validFiles: File[] = [];
        files.forEach(file => {
            // Validate type
            if (!file.type.startsWith('image/')) {
                newErrors.push(`File ${file.name} is not an image.`);
            }
            // Validate size
            else if (file.size > maxSizeInBytes) {
                newErrors.push(`File ${file.name} is too large. Max size is ${maxSizeInBytes / (1024 * 1024)}MB.`);
            } else {
                validFiles.push(file);
            }
        });

        if (newErrors.length > 0) {
            alert(newErrors.join('\n'));
            setErrors(prev => [...prev, ...newErrors]);
        }

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setSelectedImages(prev => [...prev, ...validFiles]);
        }
    }, [selectedImages.length, existingImages.length, maxFiles, maxSizeInBytes]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addFiles(files);
        e.target.value = '';
    }, [addFiles]);

    const removeImage = useCallback((index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }, [imagePreviews]);

    const removeExistingImage = useCallback((index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearImages = useCallback(() => {
        // Use ref to avoid adding imagePreviews to dependency array
        previewsRef.current.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setSelectedImages([]);
        setExistingImages([]);
        setErrors([]);
    }, []); // Stable identity!

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    return {
        selectedImages,
        existingImages,
        imagePreviews,
        handleImageSelect,
        addFiles,
        removeImage,
        removeExistingImage,
        clearImages,
        errors
    };
};
