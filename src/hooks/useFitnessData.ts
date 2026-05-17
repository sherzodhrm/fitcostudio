import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export function useFitnessData() {
  const { user, isGuest } = useAuth();
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<Record<string, any>>({});
  const [suppLogs, setSuppLogs] = useState<Record<string, any>>({});
  const [mealOverrides, setMealOverrides] = useState<Record<string, any>>({});

  const today = new Date().toISOString().split('T')[0];

  const updateGuestStorage = (key: string, data: any) => {
    if (!isGuest) return;
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    if (!user) {
      if (isGuest) {
        // Load from localStorage for guests
        const localFood = localStorage.getItem('guest_food');
        const localWorkout = localStorage.getItem('guest_workout');
        const localSupp = localStorage.getItem('guest_supp');
        const localMeal = localStorage.getItem('guest_meal');
        
        if (localFood) setFoodLogs(JSON.parse(localFood).filter((f: any) => f.date === today));
        if (localWorkout) setWorkoutLogs(JSON.parse(localWorkout));
        if (localSupp) setSuppLogs(JSON.parse(localSupp));
        if (localMeal) setMealOverrides(JSON.parse(localMeal));
      } else {
        // Clear all state on logout
        setFoodLogs([]);
        setWorkoutLogs({});
        setSuppLogs({});
        setMealOverrides({});
      }
      return;
    }

    // Food Logs for today
    const foodQuery = query(
      collection(db, 'users', user.uid, 'foodLogs'),
      where('date', '==', today)
    );
    const unsubFood = onSnapshot(foodQuery, (snap) => {
      setFoodLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/foodLogs`));

    // Workout Logs
    const workoutQuery = collection(db, 'users', user.uid, 'workoutLogs');
    const unsubWorkout = onSnapshot(workoutQuery, (snap) => {
      const data: any = {};
      snap.docs.forEach(doc => { data[doc.data().dayIndex] = doc.data(); });
      setWorkoutLogs(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/workoutLogs`));

    // Supp Logs for today
    const suppQuery = query(
      collection(db, 'users', user.uid, 'suppLogs'),
      where('date', '==', today)
    );
    const unsubSupp = onSnapshot(suppQuery, (snap) => {
      if (!snap.empty) {
        setSuppLogs(snap.docs[0].data().checks);
      } else {
        setSuppLogs({});
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/suppLogs`));

    // Meal Overrides
    const mealQuery = collection(db, 'users', user.uid, 'mealOverrides');
    const unsubMeal = onSnapshot(mealQuery, (snap) => {
      const data: any = {};
      snap.docs.forEach(doc => { data[`${doc.data().dayIndex}_${doc.data().mealKey}`] = doc.data(); });
      setMealOverrides(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/mealOverrides`));

    return () => {
      unsubFood();
      unsubWorkout();
      unsubSupp();
      unsubMeal();
    };
  }, [user, today, isGuest]);

  const addFood = async (food: any) => {
    const newFood = { ...food, id: Math.random().toString(36).substr(2, 9), date: today, timestamp: new Date().toISOString() };
    if (isGuest) {
      const updated = [...foodLogs, newFood];
      setFoodLogs(updated);
      updateGuestStorage('guest_food', updated);
      return;
    }
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'foodLogs'), {
        ...food,
        date: today,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/foodLogs`);
    }
  };

  const removeFood = async (id: string) => {
    if (isGuest) {
      const updated = foodLogs.filter(f => f.id !== id);
      setFoodLogs(updated);
      updateGuestStorage('guest_food', updated);
      return;
    }
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'foodLogs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/foodLogs/${id}`);
    }
  };

  const saveWorkout = async (dayIndex: number, weights: any) => {
    const workoutData = { dayIndex, weights, date: today };
    if (isGuest) {
      const updated = { ...workoutLogs, [dayIndex]: workoutData };
      setWorkoutLogs(updated);
      updateGuestStorage('guest_workout', updated);
      return;
    }
    if (!user) return;
    const workoutId = `day_${dayIndex}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'workoutLogs', workoutId), workoutData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutLogs/${workoutId}`);
    }
  };

  const toggleSupp = async (id: string) => {
    const newChecks = { ...suppLogs, [id]: !suppLogs[id] };
    if (isGuest) {
      setSuppLogs(newChecks);
      updateGuestStorage('guest_supp', newChecks);
      return;
    }
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'suppLogs', today), {
        date: today,
        checks: newChecks
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/suppLogs/${today}`);
    }
  };

  const saveMealOverride = async (dayIndex: number, mealKey: string, food: string, note: string) => {
    const overrideData = { dayIndex, mealKey, food, note };
    if (isGuest) {
      const updated = { ...mealOverrides, [`${dayIndex}_${mealKey}`]: overrideData };
      setMealOverrides(updated);
      updateGuestStorage('guest_meal', updated);
      return;
    }
    if (!user) return;
    const overrideId = `${dayIndex}_${mealKey}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'mealOverrides', overrideId), overrideData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/mealOverrides/${overrideId}`);
    }
  };

  return { foodLogs, workoutLogs, suppLogs, mealOverrides, addFood, removeFood, saveWorkout, toggleSupp, saveMealOverride };
}
