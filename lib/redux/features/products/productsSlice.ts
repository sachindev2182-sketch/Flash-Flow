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
}

interface ProductsState {
  menProducts: Product[];
  womenProducts: Product[];
  beautyProducts: Product[];
  loading: {
    men: boolean;
    women: boolean;
    beauty: boolean;
  };
  error: {
    men: string | null;
    women: string | null;
    beauty: string | null;
  };
}

const initialState: ProductsState = {
  menProducts: [],
  womenProducts: [],
  beautyProducts: [],
  loading: {
    men: false,
    women: false,
    beauty: false,
  },
  error: {
    men: null,
    women: null,
    beauty: null,
  },
};

// Async thunks for fetching products by category
export const fetchMenProducts = createAsyncThunk(
  'products/fetchMen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/products?category=men&limit=5');
      if (!response.ok) throw new Error('Failed to fetch men products');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

export const fetchWomenProducts = createAsyncThunk(
  'products/fetchWomen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/products?category=women&limit=5');
      if (!response.ok) throw new Error('Failed to fetch women products');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

export const fetchBeautyProducts = createAsyncThunk(
  'products/fetchBeauty',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/products?category=beauty&limit=5');
      if (!response.ok) throw new Error('Failed to fetch beauty products');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Men Products
      .addCase(fetchMenProducts.pending, (state) => {
        state.loading.men = true;
        state.error.men = null;
      })
      .addCase(fetchMenProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading.men = false;
        state.menProducts = action.payload;
      })
      .addCase(fetchMenProducts.rejected, (state, action) => {
        state.loading.men = false;
        state.error.men = action.payload as string;
      })
      
      // Women Products
      .addCase(fetchWomenProducts.pending, (state) => {
        state.loading.women = true;
        state.error.women = null;
      })
      .addCase(fetchWomenProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading.women = false;
        state.womenProducts = action.payload;
      })
      .addCase(fetchWomenProducts.rejected, (state, action) => {
        state.loading.women = false;
        state.error.women = action.payload as string;
      })
      
      // Beauty Products
      .addCase(fetchBeautyProducts.pending, (state) => {
        state.loading.beauty = true;
        state.error.beauty = null;
      })
      .addCase(fetchBeautyProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading.beauty = false;
        state.beautyProducts = action.payload;
      })
      .addCase(fetchBeautyProducts.rejected, (state, action) => {
        state.loading.beauty = false;
        state.error.beauty = action.payload as string;
      });
  },
});

export default productsSlice.reducer;