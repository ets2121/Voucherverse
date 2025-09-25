

export interface Business {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  email?: string;
  phone_number?: string;
  contact_person?: string;
  address?: string;
  social_links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProductRating {
  id: number;
  business_id: number;
  product_id: number;
  one_star: number;
  two_star: number;
  three_star: number;
  four_star: number;
  five_star: number;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: number;
  product_id: number;
  voucher_code?: string;
  is_promo: boolean;
  max_claims?: number;
  claimed_count: number;
  discount_amount?: number;
  description?: string;
  start_date: string;
  end_date: string;
  promo_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  business_id: number;
}

export interface ProductReview {
    id: number;
    business_id: number;
    product_id: number;
    email: string;
    review_rating: number;
    review: string;
    created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  business_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  resource_type: 'image' | 'video';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  business_id: number;
  name: string;
  image_url?: string | null; // Kept for potential fallback, but can be removed if fully migrated
  product_images: ProductImage[];
  price?: number;
  short_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id?: number;
  voucher: Voucher | null;
  product_ratings: ProductRating | null;
  product_category: ProductCategory | null;
  
}

export interface PromoClaim {
  id: number;
  voucher_id: number;
  user_email: string;
  claimed_at: string;
}

export interface Testimonial {
  id: number;
  business_id: number;
  customer_name?: string | null;
  customer_email: string;
  message: string;
  rating: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: number;
  business_id: number;
  email: string;
  created_at: string;
}

export interface BusinessService {
  id: number;
  business_id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PageData {
  business: Business;
  products: Product[];
  services: BusinessService[];
  testimonials: Testimonial[];
}
