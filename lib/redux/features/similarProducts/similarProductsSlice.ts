import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface SimilarProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface SimilarProductsState {
  products: SimilarProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: SimilarProductsState = {
  products: [],
  loading: false,
  error: null,
};

// Fetch similar products by category (excluding current product)
export const fetchSimilarProducts = createAsyncThunk(
  'similarProducts/fetchByCategory',
  async ({ category, currentProductId, limit = 5 }: { category: string; currentProductId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/products/similar?category=${category}&currentProductId=${currentProductId}&limit=${limit}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch similar products');
      }

      const data = await response.json();
      return data.products;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch similar products');
    }
  }
);

const similarProductsSlice = createSlice({
  name: 'similarProducts',
  initialState,
  reducers: {
    clearSimilarProducts: (state) => {
      state.products = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action: PayloadAction<SimilarProduct[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSimilarProducts } = similarProductsSlice.actions;
export default similarProductsSlice.reducer;