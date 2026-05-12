import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

const DEMO_PRODUCTS = [
  {
    _id: '1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry leading noise canceling optimization with auto NC optimizer.',
    price: 399.99,
    category: 'audio',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80'],
    isFeatured: true,
  },
  {
    _id: '2',
    name: 'Apple iPhone 15 Pro Max',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip.',
    price: 1199.00,
    category: 'smartphones',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1695048132912-7dc2dc3a681c?auto=format&fit=crop&w=500&q=80'],
    isFeatured: true,
  },
  {
    _id: '3',
    name: 'Samsung Galaxy Watch 6 classic',
    description: 'Keep your goals on track with advanced fitness coaching.',
    price: 299.99,
    category: 'smartwatches',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80'],
    isFeatured: false,
  },
  {
    _id: '4',
    name: 'Anker Nano Power Bank',
    description: 'Built-in USB-C Connector, 22.5W Fast Charging.',
    price: 29.99,
    category: 'chargers',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80'],
    isFeatured: true,
  }
];

export const useFetchProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setProducts(DEMO_PRODUCTS);
      } else {
        const dbProducts = snapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data()
        }));
        setProducts(dbProducts);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setProducts(DEMO_PRODUCTS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
};

