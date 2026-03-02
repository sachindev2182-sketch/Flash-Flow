import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface DashboardData {
  totalUsers: number;
  active7Days: number;
  newWeek: number;
  verified: number;
  unverified: number;
  dailyUsers: Array<{ _id: string; count: number }>;
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;