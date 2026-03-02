import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isNewArrival: boolean;
  isTrending: boolean;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductsState {
  products: Product[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
}

const initialState: ProductsState = {
  products: [],
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    pages: 1,
  },
  loading: false,
  error: null,
  operationLoading: false,
};

interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const fetchAdminProducts = createAsyncThunk(
  'productsAdmin/fetch',
  async (params: FetchProductsParams, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.category && params.category !== 'all') searchParams.append('category', params.category);
      if (params.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/admin/products?${searchParams}`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

export const createProduct = createAsyncThunk(
  'productsAdmin/create',
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }
      
      const data = await response.json();
      return data.product;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'productsAdmin/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }
      
      const result = await response.json();
      return result.product;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'productsAdmin/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete');
    }
  }
);

const productsAdminSlice = createSlice({
  name: 'productsAdmin',
  initialState,
  reducers: {
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.operationLoading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
        state.pagination.total -= 1;
        state.pagination.pages = Math.ceil(state.pagination.total / state.pagination.limit);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPagination, clearProductsError } = productsAdminSlice.actions;
export default productsAdminSlice.reducer;