import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AdminAddress {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface AddressStats {
  totalAddresses: number;
  totalUsersWithAddresses: number;
  homeAddresses: number;
  workAddresses: number;
  otherAddresses: number;
  defaultAddresses: number;
}

interface AdminAddressesState {
  addresses: AdminAddress[];
  filteredAddresses: AdminAddress[];
  selectedAddress: AdminAddress | null;
  stats: AddressStats;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterBy: 'all' | 'user' | 'city' | 'state' | 'type';
  filterValue: string;
  sortBy: 'newest' | 'oldest' | 'name' | 'city';
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialStats: AddressStats = {
  totalAddresses: 0,
  totalUsersWithAddresses: 0,
  homeAddresses: 0,
  workAddresses: 0,
  otherAddresses: 0,
  defaultAddresses: 0,
};

const initialState: AdminAddressesState = {
  addresses: [],
  filteredAddresses: [],
  selectedAddress: null,
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

// Fetch all addresses with pagination and filters
export const fetchAllAddresses = createAsyncThunk(
  'adminAddresses/fetchAll',
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

      const response = await fetch(`/api/admin/addresses?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch addresses');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch addresses');
    }
  }
);

// Fetch single address by ID
export const fetchAddressById = createAsyncThunk(
  'adminAddresses/fetchById',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/addresses/${addressId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch address');
      }

      const data = await response.json();
      return data.address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch address');
    }
  }
);

// Fetch address statistics
export const fetchAddressStats = createAsyncThunk(
  'adminAddresses/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/addresses/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch address stats');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch address stats');
    }
  }
);

const adminAddressesSlice = createSlice({
  name: 'adminAddresses',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<AdminAddress | null>) => {
      state.selectedAddress = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilterBy: (state, action: PayloadAction<'all' | 'user' | 'city' | 'state' | 'type'>) => {
      state.filterBy = action.payload;
      state.filterValue = '';
    },
    setFilterValue: (state, action: PayloadAction<string>) => {
      state.filterValue = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'newest' | 'oldest' | 'name' | 'city'>) => {
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
      // Fetch all addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses;
        state.filteredAddresses = action.payload.addresses;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          pages: action.payload.pagination.pages,
        };
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single address
      .addCase(fetchAddressById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAddress = action.payload;
      })
      .addCase(fetchAddressById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch address stats
      .addCase(fetchAddressStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  setSelectedAddress, 
  setSearchTerm, 
  setFilterBy, 
  setFilterValue, 
  setSortBy, 
  setPage, 
  clearError,
  resetFilters 
} = adminAddressesSlice.actions;

export default adminAddressesSlice.reducer;