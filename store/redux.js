import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';


// ─────────────────────────────────────────────
// 🎙️ audioSlice minimal
// Stocke les clips audio enregistrés localement
const audioSlice = createSlice({
  name: 'audio',
  initialState: {
    clips: []  // chaque clip est un objet { id, name, uri }
  },
  reducers: {
    addClip: (state, action) => {
      state.clips.push(action.payload);
    },
    removeClip: (state, action) => {
      state.clips = state.clips.filter(clip => clip.id !== action.payload);
    }
  }
});

// ─────────────────────────────────────────────
// 🌐 serverSlice minimal
// Stocke les infos de connexion au serveur
const serverSlice = createSlice({
  name: 'server',
  initialState: {
    ip: '',
    port: ''
  },
  reducers: {
    setIP: (state, action) => {
      state.ip = action.payload;
    },
    setPort: (state, action) => {
      state.port = action.payload;
    }
  }
});

// ─────────────────────────────────────────────
// Configuration Redux + Redux Persist

const rootReducer = combineReducers({
  audio: audioSlice.reducer,
  server: serverSlice.reducer
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});


export const persistor = persistStore(store);

// ─────────────────────────────────────────────
// Export des actions (à importer dans tes screens)

export const { addClip, removeClip } = audioSlice.actions;
export const { setIP, setPort } = serverSlice.actions;
