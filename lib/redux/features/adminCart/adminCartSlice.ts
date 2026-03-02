import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AdminCartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  size?: string;
  category: string;
  addedAt: string;
}

export interface AdminCart {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: AdminCartItem[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartStats {
  totalCarts: number;
  totalItemsInCarts: number;
  totalCartValue: number;
  averageCartValue: number;
  itemsPerCart: number;
  abandonedCarts: number;
  activeCarts: number;
  categoryDistribution: Record<string, number>;
}

interface AdminCartState {
  carts: AdminCart[];
  filteredCarts: AdminCart[];
  selectedCart: AdminCart | null;
  stats: CartStats;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterBy: 'all' | 'user' | 'category';
  filterValue: string;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialStats: CartStats = {
  totalCarts: 0,
  totalItemsInCarts: 0,
  totalCartValue: 0,
  averageCartValue: 0,
  itemsPerCart: 0,
  abandonedCarts: 0,
  activeCarts: 0,
  categoryDistribution: {},
};

const initialState: AdminCartState = {
  carts: [],
  filteredCarts: [],
  selectedCart: null,
  stats: initialStats,
  loading: false,
  error: null,
  searchTerm: '',
  filterBy: 'all',
  filterValue: '',
  sortBy: 'newest',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

// Fetch all carts with pagination and filters
export const fetchAllCarts = createAsyncThunk(
  'adminCart/fetchAll',
  async ({ 
    page = 1, 
    limit = 10, 
    search = '', 
    filterBy = 'all', 
    filterValue = '',
    sortBy = 'newest' 
  }: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    filterBy?: string; 
    filterValue?: string;
    sortBy?: string;
  }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (filterBy && filterBy !== 'all') params.append('filterBy', filterBy);
      if (filterValue) params.append('filterValue', filterValue);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/admin/carts?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch carts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch carts');
    }
  }
);

// Fetch single cart by ID
export const fetchCartById = createAsyncThunk(
  'adminCart/fetchById',
  async (cartId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/carts/${cartId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart');
    }
  }
);

// Fetch cart statistics
export const fetchCartStats = createAsyncThunk(
  'adminCart/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/carts/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch cart stats');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart stats');
    }
  }
);

const adminCartSlice = createSlice({
  name: 'adminCart',
  initialState,
  reducers: {
    setSelectedCart: (state, action: PayloadAction<AdminCart | null>) => {
      state.selectedCart = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilterBy: (state, action: PayloadAction<'all' | 'user' | 'category'>) => {
      state.filterBy = action.payload;
      state.filterValue = '';
    },
    setFilterValue: (state, action: PayloadAction<string>) => {
      state.filterValue = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'newest' | 'oldest' | 'highest' | 'lowest'>) => {
      state.sortBy = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.filterBy = 'all';
      state.filterValue = '';
      state.sortBy = 'newest';
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all carts
      .addCase(fetchAllCarts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCarts.fulfilled, (state, action) => {
        state.loading = false;
        state.carts = action.payload.carts;
        state.filteredCarts = action.payload.carts;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          pages: action.payload.pagination.pages,
        };
      })
      .addCase(fetchAllCarts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single cart
      .addCase(fetchCartById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCart = action.payload;
      })
      .addCase(fetchCartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch cart stats
      .addCase(fetchCartStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setSelectedCart, 
  setSearchTerm, 
  setFilterBy, 
  setFilterValue, 
  setSortBy, 
  setPage, 
  clearError,
  resetFilters 
} = adminCartSlice.actions;

export default adminCartSlice.reducer;