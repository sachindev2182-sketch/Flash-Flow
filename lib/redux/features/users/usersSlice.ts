import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  operationLoading: boolean;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  operationLoading: false,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }: { id: string; data: { name: string; role: string; isVerified: boolean } }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      
      const result = await response.json();
      return result.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.operationLoading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.operationLoading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;