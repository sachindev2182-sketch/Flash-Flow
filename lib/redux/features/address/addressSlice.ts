import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Address {
  _id: string;
  userId: string;
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

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  operationLoading: false,
  error: null,
  success: false,
};

// Fetch all addresses for user
export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/address', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch addresses');
      }

      const data = await response.json();
      return data.addresses;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch addresses');
    }
  }
);

// Add new address
export const addAddress = createAsyncThunk(
  'address/add',
  async (addressData: Omit<Address, '_id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add address');
      }

      const data = await response.json();
      return data.address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add address');
    }
  }
);

// Update address
export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ addressId, addressData }: { addressId: string; addressData: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update address');
      }

      const data = await response.json();
      return data.address;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update address');
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/address/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete address');
      }

      return addressId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete address');
    }
  }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
  'address/setDefault',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/address/${addressId}/default`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default address');
      }

      const data = await response.json();
      return data.addresses;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to set default address');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add address
      .addCase(addAddress.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.addresses.push(action.payload);
        state.success = true;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.addresses.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.addresses = state.addresses.filter(a => a._id !== action.payload);
        if (state.selectedAddress?._id === action.payload) {
          state.selectedAddress = null;
        }
        state.success = true;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Set default address
      .addCase(setDefaultAddress.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.addresses = action.payload;
        state.success = true;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAddress, clearError, clearSuccess } = addressSlice.actions;
export default addressSlice.reducer;