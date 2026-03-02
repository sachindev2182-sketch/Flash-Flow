import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  productId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  size?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  selectedItems: string[]; // Array of productIds
  loading: boolean;
  operationLoading: boolean;
  error: string | null;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  selectedItems: [],
  loading: false,
  operationLoading: false,
  error: null,
  subtotal: 0,
  deliveryCharge: 0,
  total: 0,
};

// Fetch cart items
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
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

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/add',
  async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

// Update cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cart');
    }
  }
);

// Update cart item size
export const updateCartItemSize = createAsyncThunk(
  'cart/updateSize',
  async ({ productId, size }: { productId: string; size: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ size }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update size');
      }

      const data = await response.json();
      return data.cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update size');
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from cart');
      }

      return productId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove from cart');
    }
  }
);

// Move to wishlist
export const moveToWishlist = createAsyncThunk(
  'cart/moveToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${productId}/move-to-wishlist`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move to wishlist');
      }

      return productId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to move to wishlist');
    }
  }
);

// Select/Deselect items
export const toggleSelectItem = createAsyncThunk(
  'cart/toggleSelect',
  async ({ productId, selected }: { productId: string; selected: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId, selected }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update selection');
      }

      return { productId, selected };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update selection');
    }
  }
);

// Select all items
export const selectAllItems = createAsyncThunk(
  'cart/selectAll',
  async (selected: boolean, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/select-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ selected }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update selection');
      }

      return { selected };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update selection');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear cart');
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

const calculateTotals = (items: CartItem[], selectedIds: string[]) => {
  const selectedItems = items.filter(item => selectedIds.includes(item.productId));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 5000 ? 0 : 99;
  const total = subtotal + deliveryCharge;

  return { subtotal, deliveryCharge, total };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleSelectLocal: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (state.selectedItems.includes(productId)) {
        state.selectedItems = state.selectedItems.filter(id => id !== productId);
      } else {
        state.selectedItems.push(productId);
      }
      const { subtotal, deliveryCharge, total } = calculateTotals(state.items, state.selectedItems);
      state.subtotal = subtotal;
      state.deliveryCharge = deliveryCharge;
      state.total = total;
    },
    selectAllLocal: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedItems = state.items.map(item => item.productId);
      } else {
        state.selectedItems = [];
      }
      const { subtotal, deliveryCharge, total } = calculateTotals(state.items, state.selectedItems);
      state.subtotal = subtotal;
      state.deliveryCharge = deliveryCharge;
      state.total = total;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.selectedItems = action.payload.selectedItems || [];
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.items = action.payload.items || [];
        state.selectedItems = action.payload.selectedItems || [];
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload as string;
      })

      // Update quantity
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.selectedItems = action.payload.selectedItems || [];
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })

      // Update size
      .addCase(updateCartItemSize.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })

      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })

      // Move to wishlist
      .addCase(moveToWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.productId !== action.payload);
        state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })

      // Toggle select
      .addCase(toggleSelectItem.fulfilled, (state, action) => {
        const { productId, selected } = action.payload;
        if (selected) {
          if (!state.selectedItems.includes(productId)) {
            state.selectedItems.push(productId);
          }
        } else {
          state.selectedItems = state.selectedItems.filter(id => id !== productId);
        }
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })

      // Select all
      .addCase(selectAllItems.fulfilled, (state, action) => {
        const { selected } = action.payload;
        state.selectedItems = selected ? state.items.map(item => item.productId) : [];
        const { subtotal, deliveryCharge, total } = calculateTotals(
          state.items,
          state.selectedItems
        );
        state.subtotal = subtotal;
        state.deliveryCharge = deliveryCharge;
        state.total = total;
      })

      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.selectedItems = [];
        state.subtotal = 0;
        state.deliveryCharge = 0;
        state.total = 0;
      });
  },
});

export const { toggleSelectLocal, selectAllLocal, clearError } = cartSlice.actions;
export default cartSlice.reducer;