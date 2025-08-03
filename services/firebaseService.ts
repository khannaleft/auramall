// firebase.ts - Using Firebase v10+ modular SDK.

import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseAuthUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  query,
  limit
} from 'firebase/firestore';

import { Product, Store, Order, DiscountCode, User } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export type FirebaseUser = FirebaseAuthUser;

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
};

const mockStores: Store[] = [
  { id: 1, name: 'Aura - Downtown', location: '123 Main St, Anytown, USA', bannerUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2500&auto=format&fit=crop', latitude: 34.0522, longitude: -118.2437 },
  { id: 2, name: 'Aura - Beachside', location: '456 Ocean Ave, Beachtown, USA', bannerUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop', latitude: 33.9934, longitude: -118.4763 }
];

const mockProducts: Product[] = [];

const mockDiscountCodes: DiscountCode[] = [
  { code: 'AURA10', type: 'percentage', value: 10 },
  { code: 'WELCOME15', type: 'percentage', value: 15 }
];

export const seedData = async () => {
  try {
    const q = query(collection(db, 'products'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("Seeding initial data to Firestore...");
      const batch = writeBatch(db);

      mockStores.forEach(store => {
        const ref = doc(db, 'stores', store.id.toString());
        batch.set(ref, store);
      });

      mockProducts.forEach(product => {
        const ref = doc(db, 'products', product.id.toString());
        batch.set(ref, product);
      });

      mockDiscountCodes.forEach(code => {
        const ref = doc(db, 'discountCodes', code.code);
        batch.set(ref, code);
      });

      await batch.commit();
      console.log("Seeding complete.");
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

export const getStores = async (): Promise<Store[]> => {
  const snap = await getDocs(collection(db, 'stores'));
  return snap.docs.map(doc => doc.data() as Store);
};

export const getProducts = async (): Promise<Product[]> => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(doc => doc.data() as Product);
};

export const getDiscountCodes = async (): Promise<DiscountCode[]> => {
  const snap = await getDocs(collection(db, 'discountCodes'));
  return snap.docs.map(doc => doc.data() as DiscountCode);
};

export const getOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(collection(db, 'orders'));
  return snap.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id }) as Order);
};

export const getUsers = async (): Promise<User[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(doc => doc.data() as User);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as User) : null;
};

export const createUserProfile = async (user: FirebaseUser, name?: string): Promise<User> => {
  const newUser: User = {
    uid: user.uid,
    name: name || user.displayName || 'Aura User',
    email: user.email!,
    role: 'customer',
  };
  await setDoc(doc(db, 'users', user.uid), newUser);
  return newUser;
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const placeOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
  let orderId = '';
  await runTransaction(db, async (transaction) => {
    const isPendingPayment = orderData.status === 'Pending Payment';

    const orderRef = isPendingPayment
      ? doc(db, "orders", `AURA-${Date.now()}`)
      : doc(collection(db, "orders"));

    orderId = orderRef.id;

    if (!isPendingPayment) {
      const productReads = orderData.items.map(item => {
        const productRef = doc(db, 'products', item.id.toString());
        return transaction.get(productRef).then(productSnap => ({
          productSnap,
          item,
          productRef
        }));
      });

      const productDetails = await Promise.all(productReads);

      const updates: { productRef: any; newStock: number }[] = [];
      for (const { productSnap, item, productRef } of productDetails) {
        if (!productSnap.exists()) throw new Error(`Product ${item.name} could not be found.`);
        const productData = productSnap.data() as Product;
        const newStock = productData.stock - item.quantity;
        if (newStock < 0) throw new Error(`Not enough stock for ${productData.name}.`);
        updates.push({ productRef, newStock });
      }

      for (const { productRef, newStock } of updates) {
        transaction.update(productRef, { stock: newStock });
      }
    }

    transaction.set(orderRef, orderData);
  });
  return orderId;
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const newId = Date.now();
  const newProduct = { ...product, id: newId };
  await setDoc(doc(db, 'products', newId.toString()), newProduct);
  return newProduct;
};

export const updateProduct = async (productId: number, data: Partial<Product>): Promise<void> => {
  await updateDoc(doc(db, 'products', productId.toString()), data);
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await deleteDoc(doc(db, 'products', productId.toString()));
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), { status });
};

export const updateProductStock = async (productId: number, stock: number): Promise<void> => {
  await updateDoc(doc(db, 'products', productId.toString()), { stock });
};

export const addStore = async (store: Omit<Store, 'id'>): Promise<Store> => {
  const newId = Date.now();
  const newStore = { ...store, id: newId };
  await setDoc(doc(db, 'stores', newId.toString()), newStore);
  return newStore;
};

export const updateStore = async (storeId: number, updated: Partial<Store>): Promise<void> => {
  await updateDoc(doc(db, 'stores', storeId.toString()), updated);
};

export const deleteStore = async (storeId: number): Promise<void> => {
  await deleteDoc(doc(db, 'stores', storeId.toString()));
};

export const addDiscountCode = async (code: DiscountCode): Promise<void> => {
  await setDoc(doc(db, 'discountCodes', code.code), code);
};

export const deleteDiscountCode = async (code: string): Promise<void> => {
  await deleteDoc(doc(db, 'discountCodes', code));
};
