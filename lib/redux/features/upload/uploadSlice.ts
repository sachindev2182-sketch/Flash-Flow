import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedImage: {
    url: string;
    filename: string;
  } | null;
}

const initialState: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  uploadedImage: null,
};

export const uploadImage = createAsyncThunk(
  'upload/image',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    clearUpload: (state) => {
      state.uploading = false;
      state.progress = 0;
      state.error = null;
      state.uploadedImage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.uploading = true;
        state.progress = 0;
        state.error = null;
        state.uploadedImage = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.progress = 100;
        state.uploadedImage = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUploadProgress, clearUpload } = uploadSlice.actions;
export default uploadSlice.reducer;