import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsState {
  reviews: Review[];
  userReview: Review | null;
  stats: ReviewStats;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  submitSuccess: boolean;
}

const initialStats: ReviewStats = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const initialState: ReviewsState = {
  reviews: [],
  userReview: null,
  stats: initialStats,
  loading: false,
  submitting: false,
  error: null,
  submitSuccess: false,
};

// Fetch reviews for a product
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch reviews');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch reviews');
    }
  }
);

// Fetch user's review for a product
export const fetchUserReview = createAsyncThunk(
  'reviews/fetchUserReview',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews/user`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No review found
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user review');
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user review');
    }
  }
);

// Submit a review
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit review');
    }
  }
);

// Update a review
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, rating, comment }: { reviewId: string; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      const data = await response.json();
      return data.review;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update review');
    }
  }
);

// Delete a review
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      return reviewId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete review');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.userReview = null;
      state.stats = initialStats;
      state.error = null;
      state.submitSuccess = false;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = action.payload.stats;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user review
      .addCase(fetchUserReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReview = action.payload;
      })
      .addCase(fetchUserReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.userReview = action.payload;
        state.submitSuccess = true;
        // Add the new review to the list
        state.reviews = [action.payload, ...state.reviews];
        // Update stats
        state.stats.totalReviews += 1;
        state.stats.averageRating = 
          (state.stats.averageRating * (state.stats.totalReviews - 1) + action.payload.rating) / 
          state.stats.totalReviews;
        state.stats.ratingDistribution[action.payload.rating as keyof typeof state.stats.ratingDistribution] += 1;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
        state.submitSuccess = false;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.userReview = action.payload;
        state.submitSuccess = true;
        // Update the review in the list
        const index = state.reviews.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        // Recalculate stats
        const total = state.reviews.reduce((sum, r) => sum + r.rating, 0);
        state.stats.averageRating = total / state.reviews.length;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.userReview = null;
        state.submitSuccess = true;
        // Remove the review from the list
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        // Recalculate stats
        if (state.reviews.length > 0) {
          const total = state.reviews.reduce((sum, r) => sum + r.rating, 0);
          state.stats.averageRating = total / state.reviews.length;
        } else {
          state.stats.averageRating = 0;
        }
        state.stats.totalReviews = state.reviews.length;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReviews, clearSubmitSuccess, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;