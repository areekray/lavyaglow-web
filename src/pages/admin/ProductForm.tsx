import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import type { Product, ProductFormData } from "@/types";
import { productService } from "@/services/productService";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { intParseHandler } from "@/utils/misc";
import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  groupedScents,
  groupedColors,
  stringToArray,
  arrayToString,
  colorHexMap,
} from "@/constants/productOptions";
import { imageUploadService } from "@/services/imageUploadService";

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [highlightCount, setHighlightCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      category: product?.category || "",
      actual_price: product?.actual_price || 0,
      discounted_price: product?.discounted_price || 0,
      stock_quantity: product?.stock_quantity || 0,
      in_stock: product?.in_stock ?? true,
      can_do_bulk: product?.can_do_bulk || false,
      scent: product?.characteristics?.scent || "",
      burn_time: product?.characteristics?.burn_time || "",
      colors: product?.characteristics?.colors || "",
      dimensions: product?.characteristics?.dimensions || "",
      instagram_media_id: product?.instagram_media_id || "",
      highlight_in_home: product?.highlight_in_home || false,
      price_sets: product?.price_sets || [], // Initialize with existing price sets or empty array
    },
  });

  // Fixed useFieldArray - remove 'as any'
  const {
    fields: priceSetFields,
    append: appendPriceSet,
    remove: removePriceSet,
  } = useFieldArray({
    control,
    name: "price_sets", // Remove 'as any'
  });

  const actualPrice = watch("actual_price");
  const discountedPrice = watch("discounted_price");

  const watchActualPrice = !actualPrice
    ? 0
    : typeof actualPrice === "string"
    ? parseInt(actualPrice)
    : actualPrice;
  const watchDiscountedPrice = !discountedPrice
    ? 0
    : typeof discountedPrice === "string"
    ? parseInt(discountedPrice)
    : discountedPrice;
  const watchCanDoBulk = !!watch("can_do_bulk");
  const watchInStock = !!watch("in_stock");
  const watchHighlightInHome = !!watch("highlight_in_home");

  // Calculate discount percentage
  const discountPercentage = productService.calculateDiscountPercentage(
    watchActualPrice,
    watchDiscountedPrice
  );

  useEffect(() => {
    productService.getHighlightCount().then((count) => {
      setHighlightCount(count);
    });
  }, []);

  useEffect(() => {
    if (watchCanDoBulk) {
      setValue("in_stock", true);
    }
  }, [watchCanDoBulk, setValue]);

  useEffect(() => {
    // Auto-update set prices when actual price changes
    if (watchActualPrice > 0 && priceSetFields.length > 0) {
      priceSetFields.forEach((_field, index) => {
        const setQuantity = watch(`price_sets.${index}.set_quantity` as const);
        if (setQuantity) {
          // Auto-calculate actual price for set
          const newActualPrice = watchActualPrice * setQuantity;
          setValue(`price_sets.${index}.actual_price` as const, newActualPrice);

          // Keep discounted price proportional or suggest a discount
          const currentDiscounted = watch(
            `price_sets.${index}.discounted_price` as const
          );
          if (!currentDiscounted || currentDiscounted >= newActualPrice) {
            // Suggest 10-15% discount for sets
            const suggestedDiscount = Math.round(newActualPrice * 0.85); // 15% discount
            setValue(
              `price_sets.${index}.discounted_price` as const,
              suggestedDiscount
            );
          }
        }
      });
    }
  }, [watchActualPrice, priceSetFields, setValue, watch]);

  // Update the addPriceSet function:

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    try {
      // Convert FileList to Array
      const fileArray = Array.from(files);

      // Show upload progress
      const uploadPromises = fileArray.map(async (file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Upload to Supabase Storage
        const imageUrl = await imageUploadService.uploadImage(file);

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        return imageUrl;
      });

      // Wait for all uploads to complete
      const newImageUrls = await Promise.all(uploadPromises);

      // Add to images array
      setImages((prev) => [...prev, ...newImageUrls]);

      toast.success(
        `${newImageUrls.length} image${
          newImageUrls.length > 1 ? "s" : ""
        } uploaded successfully!`
      );
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(`Failed to upload images: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    
    // Delete from Supabase Storage
    try {
      await imageUploadService.deleteImage(imageToRemove);
      
      // Remove from local state
      setImages(prev => prev.filter((_, index) => index !== indexToRemove));
      
      toast.success('Image removed successfully');
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const addPriceSet = () => {
    if (priceSetFields.length >= 5) {
      toast.error("Maximum 5 price sets allowed per product");
      return;
    }

    const newSetQuantity = 2;
    const calculatedActualPrice = watchActualPrice * newSetQuantity;
    const suggestedDiscountedPrice = Math.round(calculatedActualPrice * 0.9); // 10% discount

    appendPriceSet({
      id: `temp-${Date.now()}`,
      product_id: product?.id || "",
      set_quantity: newSetQuantity,
      actual_price: calculatedActualPrice,
      discounted_price: suggestedDiscountedPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Validate pricing
      if (
        intParseHandler(data.actual_price) <
        intParseHandler(data.discounted_price)
      ) {
        toast.error("Discounted price cannot be higher than actual price");
        return;
      }

      if (
        !watchCanDoBulk &&
        data.in_stock &&
        intParseHandler(data.stock_quantity) <= 0
      ) {
        toast.error(
          "Stock quantity must be greater than 0 when product is in stock and not bulk-enabled"
        );
        return;
      }

      // Check highlight constraint
      if (data.highlight_in_home && !product?.highlight_in_home) {
        if (highlightCount >= 4) {
          toast.error(
            "Only 4 products can be featured in Our Curated Collection. Please remove highlighting from another product first."
          );
          return;
        }
      }

      const productData = {
        name: data.name,
        description: data.description,
        category: data.category,
        actual_price: intParseHandler(data.actual_price),
        discounted_price: intParseHandler(data.discounted_price),
        price: intParseHandler(data.discounted_price), // Backward compatibility
        stock_quantity: intParseHandler(data.stock_quantity),
        in_stock: data.in_stock,
        can_do_bulk: data.can_do_bulk,
        images: images,
        characteristics: {
          scent: data.scent || undefined,
          burn_time: data.burn_time || undefined,
          colors: data.colors || "",
          dimensions: data.dimensions || undefined,
        },
        instagram_media_id: data.instagram_media_id || undefined,
        highlight_in_home: data.highlight_in_home,
      };

      let savedProduct: Product;
      if (product) {
        savedProduct = await productService.updateProduct(
          product.id,
          productData
        );
      } else {
        savedProduct = await productService.createProduct(productData);
      }

      // Handle price sets - now data.price_sets will exist
      for (const priceSetData of data.price_sets) {
        if (priceSetData.id && priceSetData.id.startsWith("temp-")) {
          // Create new price set
          await productService.createPriceSet(savedProduct.id, {
            set_quantity: intParseHandler(priceSetData.set_quantity),
            actual_price: intParseHandler(priceSetData.actual_price),
            discounted_price: intParseHandler(priceSetData.discounted_price),
          });
        } else if (priceSetData.id) {
          // Update existing price set
          await productService.updatePriceSet(priceSetData.id, {
            set_quantity: intParseHandler(priceSetData.set_quantity),
            actual_price: intParseHandler(priceSetData.actual_price),
            discounted_price: intParseHandler(priceSetData.discounted_price),
          });
        }
      }

      toast.success(`Product ${product ? "updated" : "created"} successfully!`);
      onSave(savedProduct);
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const canHighlight = !watchHighlightInHome && highlightCount < 4;
  const highlightMessage = watchHighlightInHome
    ? "✨ This product will be featured in Our Curated Collection on the home page"
    : highlightCount >= 4
    ? "⚠️ Maximum 4 products can be highlighted. Remove highlighting from another product first."
    : "💡 Feature this product in Our Curated Collection on the home page";

  const handleToFixed = (value: number) => {
    return !value ? 0 : typeof value === "string" ? parseInt(value) : value;
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form">
        <div className="product-form__header">
          <h2 className="product-form__title">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="product-form__close"
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="product-form__content"
        >
          {/* Basic Information - same as before */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">Basic Information</h3>

            <Input
              label="Product Name"
              error={errors.name?.message}
              {...register("name", { required: "Product name is required" })}
            />

            <div className="form-group">
              <label className="form-group__label">Description</label>
              <textarea
                className="form-group__input form-group__textarea"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <span className="form-group__error">
                  {errors.description.message}
                </span>
              )}
            </div>

            <Input
              label="Category"
              error={errors.category?.message}
              {...register("category", { required: "Category is required" })}
            />
          </div>

          {/* Pricing Section - same as before */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">Pricing</h3>

            <div className="product-form__row">
              <Input
                label="Actual Price (₹)"
                type="number"
                step="0.01"
                error={errors.actual_price?.message}
                {...register("actual_price", {
                  required: "Actual price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />

              <Input
                label="Discounted Price (₹)"
                type="number"
                step="0.01"
                error={errors.discounted_price?.message}
                {...register("discounted_price", {
                  required: "Discounted price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                  validate: (value) =>
                    value <= watchActualPrice ||
                    "Discounted price cannot be higher than actual price",
                })}
              />
            </div>

            {/* Pricing Preview */}
            <div className="pricing-preview">
              <h4>Customer will see:</h4>
              <div className="pricing-preview__display">
                {discountPercentage > 0 ? (
                  <>
                    <span className="pricing-preview__actual">
                      ₹{watchActualPrice?.toFixed(0)}
                    </span>
                    <span className="pricing-preview__discounted">
                      ₹{watchDiscountedPrice?.toFixed(0)}
                    </span>
                    <span className="pricing-preview__discount">
                      ({discountPercentage}% off)
                    </span>
                  </>
                ) : (
                  <span className="pricing-preview__single">
                    ₹{watchDiscountedPrice?.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stock Management - same as before */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">Stock Management</h3>

            <div className="stock-management">
              <div className="stock-management__toggles">
                <Controller
                  name="can_do_bulk"
                  control={control}
                  render={({ field }) => (
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="toggle-input"
                      />
                      <span className="toggle-text">
                        Enable Bulk Orders
                        <small>
                          When enabled, stock quantity is ignored and only
                          availability matters
                        </small>
                      </span>
                    </label>
                  )}
                />

                <Controller
                  name="in_stock"
                  control={control}
                  render={({ field }) => (
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={watchCanDoBulk}
                        className="toggle-input"
                      />
                      <span className="toggle-text">
                        Product Available
                        {watchCanDoBulk && (
                          <small>Auto-enabled for bulk orders</small>
                        )}
                      </span>
                    </label>
                  )}
                />
              </div>

              {!watchCanDoBulk && (
                <Input
                  label="Stock Quantity"
                  type="number"
                  disabled={!watchInStock}
                  error={errors.stock_quantity?.message}
                  {...register("stock_quantity", {
                    required: !watchCanDoBulk
                      ? "Stock quantity is required"
                      : false,
                    min: { value: 0, message: "Stock must be non-negative" },
                  })}
                />
              )}

              <div className="stock-status-info">
                <h4>Customer will see:</h4>
                <div
                  className={`status-preview ${
                    !watchInStock
                      ? "status-preview--out-of-stock"
                      : watchCanDoBulk
                      ? "status-preview--bulk"
                      : "status-preview--in-stock"
                  }`}
                >
                  {!watchInStock ? (
                    <span>🔴 Out of Stock</span>
                  ) : watchCanDoBulk ? (
                    <span>🟢 Available for Bulk Orders</span>
                  ) : (
                    <span>🟢 {watch("stock_quantity")} units available</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Sets Section - FIXED */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">
              Set Pricing (Bulk Discounts)
            </h3>
            <p className="product-form__section-description">
              Create pricing for different quantities. Customers get additional
              discounts when buying in sets.
            </p>

            <div className="price-sets">
              {priceSetFields.map((field, index) => (
                <div key={field.id} className="price-set">
                  <h4>Set {index + 1}</h4>
                  <div className="price-set__row">
                    <Input
                      label="Quantity"
                      type="number"
                      min="2"
                      {...register(
                        `price_sets.${index}.set_quantity` as const,
                        {
                          required: "Quantity is required",
                          min: {
                            value: 2,
                            message: "Minimum set quantity is 2",
                          },
                        }
                      )}
                      error={errors.price_sets?.[index]?.set_quantity?.message}
                    />
                    <Input
                      label="Actual Price (₹)"
                      type="number"
                      step="0.01"
                      {...register(
                        `price_sets.${index}.actual_price` as const,
                        {
                          required: "Actual price is required",
                          min: {
                            value: 0.01,
                            message: "Price must be positive",
                          },
                        }
                      )}
                      error={errors.price_sets?.[index]?.actual_price?.message}
                    />
                    <Input
                      label="Discounted Price (₹)"
                      type="number"
                      step="0.01"
                      {...register(
                        `price_sets.${index}.discounted_price` as const,
                        {
                          required: "Discounted price is required",
                          min: {
                            value: 0.01,
                            message: "Price must be positive",
                          },
                        }
                      )}
                      error={
                        errors.price_sets?.[index]?.discounted_price?.message
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removePriceSet(index)}
                      className="price-set__remove"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="price-set__preview">
                    {watch(`price_sets.${index}.actual_price` as const) &&
                      watch(
                        `price_sets.${index}.discounted_price` as const
                      ) && (
                        <span className="price-set__preview-text">
                          Set of{" "}
                          {watch(`price_sets.${index}.set_quantity` as const)}:
                          <span className="actual-price">
                            ₹
                            {handleToFixed(
                              watch(`price_sets.${index}.actual_price` as const)
                            )}
                          </span>
                          <span className="discounted-price">
                            ₹
                            {handleToFixed(
                              watch(
                                `price_sets.${index}.discounted_price` as const
                              )
                            )}
                          </span>
                          {productService.calculateDiscountPercentage(
                            watch(
                              `price_sets.${index}.actual_price` as const
                            ) || 0,
                            watch(
                              `price_sets.${index}.discounted_price` as const
                            ) || 0
                          ) > 0 && (
                            <span className="discount">
                              (
                              {productService.calculateDiscountPercentage(
                                watch(
                                  `price_sets.${index}.actual_price` as const
                                ) || 0,
                                watch(
                                  `price_sets.${index}.discounted_price` as const
                                ) || 0
                              )}
                              % off)
                            </span>
                          )}
                        </span>
                      )}
                  </div>
                </div>
              ))}

              {priceSetFields.length < 5 && (
                <Button
                  type="button"
                  onClick={addPriceSet}
                  variant="secondary"
                  size="sm"
                >
                  + Add Price Set ({priceSetFields.length}/5)
                </Button>
              )}
            </div>
          </div>
          {/* Highlighting Section */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">Featured Product</h3>

            <Controller
              name="highlight_in_home"
              control={control}
              render={({ field }) => (
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={!canHighlight && !field.value}
                    className="toggle-input"
                  />
                  <span className="toggle-text">
                    Feature in Our Curated Collection
                    <small
                      className={`highlight-message ${
                        watchHighlightInHome
                          ? "highlight-message--active"
                          : highlightCount >= 4
                          ? "highlight-message--warning"
                          : "highlight-message--info"
                      }`}
                    >
                      {highlightMessage}
                    </small>
                  </span>
                </label>
              )}
            />
          </div>

          {/* Characteristics Section */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">
              Product Characteristics
            </h3>

            <div className="product-form__row">
              <MultiSelect
                label="Scents"
                options={groupedScents}
                selected={stringToArray(watch("scent"))}
                onChange={(selectedScents) => {
                  setValue("scent", arrayToString(selectedScents));
                }}
                placeholder="Select scents..."
                error={errors.scent?.message}
                maxHeight="300px"
              />

              <Input
                label="Burn Time"
                placeholder="e.g., 40 hours"
                {...register("burn_time")}
                error={errors.burn_time?.message}
              />
            </div>

            <div className="product-form__row">
              <MultiSelect
                label="Colors"
                options={groupedColors}
                selected={stringToArray(watch("colors"))}
                onChange={(selectedColors) => {
                  setValue("colors", arrayToString(selectedColors));
                }}
                placeholder="Select colors..."
                error={errors.colors?.message}
                colorMap={colorHexMap}
                showVisualIndicators={true}
                maxHeight="300px"
              />

              <Input
                label="Dimensions"
                placeholder="e.g., 8cm x 8cm x 10cm"
                {...register("dimensions")}
                error={errors.dimensions?.message}
              />
            </div>

            <Input
              label="Instagram Media ID"
              placeholder="Optional: Link to Instagram post"
              {...register("instagram_media_id")}
              error={errors.instagram_media_id?.message}
            />
          </div>

          {/* Image Upload Section */}
          <div className="product-form__section">
            <h3 className="product-form__section-title">Product Images</h3>
            
            <div className="image-upload">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="image-upload__input"
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add Images'}
              </Button>
              <p className="image-upload__hint">
                Upload multiple images. First image will be the main product image.
              </p>
              
              {/* Upload Progress */}
              {uploading && Object.keys(uploadProgress).length > 0 && (
                <div className="upload-progress">
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="upload-progress__item">
                      <span>{fileName}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar__fill" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span>{progress}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="image-preview">
                <h4>Uploaded Images</h4>
                <div className="image-preview__grid">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview__item">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="image-preview__img"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="image-preview__remove"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="image-preview__main-badge">Main Image</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="product-form__actions">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
