export const categorySubcategories = {
  men: ["Clothing", "Footwear", "Sports", "Accessories"],
  women: ["Clothing", "Footwear", "Accessories", "Jewelery", "Beauty"],
  kids: ["Boys", "Girls", "Footwear", "Toys"],
  home: ["Home decor", "Furnishing", "Kitchen", "Groceries", "Electronics", "Gadgets", "Books"],
  beauty: ["Makeup", "Skincare", "Haircare", "Fragrance"],
};

export function isValidSubcategory(category: string, subcategory: string): boolean {
  const validSubcategories = categorySubcategories[category as keyof typeof categorySubcategories];
  return validSubcategories ? validSubcategories.includes(subcategory) : false;
}

export function getSubcategories(category: string): string[] {
  return categorySubcategories[category as keyof typeof categorySubcategories] || [];
}

export type Category = keyof typeof categorySubcategories;
export type Subcategory<T extends Category> = typeof categorySubcategories[T][number];