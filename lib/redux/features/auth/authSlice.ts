import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithCustomToken } from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  step: 'email' | 'otp';
  email: string;
  otp: string[];
  otpLength: number;
  isAuthenticated: boolean;
  signupName: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  step: 'email',
  email: '',
  otp: ['', '', '', '', '', ''],
  otpLength: 6,
  isAuthenticated: false,
  signupName: '',
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to logout');
      
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to logout');
    }
  }
);

// login/signup thunks
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ email, isSignup = false }: { email: string; isSignup?: boolean }, { rejectWithValue }) => {
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return { email, message: data.message };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send OTP');
    }
  }
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async ({ email, name }: { email: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return { email, name };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ 
    email, 
    otp, 
    name,
    isSignup = false 
  }: { 
    email: string; 
    otp: string; 
    name?: string;
    isSignup?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          otp,
          ...(name && { name })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      const customToken = data.customToken;

      if (!customToken) {
        throw new Error('Authentication token not received');
      }

      const userCredential = await signInWithCustomToken(auth, customToken);
      const idToken = await userCredential.user.getIdToken(true);

      const loginResponse = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: idToken }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Login failed');
      }

      return { 
        user: loginData.user,
        role: loginData.role,
        redirect: loginData.role === 'admin' ? '/admin' : '/home'
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Verification failed');
    }
  }
);

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (provider: 'google' | 'github', { rejectWithValue }) => {
    try {
      const authProvider = provider === 'google' ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, authProvider);
      const token = await result.user.getIdToken();

      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${provider} login failed`);
      }

      return { 
        user: data.user,
        role: data.role,
        redirect: data.role === 'admin' ? '/admin' : '/home'
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `${provider} login failed`);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
      state.isAuthenticated = false;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setOtp: (state, action: PayloadAction<{ index: number; value: string }>) => {
      const { index, value } = action.payload;
      state.otp[index] = value.substring(value.length - 1);
    },
    setOtpArray: (state, action: PayloadAction<string[]>) => {
      state.otp = action.payload;
    },
    clearOtp: (state) => {
      state.otp = ['', '', '', '', '', ''];
    },
    setStep: (state, action: PayloadAction<'email' | 'otp'>) => {
      state.step = action.payload;
    },
    setSignupName: (state, action: PayloadAction<string>) => {
      state.signupName = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.step = 'otp';
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Signup with Email
      .addCase(signupWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;
        state.signupName = action.payload.name;
        state.step = 'otp';
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.step = 'email'; // Reset step for next time
        state.otp = ['', '', '', '', '', '']; // Clear OTP
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Social Login
      .addCase(socialLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAuth, 
  setEmail, 
  setOtp, 
  setOtpArray, 
  clearOtp, 
  setStep, 
  setSignupName,
  clearError, 
  resetAuth 
} = authSlice.actions;

export default authSlice.reducer;