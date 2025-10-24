import { supabase } from "./supabase";
import imageCompression from 'browser-image-compression';

export const imageUploadService = {
  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 0.5,          // Maximum size 500KB (from 3.5MB)
      maxWidthOrHeight: 1920,  // Max resolution (perfect for web)
      useWebWorker: true,      // Non-blocking compression
      fileType: 'image/webp',  // Modern efficient format
      initialQuality: 0.85,    // High quality (85%)
      alwaysKeepResolution: false, // Allow resolution reduction
      preserveExif: false,     // Remove metadata to save space
    };

    try {
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(0)} MB`);
      
      const compressedFile = await imageCompression(file, options);
      
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(0)} MB`);
      console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% smaller`);
      
      return compressedFile;
    } catch (error) {
      console.error('Compression failed:', error);
      throw new Error('Failed to compress image');
    }
  },

  // async uploadImage(file: File, folder: string = 'products'): Promise<string> {
  //   try {
  //     // Compress image first
  //     const compressedFile = await this.compressImage(file);
      
  //     // Create unique filename
  //     const fileExt = 'webp'; // Force WebP for best compression
  //     const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  //     const filePath = `${folder}/${fileName}`;

  //     console.log('Uploading compressed file to:', filePath);

  //     // Upload compressed file to Supabase Storage
  //     const { error } = await supabase.storage
  //       .from('product-images')
  //       .upload(filePath, compressedFile, {
  //         cacheControl: '3600',
  //         upsert: false
  //       });
        
  //     if (error) {
  //       console.error('Upload error:', error);
  //       throw new Error(`Upload failed: ${error.message}`);
  //     }

  //     // Get public URL
  //     const { data: urlData } = supabase.storage
  //       .from('product-images')
  //       .getPublicUrl(filePath);

  //     return urlData.publicUrl;

  //   } catch (error: any) {
  //     console.error('Image upload service error:', error);
  //     throw error;
  //   }
  // },

  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    try {
      // Get original file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading original file to:', filePath);
      console.log('File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      // Upload original file to Supabase Storage
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;

    } catch (error: any) {
      console.error('Image upload service error:', error);
      throw error;
    }
  },

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'product-images');
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      console.log('Deleting file:', filePath); // Debug log

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

    } catch (error: any) {
      console.error('Delete image service error:', error);
      throw error;
    }
  }
};
