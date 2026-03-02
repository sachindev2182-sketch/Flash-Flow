import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AdminWishlistItem {
  productId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  addedAt: string;
}

export interface AdminWishlist {
  userId: string;
  userName: string;
  userEmail: string;
  items: AdminWishlistItem[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminWishlistsState {
  wishlists: AdminWishlist[];
  filteredWishlists: AdminWishlist[];
  loading: boolean;
  error: string | null;
  selectedWishlist: AdminWishlist | null;
  searchTerm: string;
  userFilter: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: AdminWishlistsState = {
  wishlists: [],
  filteredWishlists: [],
  loading: false,
  error: null,
  selectedWishlist: null,
  searchTerm: '',
  userFilter: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

// Fetch all wishlists (admin only)
export const fetchAllWishlists = createAsyncThunk(
  'adminWishlists/fetchAll',
  async ({ page = 1, limit = 10, search = '', user = '' }: { page?: number; limit?: number; search?: string; user?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (user) params.append('user', user);

      const response = await fetch(`/api/admin/wishlists?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch wishlists');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch wishlists');
    }
  }
);

// Fetch single wishlist by user ID
export const fetchWishlistByUserId = createAsyncThunk(
  'adminWishlists/fetchByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/wishlists/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch wishlist');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch wishlist');
    }
  }
);

// Clear all wishlists (admin only - optional feature)
export const clearAllWishlists = createAsyncThunk(
  'adminWishlists/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/wishlists/clear-all', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear wishlists');
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear wishlists');
    }
  }
);

const adminWishlistsSlice = createSlice({
  name: 'adminWishlists',
  initialState,
  reducers: {
    setSelectedWishlist: (state, action: PayloadAction<AdminWishlist | null>) => {
      state.selectedWishlist = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setUserFilter: (state, action: PayloadAction<string>) => {
      state.userFilter = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    filterWishlists: (state) => {
      let filtered = [...state.wishlists];
      
      // Filter by search term (product title or description)
      if (state.searchTerm) {
        filtered = filtered.filter(wishlist => 
          wishlist.items.some(item => 
            item.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(state.searchTerm.toLowerCase())
          )
        );
      }
      
      // Filter by user email/name
      if (state.userFilter) {
        filtered = filtered.filter(wishlist => 
          wishlist.userName.toLowerCase().includes(state.userFilter.toLowerCase()) ||
          wishlist.userEmail.toLowerCase().includes(state.userFilter.toLowerCase())
        );
      }
      
      state.filteredWishlists = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all wishlists
      .addCase(fetchAllWishlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWishlists.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlists = action.payload.wishlists;
        state.filteredWishlists = action.payload.wishlists;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          pages: action.payload.pagination.pages,
        };
      })
      .addCase(fetchAllWishlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single wishlist
      .addCase(fetchWishlistByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWishlist = action.payload;
      })
      .addCase(fetchWishlistByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Clear all wishlists
      .addCase(clearAllWishlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearAllWishlists.fulfilled, (state) => {
        state.loading = false;
        state.wishlists = [];
        state.filteredWishlists = [];
        state.pagination.total = 0;
        state.pagination.pages = 1;
      })
      .addCase(clearAllWishlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedWishlist, 
  setSearchTerm, 
  setUserFilter, 
  setPage, 
  clearError,
  filterWishlists 
} = adminWishlistsSlice.actions;

export default adminWishlistsSlice.reducer;