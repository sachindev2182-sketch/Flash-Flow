import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface AdminReview {
  _id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalProductsWithReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface AdminReviewsState {
  reviews: AdminReview[];
  filteredReviews: AdminReview[];
  selectedReview: AdminReview | null;
  stats: ReviewStats;
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
  searchTerm: string;
  filterBy: "all" | "product" | "user";
  filterValue: string;
  sortBy: "newest" | "oldest" | "highest" | "lowest";
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialStats: ReviewStats = {
  totalReviews: 0,
  averageRating: 0,
  totalProductsWithReviews: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const initialState: AdminReviewsState = {
  reviews: [],
  filteredReviews: [],
  selectedReview: null,
  stats: initialStats,
  loading: false,
  operationLoading: false,
  error: null,
  searchTerm: "",
  filterBy: "all",
  filterValue: "",
  sortBy: "newest",
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

// Fetch all reviews with pagination and filters
export const fetchAllReviews = createAsyncThunk(
  "adminReviews/fetchAll",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      filterBy = "all",
      filterValue = "",
      sortBy = "newest",
    }: {
      page?: number;
      limit?: number;
      search?: string;
      filterBy?: string;
      filterValue?: string;
      sortBy?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (filterBy && filterBy !== "all") params.append("filterBy", filterBy);
      if (filterValue) params.append("filterValue", filterValue);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch reviews");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch reviews",
      );
    }
  },
);

// Fetch single review by ID
export const fetchReviewById = createAsyncThunk(
  "adminReviews/fetchById",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch review");
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch review",
      );
    }
  },
);

// Update review
export const updateReview = createAsyncThunk(
  "adminReviews/update",
  async (
    {
      reviewId,
      data,
    }: { reviewId: string; data: { rating?: number; comment?: string } },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update review");
      }

      const result = await response.json();
      return result.review;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update review",
      );
    }
  },
);

// Delete review
export const deleteReview = createAsyncThunk(
  "adminReviews/delete",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete review");
      }

      const data = await response.json();
      return { reviewId, message: data.message };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete review",
      );
    }
  },
);

// Bulk delete reviews
export const bulkDeleteReviews = createAsyncThunk(
  "adminReviews/bulkDelete",
  async (reviewIds: string[], { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/reviews/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reviewIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete reviews");
      }

      const data = await response.json();
      return {
        reviewIds,
        deletedCount: data.deletedCount,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete reviews",
      );
    }
  },
);
// Get review statistics
export const fetchReviewStats = createAsyncThunk(
  "adminReviews/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/reviews/stats", {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch review stats");
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch review stats",
      );
    }
  },
);

const adminReviewsSlice = createSlice({
  name: "adminReviews",
  initialState,
  reducers: {
    setSelectedReview: (state, action: PayloadAction<AdminReview | null>) => {
      state.selectedReview = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilterBy: (state, action: PayloadAction<"all" | "product" | "user">) => {
      state.filterBy = action.payload;
      state.filterValue = "";
    },
    setFilterValue: (state, action: PayloadAction<string>) => {
      state.filterValue = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<"newest" | "oldest" | "highest" | "lowest">,
    ) => {
      state.sortBy = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.searchTerm = "";
      state.filterBy = "all";
      state.filterValue = "";
      state.sortBy = "newest";
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.filteredReviews = action.payload.reviews;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          pages: action.payload.pagination.pages,
        };
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single review
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.reviews.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload;
          state.filteredReviews[index] = action.payload;
        }
        state.selectedReview = action.payload;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.reviews = state.reviews.filter(
          (r) => r._id !== action.payload.reviewId,
        );
        state.filteredReviews = state.filteredReviews.filter(
          (r) => r._id !== action.payload.reviewId,
        );
        if (state.selectedReview?._id === action.payload.reviewId) {
          state.selectedReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Bulk delete reviews
      .addCase(bulkDeleteReviews.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteReviews.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.reviews = state.reviews.filter(
          (r) => !action.payload.reviewIds.includes(r._id),
        );
        state.filteredReviews = state.filteredReviews.filter(
          (r) => !action.payload.reviewIds.includes(r._id),
        );
      })
      .addCase(bulkDeleteReviews.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Fetch review stats
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  setSelectedReview,
  setSearchTerm,
  setFilterBy,
  setFilterValue,
  setSortBy,
  setPage,
  clearError,
  resetFilters,
} = adminReviewsSlice.actions;

export default adminReviewsSlice.reducer;
