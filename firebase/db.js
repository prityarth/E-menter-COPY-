// src/firebase/db.js
import { 
  collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, 
  query, onSnapshot, arrayUnion, arrayRemove, orderBy 
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ─────────────────────────────────────────────────────────────
// 1. CREATE NEW SESSION – saves ALL form fields
// ─────────────────────────────────────────────────────────────
export const createSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      ...sessionData,
      status: 'FREE',
      participants: [],
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("createSession failed:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 2. UPDATE SESSION – allows updating ALL fields (except participants/status)
// ─────────────────────────────────────────────────────────────
export const updateSessionData = async (sessionId, updates) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    
    const safeUpdates = { ...updates };
    delete safeUpdates.participants;
    delete safeUpdates.status;

    await updateDoc(sessionRef, safeUpdates);
    return { success: true };
  } catch (error) {
    console.error("updateSessionData failed:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 3. REAL-TIME LISTENER
// ─────────────────────────────────────────────────────────────
export const subscribeToSessions = (callback) => {
  const q = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(sessions);
  }, (error) => {
    console.error("subscribeToSessions error:", error);
    callback([]);
  });
};

// ─────────────────────────────────────────────────────────────
// 4. USER REQUEST SLOT
// ─────────────────────────────────────────────────────────────
export const requestSession = async (sessionId, user) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snap = await getDoc(sessionRef);
    
    if (!snap.exists()) return { success: false, error: "Session not found" };

    let displayName = "Participant";

    const userProfileSnap = await getDoc(doc(db, "users", user.uid));
    if (userProfileSnap.exists()) {
      const userData = userProfileSnap.data();
      displayName = userData.name || userData.teamName || displayName;
    }

    if (user.displayName && user.displayName.trim()) {
      displayName = user.displayName.trim();
    }

    if (displayName === "Participant" && user.email) {
      const prefix = user.email.split('@')[0];
      displayName = prefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    const data = snap.data();
    const existing = data.participants?.find(p => p.uid === user.uid);

    if (existing) {
      const updated = data.participants.map(p =>
        p.uid === user.uid ? { ...p, status: 'pending', name: displayName } : p
      );
      await updateDoc(sessionRef, { participants: updated });
    } else {
      await updateDoc(sessionRef, {
        participants: arrayUnion({
          uid: user.uid,
          name: displayName,
          status: 'pending',
          checkedIn: false,
          requestedAt: new Date().toISOString(),
        })
      });
    }

    return { success: true };
  } catch (error) {
    console.error("requestSession error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 5. UPDATE PARTICIPANT STATUS
// ─────────────────────────────────────────────────────────────
export const updateParticipantStatus = async (sessionId, userId, newStatus) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snap = await getDoc(sessionRef);
    
    if (!snap.exists()) return { success: false, error: "Session not found" };

    const data = snap.data();
    const updatedParticipants = (data.participants || []).map(p => {
      if (p.uid === userId) {
        let checkedIn = p.checkedIn;
        if (newStatus === 'completed') checkedIn = true;
        else if (['approved', 'rejected', 'pending'].includes(newStatus)) checkedIn = false;
        return { ...p, status: newStatus, checkedIn };
      }
      return p;
    });

    await updateDoc(sessionRef, { participants: updatedParticipants });
    return { success: true };
  } catch (error) {
    console.error("updateParticipantStatus error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 6. TOGGLE CHECK-IN
// ─────────────────────────────────────────────────────────────
export const toggleCheckIn = async (sessionId, userId) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snap = await getDoc(sessionRef);
    
    if (!snap.exists()) return { success: false, error: "Session not found" };

    const data = snap.data();
    const updated = (data.participants || []).map(p =>
      p.uid === userId ? { ...p, checkedIn: !p.checkedIn } : p
    );

    await updateDoc(sessionRef, { participants: updated });
    return { success: true };
  } catch (error) {
    console.error("toggleCheckIn error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 7. GET ALL USERS
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("getAllUsers error:", error);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 8. DELETE SESSION
// ─────────────────────────────────────────────────────────────
export const deleteSession = async (sessionId) => {
  try {
    await deleteDoc(doc(db, "sessions", sessionId));
    return { success: true };
  } catch (error) {
    console.error("deleteSession error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 9. ADMIN DIRECT APPROVE / REGISTER USER
// ─────────────────────────────────────────────────────────────
export const registerForSession = async (sessionId, user) => {
  try {
    let displayName = "Participant";

    const profileSnap = await getDoc(doc(db, "users", user.id || user.uid));
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      displayName = data.name || data.teamName || displayName;
    }

    if (user.displayName?.trim()) {
      displayName = user.displayName.trim();
    }

    if (displayName === "Participant" && user.email) {
      const prefix = user.email.split('@')[0];
      displayName = prefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      participants: arrayUnion({
        uid: user.id || user.uid,
        name: displayName,
        status: 'approved',
        checkedIn: false,
        approvedAt: new Date().toISOString(),
      })
    });

    return { success: true };
  } catch (error) {
    console.error("registerForSession error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 10. COMPLETELY REMOVE PARTICIPANT FROM SESSION
//     (used from "Edit Requests" tab to delete request)
// ─────────────────────────────────────────────────────────────
export const removeParticipantFromSession = async (sessionId, userId) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snap = await getDoc(sessionRef);

    if (!snap.exists()) {
      return { success: false, error: "Session not found" };
    }

    const data = snap.data();
    const currentParticipants = data.participants || [];

    const updatedParticipants = currentParticipants.filter(
      p => (p.uid || p.id) !== userId
    );

    // If nothing changed, no need to update
    if (updatedParticipants.length === currentParticipants.length) {
      return { success: true, message: "Participant not found in session" };
    }

    await updateDoc(sessionRef, {
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Removed participant ${userId} from session ${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("removeParticipantFromSession error:", error);
    return { success: false, error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 11. NEW: MOVE PARTICIPANT UP/DOWN IN SESSION (reorder)
//     (used from "By Mentor" tab to reorder participants)
// ─────────────────────────────────────────────────────────────
export const moveParticipant = async (sessionId, userId, direction) => {
  if (!['up', 'down'].includes(direction)) {
    return { success: false, error: "Invalid direction (must be 'up' or 'down')" };
  }
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const snap = await getDoc(sessionRef);

    if (!snap.exists()) {
      return { success: false, error: "Session not found" };
    }

    const data = snap.data();
    const participants = [...(data.participants || [])];

    const index = participants.findIndex(p => (p.uid || p.id) === userId);
    if (index === -1) {
      return { success: false, error: "Participant not found" };
    }

    let newIndex = index;
    if (direction === 'up' && index > 0) {
      newIndex = index - 1;
    } else if (direction === 'down' && index < participants.length - 1) {
      newIndex = index + 1;
    } else {
      return { success: true, message: "Already at boundary—no move performed" };
    }

    // Swap
    [participants[index], participants[newIndex]] = [participants[newIndex], participants[index]];

    await updateDoc(sessionRef, {
      participants,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Moved participant ${userId} ${direction} in session ${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("moveParticipant error:", error);
    return { success: false, error: error.message };
  }
};