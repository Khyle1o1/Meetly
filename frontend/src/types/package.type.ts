export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  inclusions?: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageData {
  name: string;
  description?: string;
  price: number;
  duration?: string;
  inclusions?: string;
  imageUrl?: string;
  icon?: string;
  isRecommended?: boolean;
}

export interface UpdatePackageData {
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  inclusions?: string;
  imageUrl?: string;
  icon?: string;
  isActive?: boolean;
  isRecommended?: boolean;
}

export interface PackageResponse {
  message: string;
  packages: Package[];
}

export interface SinglePackageResponse {
  message: string;
  package: Package;
} 