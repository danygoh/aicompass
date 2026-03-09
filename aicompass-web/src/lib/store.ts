import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QUESTIONS, DIMENSIONS, TIERS, COHORT_CODES } from '@/data/questions';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  industry: string;
  country: string;
  seniority: string;
  department: string;
  cohortCode: string;
  subscription: 'free' | 'cohort' | 'professional' | 'enterprise';
}

interface IntelligenceCategory {
  fields: { fieldName: string; fieldValue: string; source: string }[];
  sources: string[];
}

interface AssessmentState {
  // Profile
  profile: Profile;
  setProfile: (profile: Partial<Profile>) => void;
  
  // Intelligence
  intelligence: Record<string, IntelligenceCategory>;
  setIntelligence: (intel: Record<string, IntelligenceCategory>) => void;
  
  // Validation states
  fieldStates: Record<string, 'pending' | 'confirmed' | 'edited' | 'flagged'>;
  setFieldState: (key: string, state: 'pending' | 'confirmed' | 'edited' | 'flagged') => void;
  fieldValues: Record<string, string>;
  setFieldValue: (key: string, value: string) => void;
  
  // Responses
  responses: (number | null)[];
  setResponse: (index: number, answer: number) => void;
  
  // Variants
  variants: string[];
  setVariant: (index: number, variant: string) => void;
  
  // Current question
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  
  // Scores
  totalScore: number | null;
  dimensionScores: number[];
  tier: string | null;
  calculateScores: () => void;
  
  // Report
  reportData: any;
  setReportData: (data: any) => void;
  
  // Report ID
  reportId: string;
  generateReportId: () => void;
  
  // Assessment ID
  assessmentId: string | null;
  setAssessmentId: (id: string) => void;
  
  // Current screen
  currentScreen: string;
  setScreen: (screen: string) => void;
  
  // Progress
  progress: number;
  calculateProgress: () => void;
  
  // Reset
  reset: () => void;
}

const initialProfile: Profile = {
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  company: '',
  industry: '',
  country: '',
  seniority: '',
  department: '',
  cohortCode: '',
  subscription: 'free',
};

const initialIntelligence: Record<string, IntelligenceCategory> = {};

const initialFieldStates: Record<string, 'pending' | 'confirmed' | 'edited' | 'flagged'> = {};
const initialFieldValues: Record<string, string> = {};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      // Profile
      profile: initialProfile,
      setProfile: (profile) => set((state) => ({ 
        profile: { ...state.profile, ...profile } 
      })),
      
      // Intelligence
      intelligence: initialIntelligence,
      setIntelligence: (intel) => set({ intelligence: intel }),
      
      // Validation
      fieldStates: initialFieldStates,
      setFieldState: (key, fieldState) => set((s) => ({ 
        fieldStates: { ...s.fieldStates, [key]: fieldState } 
      })),
      fieldValues: initialFieldValues,
      setFieldValue: (key, value) => set((s) => ({ 
        fieldValues: { ...s.fieldValues, [key]: value } 
      })),
      
      // Responses
      responses: new Array(25).fill(null),
      setResponse: (index, answer) => set((state) => {
        const newResponses = [...state.responses];
        newResponses[index] = answer;
        return { responses: newResponses };
      }),
      
      // Variants
      variants: new Array(25).fill('standard'),
      setVariant: (index, variant) => set((state) => {
        const newVariants = [...state.variants];
        newVariants[index] = variant;
        return { variants: newVariants };
      }),
      
      // Current question
      currentQuestion: 0,
      setCurrentQuestion: (index) => set({ currentQuestion: index }),
      
      // Scores
      totalScore: null,
      dimensionScores: [0, 0, 0, 0, 0],
      tier: null,
      calculateScores: () => {
        const { responses } = get();
        const dimensionScores = [0, 0, 0, 0, 0];
        
        responses.forEach((answer, index) => {
          if (answer !== null) {
            const dim = QUESTIONS[index].dim;
            dimensionScores[dim] += answer + 1; // 0-3 -> 1-4
          }
        });
        
        const totalScore = dimensionScores.reduce((a, b) => a + b, 0);
        const tier = TIERS.find(t => totalScore >= t.min && totalScore <= t.max);
        
        set({ 
          totalScore, 
          dimensionScores, 
          tier: tier?.name || 'Beginner' 
        });
      },
      
      // Report
      reportData: null,
      setReportData: (data) => set({ reportData: data }),
      
      // Report ID
      reportId: '',
      generateReportId: () => {
        const { profile } = get();
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 90000) + 10000;
        const countryCode = profile.country ? profile.country.substring(0, 2).toUpperCase() : 'XX';
        const reportId = `AIC-${year}-${random}-${countryCode}`;
        set({ reportId });
      },
      
      // Assessment ID
      assessmentId: null,
      setAssessmentId: (id) => set({ assessmentId: id }),
      
      // Current screen
      currentScreen: 'land',
      setScreen: (screen) => set({ currentScreen: screen }),
      
      // Progress
      progress: 0,
      calculateProgress: () => {
        const { currentScreen, responses, fieldStates } = get();
        
        let progress = 0;
        const screenOrder = ['land', 'profile', 'collect', 'validate', 'questions', 'paywall', 'generate', 'report'];
        const currentIndex = screenOrder.indexOf(currentScreen);
        
        if (currentIndex >= 0) {
          progress = Math.round((currentIndex / screenOrder.length) * 100);
        }
        
        set({ progress });
      },
      
      // Reset
      reset: () => set({
        profile: initialProfile,
        intelligence: initialIntelligence,
        fieldStates: initialFieldStates,
        fieldValues: initialFieldValues,
        responses: new Array(25).fill(null),
        variants: new Array(25).fill('standard'),
        currentQuestion: 0,
        totalScore: null,
        dimensionScores: [0, 0, 0, 0, 0],
        tier: null,
        reportData: null,
        reportId: '',
        assessmentId: null,
        currentScreen: 'land',
        progress: 0,
      }),
    }),
    {
      name: 'ai-compass-assessment',
    }
  )
);
