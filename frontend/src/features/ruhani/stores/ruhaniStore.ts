import { create } from 'zustand';

interface SessionState {
    isActive: boolean;
    timeRemaining: number | null; // in seconds, null for open
    currentStep: number;
}

interface RuhaniStore {
    session: SessionState;
    startSession: (durationMinutes: number | null) => void;
    endSession: () => void;
    nextStep: () => void;
}

export const useRuhaniStore = create<RuhaniStore>((set) => ({
    session: {
        isActive: false,
        timeRemaining: null,
        currentStep: 0,
    },
    startSession: (durationMinutes) =>
        set({
            session: {
                isActive: true,
                timeRemaining: durationMinutes ? durationMinutes * 60 : null,
                currentStep: 1, // 1: Arrival, 2: Tafakkur, 3: Tadabbur, 4: Tazkia
            },
        }),
    endSession: () =>
        set({
            session: {
                isActive: false,
                timeRemaining: null,
                currentStep: 0,
            },
        }),
    nextStep: () =>
        set((state) => ({
            session: {
                ...state.session,
                currentStep: state.session.currentStep + 1,
            },
        })),
}));
