import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CategoryProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  isNew: boolean;
  isTrending: boolean;
}

interface CategoryProductsState {
  menProducts: CategoryProduct[];
  womenProducts: CategoryProduct[];
  beautyProducts: CategoryProduct[];
  kidsProducts: CategoryProduct[];
  homeProducts: CategoryProduct[];
  
  menPagination: {
    page: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
  };
  
  womenPagination: {
    page: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
  };
  
  beautyPagination: {
    page: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
  };
  
  kidsPagination: {
    page: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
  };
  
  homePagination: {
    page: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
  };
  
  loading: {
    men: boolean;
    women: boolean;
    beauty: boolean;
    kids: boolean;
    home: boolean;
  };
  
  error: {
    men: string | null;
    women: string | null;
    beauty: string | null;
    kids: string | null;
    home: string | null;
  };
}

const initialState: CategoryProductsState = {
  menProducts: [],
  womenProducts: [],
  beautyProducts: [],
  kidsProducts: [],
  homeProducts: [],
  
  menPagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 10,
  },
  
  womenPagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 10,
  },
  
  beautyPagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 10,
  },
  
  kidsPagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 10,
  },
  
  homePagination: {
    page: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 10,
  },
  
  loading: {
    men: false,
    women: false,
    beauty: false,
    kids: false,
    home: false,
  },
  
  error: {
    men: null,
    women: null,
    beauty: null,
    kids: null,
    home: null,
  },
};

// Fetch men products with pagination
export const fetchMenCategoryProducts = createAsyncThunk(
  'categoryProducts/fetchMen',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products?category=men&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch men products');
      }
      
      const data = await response.json();
      return {
        products: data.products,
        pagination: data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch men products');
    }
  }
);

// Fetch women products with pagination
export const fetchWomenCategoryProducts = createAsyncThunk(
  'categoryProducts/fetchWomen',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products?category=women&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch women products');
      }
      
      const data = await response.json();
      return {
        products: data.products,
        pagination: data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch women products');
    }
  }
);

// Fetch beauty products with pagination
export const fetchBeautyCategoryProducts = createAsyncThunk(
  'categoryProducts/fetchBeauty',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products?category=beauty&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch beauty products');
      }
      
      const data = await response.json();
      return {
        products: data.products,
        pagination: data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch beauty products');
    }
  }
);

// Fetch kids products with pagination
export const fetchKidsCategoryProducts = createAsyncThunk(
  'categoryProducts/fetchKids',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products?category=kids&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch kids products');
      }
      
      const data = await response.json();
      return {
        products: data.products,
        pagination: data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch kids products');
    }
  }
);

// Fetch home products with pagination
export const fetchHomeCategoryProducts = createAsyncThunk(
  'categoryProducts/fetchHome',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products?category=home&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch home products');
      }
      
      const data = await response.json();
      return {
        products: data.products,
        pagination: data.pagination
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch home products');
    }
  }
);

const categoryProductsSlice = createSlice({
  name: 'categoryProducts',
  initialState,
  reducers: {
    setMenPage: (state, action: PayloadAction<number>) => {
      state.menPagination.page = action.payload;
    },
    setWomenPage: (state, action: PayloadAction<number>) => {
      state.womenPagination.page = action.payload;
    },
    setBeautyPage: (state, action: PayloadAction<number>) => {
      state.beautyPagination.page = action.payload;
    },
    setKidsPage: (state, action: PayloadAction<number>) => {
      state.kidsPagination.page = action.payload;
    },
    setHomePage: (state, action: PayloadAction<number>) => {
      state.homePagination.page = action.payload;
    },
    clearMenProducts: (state) => {
      state.menProducts = [];
      state.menPagination = {
        page: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 10,
      };
    },
    clearWomenProducts: (state) => {
      state.womenProducts = [];
      state.womenPagination = {
        page: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 10,
      };
    },
    clearBeautyProducts: (state) => {
      state.beautyProducts = [];
      state.beautyPagination = {
        page: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 10,
      };
    },
    clearKidsProducts: (state) => {
      state.kidsProducts = [];
      state.kidsPagination = {
        page: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 10,
      };
    },
    clearHomeProducts: (state) => {
      state.homeProducts = [];
      state.homePagination = {
        page: 1,
        totalPages: 1,
        totalProducts: 0,
        productsPerPage: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Men Products
      .addCase(fetchMenCategoryProducts.pending, (state) => {
        state.loading.men = true;
        state.error.men = null;
      })
      .addCase(fetchMenCategoryProducts.fulfilled, (state, action) => {
        state.loading.men = false;
        state.menProducts = action.payload.products;
        state.menPagination = {
          page: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalProducts: action.payload.pagination.total,
          productsPerPage: action.payload.pagination.limit,
        };
      })
      .addCase(fetchMenCategoryProducts.rejected, (state, action) => {
        state.loading.men = false;
        state.error.men = action.payload as string;
      })
      
      // Women Products
      .addCase(fetchWomenCategoryProducts.pending, (state) => {
        state.loading.women = true;
        state.error.women = null;
      })
      .addCase(fetchWomenCategoryProducts.fulfilled, (state, action) => {
        state.loading.women = false;
        state.womenProducts = action.payload.products;
        state.womenPagination = {
          page: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalProducts: action.payload.pagination.total,
          productsPerPage: action.payload.pagination.limit,
        };
      })
      .addCase(fetchWomenCategoryProducts.rejected, (state, action) => {
        state.loading.women = false;
        state.error.women = action.payload as string;
      })
      
      // Beauty Products
      .addCase(fetchBeautyCategoryProducts.pending, (state) => {
        state.loading.beauty = true;
        state.error.beauty = null;
      })
      .addCase(fetchBeautyCategoryProducts.fulfilled, (state, action) => {
        state.loading.beauty = false;
        state.beautyProducts = action.payload.products;
        state.beautyPagination = {
          page: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalProducts: action.payload.pagination.total,
          productsPerPage: action.payload.pagination.limit,
        };
      })
      .addCase(fetchBeautyCategoryProducts.rejected, (state, action) => {
        state.loading.beauty = false;
        state.error.beauty = action.payload as string;
      })
      
      // Kids Products
      .addCase(fetchKidsCategoryProducts.pending, (state) => {
        state.loading.kids = true;  
        state.error.kids = null;
      })
      .addCase(fetchKidsCategoryProducts.fulfilled, (state, action) => {
        state.loading.kids = false;
        state.kidsProducts = action.payload.products;
        state.kidsPagination = {
          page: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalProducts: action.payload.pagination.total,
          productsPerPage: action.payload.pagination.limit,
        };
      })
      .addCase(fetchKidsCategoryProducts.rejected, (state, action) => {
        state.loading.kids = false;
        state.error.kids = action.payload as string;
      })
      
      // Home Products
      .addCase(fetchHomeCategoryProducts.pending, (state) => {
        state.loading.home = true;
        state.error.home = null;
      })
      .addCase(fetchHomeCategoryProducts.fulfilled, (state, action) => {
        state.loading.home = false;
        state.homeProducts = action.payload.products;
        state.homePagination = {
          page: action.payload.pagination.page,
          totalPages: action.payload.pagination.pages,
          totalProducts: action.payload.pagination.total,
          productsPerPage: action.payload.pagination.limit,
        };
      })
      .addCase(fetchHomeCategoryProducts.rejected, (state, action) => {
        state.loading.home = false;
        state.error.home = action.payload as string;
      });
  },
});

export const { 
  setMenPage, 
  setWomenPage, 
  setBeautyPage, 
  setKidsPage, 
  setHomePage, 
  clearMenProducts, 
  clearWomenProducts, 
  clearBeautyProducts, 
  clearKidsProducts, 
  clearHomeProducts 
} = categoryProductsSlice.actions;

export default categoryProductsSlice.reducer;