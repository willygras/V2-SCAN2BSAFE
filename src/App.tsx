/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardCheck, 
  Clock, 
  Command, 
  Database, 
  Dna, 
  Eye, 
  FileCheck, 
  Hand, 
  History, 
  Info, 
  Layers, 
  LayoutDashboard, 
  Lock, 
  LogOut, 
  Menu, 
  Mic, 
  Package, 
  Pill, 
  Plus, 
  RefreshCcw, 
  Search, 
  ShieldCheck, 
  Smartphone, 
  Stethoscope, 
  Thermometer, 
  Trash2, 
  User, 
  UserPlus, 
  Users, 
  Zap,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Scan,
  Monitor,
  Heart,
  Droplets,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type CaseSeverity = 'NORMAL' | 'CLOSE MONITORING' | 'EMERGENCY' | 'CRITICAL';
type WardType = 'Medical' | 'Surgery' | 'OB' | 'Pedia';

interface VitalSign {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  status: 'normal' | 'low' | 'high' | 'critical';
}

interface Medication {
  name: string;
  orderedDose: string;
  availableDose: string;
  route: string;
  frequency: string;
  barcode: string;
  highAlert?: boolean;
}

interface CaseOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  fatal?: boolean;
}

interface CaseScenario {
  id: string;
  ward: WardType;
  shift: 'AM' | 'PM' | 'NIGHT' | 'DAY';
  studentLogin: string;
  studentId: string;
  supervisor: string;
  patient: {
    name: string;
    age: number;
    room: string;
    weight?: number;
    priority: CaseSeverity;
    diagnosis: string;
    allergies: string[];
    vitals: VitalSign[];
    ivf?: string;
    ivAccess?: string;
    nursingNote: string;
    endorsement: string;
    mrn: string; // Medical Record Number
  };
  medOrder: {
    medication: Medication;
    physician: string;
  };
  twists: {
    prep?: {
      question: string;
      options: CaseOption[];
    };
    scan?: {
       patientBarcodeOverride?: string; // For mismatches like Case 1
       alertMsg?: string;
    };
    decisionPoint?: {
      title: string;
      question: string;
      options: CaseOption[];
      isSata?: boolean; // Select All That Apply
    };
    administration?: {
      question: string;
      options: CaseOption[];
    };
    malfunction?: boolean;
    deterioration?: {
      triggerStep: string;
      newVitals: VitalSign[];
      actions: CaseOption[];
    };
  };
}

// --- Data ---

const ALL_CASES: CaseScenario[] = [
  {
    id: 'case-1',
    ward: 'Medical',
    shift: 'AM',
    studentLogin: 'StudentNurse_AReyes',
    studentId: 'SN-6241',
    supervisor: 'Nurse Supervisor M. Santos, RN',
    patient: {
      name: 'Sinig Gang',
      age: 81,
      room: '212-B',
      priority: 'CLOSE MONITORING',
      diagnosis: 'Peptic Ulcer Disease with Gastrointestinal Bleeding',
      allergies: ['NSAIDs'],
      vitals: [
        { label: 'BP', value: '92/60', icon: <Activity size={16} />, status: 'low' },
        { label: 'HR', value: '108', icon: <Heart size={16} />, status: 'high' },
        { label: 'RR', value: '22', icon: <Wind size={16} />, status: 'high' },
        { label: 'Temp', value: '36.9', unit: '°C', icon: <Thermometer size={16} />, status: 'normal' },
        { label: 'O2 Sat', value: '95', unit: '%', icon: <Droplets size={16} />, status: 'normal' },
      ],
      ivf: 'PNSS 1L at 80mL/hr',
      ivAccess: 'Right Hand 22G',
      nursingNote: "Patient appears weak and dizzy upon standing.",
      endorsement: "Complained of epigastric pain, one episode of black stool. Monitor for bleeding.",
      mrn: 'MRN-88122'
    },
    medOrder: {
      medication: {
        name: 'Omeprazole',
        orderedDose: '40mg',
        availableDose: '20mg vials',
        route: 'IV NOW',
        frequency: 'STAT',
        barcode: 'BC-OMEP-40'
      },
      physician: 'Dr. Lim'
    },
    twists: {
      prep: {
        question: "Medication is scheduled for 08:00, but it's now 09:00. What is your action?",
        options: [
          { id: '1a', text: "Double the dose to catch up", isCorrect: false, feedback: "Doubling without physician order is unsafe. Never adjust dosages based on time delays alone." },
          { id: '1b', text: "Give ordered dose and document delay", isCorrect: true, feedback: "Correct. Administer the prescribed dose and note the reason for delay in the eMAR." }
        ]
      },
      scan: {
        patientBarcodeOverride: 'Sisig Gang',
        alertMsg: "FLAG: Name discrepancy detected. Scanned: Sisig Gang. Expected: Sinig Gang."
      },
      administration: {
        question: "Should Omeprazole be given as a rapid IV push?",
        options: [
          { id: '1c', text: "YES — rapid IV push", isCorrect: false, feedback: "Rapid IV push may cause vein irritation or cardiovascular instability. Follow proper slow IV push guidelines." },
          { id: '1d', text: "NO — follow proper IV guidelines", isCorrect: true, feedback: "Correct. Most IV push medications require slow administration over 2-5 minutes." }
        ]
      }
    }
  },
  {
    id: 'case-2',
    ward: 'Medical',
    shift: 'NIGHT',
    studentLogin: 'StudentNurse_KDelaCruz',
    studentId: 'SN-7015',
    supervisor: 'Nurse Supervisor R. Villanueva, RN',
    patient: {
      name: 'Mary Yenda',
      age: 67,
      room: '418-A',
      priority: 'CLOSE MONITORING',
      diagnosis: 'COPD Exacerbation',
      allergies: ['Penicillin'],
      vitals: [
        { label: 'BP', value: '138/84', icon: <Activity size={16} />, status: 'normal' },
        { label: 'HR', value: '102', icon: <Heart size={16} />, status: 'high' },
        { label: 'RR', value: '26', icon: <Wind size={16} />, status: 'high' },
        { label: 'Temp', value: '37.3', unit: '°C', icon: <Thermometer size={16} />, status: 'normal' },
        { label: 'O2 Sat', value: '90', unit: '%', icon: <Droplets size={16} />, status: 'low' },
      ],
      ivf: 'PNSS 1L at 40mL/hr',
      ivAccess: 'Left Forearm 20G',
      nursingNote: "Chest tightness and increasing difficulty breathing.",
      endorsement: "COPD exacerbation, SOB episodes during afternoon shift. Oxygen therapy ongoing.",
      mrn: 'MRN-15502'
    },
    medOrder: {
      medication: {
        name: 'Salbutamol Nebulization',
        orderedDose: '5mg',
        availableDose: '2.5mg/2.5mL nebule',
        route: 'Nebulization',
        frequency: 'STAT',
        barcode: 'BC-SALB-STAT'
      },
      physician: 'Dr. Cruz'
    },
    twists: {
      prep: {
        question: "You enters the room and observe the patient sitting upright, using accessory muscles with audible wheezing. What is your first action?",
        options: [
          { id: '2a', text: "Assess Airway and Breathing FIRST", isCorrect: true, feedback: "Correct. Always prioritize ABCs in acute distress." },
          { id: '2b', text: "Prepare routine medication first", isCorrect: false, feedback: "Respiratory distress requires immediate ABC assessment. Do not delay assessment for medication prep." }
        ]
      },
      decisionPoint: {
        title: "Clinical Condition Worsened",
        question: "Respiratory Assessment: RR 32, O2 Sat 84%, bilateral wheezing, cool pale skin. Action?",
        options: [
          { id: '2c', text: "Raise O2 and notify RN", isCorrect: true, feedback: "Correct. Increasing supplemental oxygen and alerting senior staff is critical." },
          { id: '2d', text: "Leave to continue paperwork", isCorrect: false, feedback: "Patient deterioration must never be ignored. Leaving a struggling patient is unsafe practice." }
        ]
      },
      scan: {
        alertMsg: "BCMA ALERT: Scanned Salbutamol 08:00 PM Routine dose. Order specifies STAT dose."
      },
      deterioration: {
        triggerStep: 'administration',
        newVitals: [
          { label: 'BP', value: '88/60', icon: <Activity size={16} />, status: 'low' },
          { label: 'HR', value: '130', icon: <Heart size={16} />, status: 'critical' },
          { label: 'RR', value: '10', icon: <Wind size={16} />, status: 'low' },
          { label: 'O2 Sat', value: '76', icon: <Droplets size={16} />, status: 'critical' },
        ],
        actions: [
          { id: '2e', text: "Assess responsiveness and pulse", isCorrect: true, feedback: "Correct. Rapid assessment of circulation and consciousness is required now." },
          { id: '2f', text: "Continue nebulization", isCorrect: false, feedback: "Stop current intervention; the patient is crashing and requires emergency life support." },
          { id: '2g', text: "Call Rapid Response Team", isCorrect: true, feedback: "Correct. This is a life-threatening deterioration." },
          { id: '2h', text: "Leave to find supplies", isCorrect: false, feedback: "Unstable patients must never be left unattended. Use the call bell." }
        ]
      }
    }
  },
  {
    id: 'case-3',
    ward: 'Medical',
    shift: 'DAY',
    studentLogin: 'StudentNurse_MValdez',
    studentId: 'SN-9032',
    supervisor: 'Nurse Supervisor J. Lim, RN',
    patient: {
      name: 'Pia Lum',
      age: 72,
      room: '306-B',
      priority: 'CLOSE MONITORING',
      diagnosis: 'CHF Exacerbation',
      allergies: [],
      vitals: [
        { label: 'BP', value: '100/64', icon: <Activity size={16} />, status: 'low' },
        { label: 'HR', value: '96', icon: <Heart size={16} />, status: 'normal' },
        { label: 'RR', value: '22', icon: <Wind size={16} />, status: 'high' },
        { label: 'Temp', value: '36.7', unit: '°C', icon: <Thermometer size={16} />, status: 'normal' },
        { label: 'O2 Sat', value: '93', unit: '%', icon: <Droplets size={16} />, status: 'low' },
      ],
      ivf: 'D5LR 1L at 50mL/hr',
      ivAccess: 'Right Forearm 20G',
      nursingNote: "Heart failure exacerbation. On diuretics. Mild confusion at night. Monitor electrolytes.",
      endorsement: "Monitor strict I&O and daily weight. Recent potassium labs pending.",
      mrn: 'MRN-44931'
    },
    medOrder: {
      medication: {
        name: 'Furosemide',
        orderedDose: '40mg',
        availableDose: '20mg/2mL amps',
        route: 'IV push NOW',
        frequency: 'STAT',
        barcode: 'BC-FURO-40'
      },
      physician: 'Dr. Tan'
    },
    twists: {
      decisionPoint: {
        title: "New Lab Result: Potassium 2.9 mmol/L",
        question: "What is the BEST action regarding the Furosemide order?",
        isSata: false, // In user prompt it says A only is wrong, B is priority.
        options: [
          { id: '3a', text: "Administer Furosemide (BCMA confirmed)", isCorrect: false, feedback: "Correct medication identity does NOT mean it's safe to give. Furosemide wastes more potassium." },
          { id: '3b', text: "Hold and notify RN due to low potassium", isCorrect: true, feedback: "Correct. Critical labs must be addressed before administering medications that worsen the condition." },
          { id: '3c', text: "Give medication and increase potassium after", isCorrect: false, feedback: "Unsafe. The order might need cancellation or adjustment first." },
          { id: '3d', text: "Document and proceed", isCorrect: false, feedback: "Documentation does not mitigate the danger of hypokalemia." }
        ]
      },
      deterioration: {
        triggerStep: 'monitoring',
        newVitals: [
          { label: 'BP', value: '88/56', icon: <Activity size={16} />, status: 'low' },
          { label: 'HR', value: '110', icon: <Heart size={16} />, status: 'high' },
          { label: 'RR', value: '24', icon: <Wind size={16} />, status: 'high' },
        ],
        actions: [
          { id: '3e', text: "Lower head of bed and assess circulation", isCorrect: true, feedback: "Appropriate for hypotension." },
          { id: '3f', text: "Give oral potassium immediately", isCorrect: false, feedback: "No order confirmation for emergency PO potassium." },
          { id: '3g', text: "Recheck vitals and notify RN", isCorrect: true, feedback: "Always notify senior staff of significant vitals change." },
          { id: '3h', text: "Assess for electrolyte imbalance signs", isCorrect: true, feedback: "Weakness and dizziness support electrolyte check." }
        ]
      }
    }
  },
  {
    id: 'case-4',
    ward: 'Surgery',
    shift: 'DAY',
    studentLogin: 'StudentNurse_JDelaCruz',
    studentId: 'SN-0042',
    supervisor: 'Nurse Supervisor S. Santos, RN',
    patient: {
      name: 'Banan Akew',
      age: 42,
      room: '305-B',
      priority: 'NORMAL',
      diagnosis: 'Post-Operative Appendectomy (Day 1)',
      allergies: ['CEPHALOSPORINS'],
      vitals: [
        { label: 'BP', value: '120/80', icon: <Activity size={16} />, status: 'normal' },
        { label: 'HR', value: '92', icon: <Heart size={16} />, status: 'normal' },
        { label: 'RR', value: '20', icon: <Wind size={16} />, status: 'normal' },
        { label: 'Temp', value: '37.8', unit: '°C', icon: <Thermometer size={16} />, status: 'normal' },
        { label: 'SpO2', value: '97', unit: '%', icon: <Droplets size={16} />, status: 'normal' },
      ],
      ivf: 'D5NM 1L at 100mL/hr',
      ivAccess: 'Right Arm 18G',
      nursingNote: "Incisional pain, mild dizziness.",
      endorsement: "Post-op Day 1. Pain managed. Patient up and walking with assistance.",
      mrn: 'MRN-77210'
    },
    medOrder: {
      medication: {
        name: 'Cefazolin',
        orderedDose: '1g',
        availableDose: '1g vial',
        route: 'IV NOW',
        frequency: 'q8h',
        barcode: 'BC-CEFA-1G'
      },
      physician: 'Dr. Reyes'
    },
    twists: {
      scan: {
        alertMsg: "⚠ CRITICAL ALLERGY ALERT: Cefazolin is a Cephalosporin. Patient has documented Cephalosporin allergy."
      },
      decisionPoint: {
        title: "Allergy Conflict Detected",
        question: "BCMA has flagged a major allergy. What is your next move?",
        options: [
          { id: '4a', text: "Hold & Notify Physician", isCorrect: true, feedback: "Correct. Never administer a medication that is in a class the patient is allergic to." },
          { id: '4b', text: "Override alert", isCorrect: false, fatal: true, feedback: "Fatal error. Overriding allergy alerts led to anaphylaxis." },
          { id: '4c', text: "Administer anyway", isCorrect: false, fatal: true, feedback: "Fatal error. Administering known allergens is negligence." }
        ]
      },
      administration: {
        question: "Physician changed order to Clindamycin 600mg IV. Can it be given as rapid IV push?",
        options: [
          { id: '4d', text: "YES", isCorrect: false, feedback: "Incorrect. Clindamycin must be diluted and infused over at least 10-60 minutes to avoid cardiac arrest/toxicity." },
          { id: '4e', text: "NO — IV Infusion required", isCorrect: true, feedback: "Correct. Safety protocols require IV infusion for Clindamycin." }
        ]
      }
    }
  },
  {
    id: 'case-5',
    ward: 'OB',
    shift: 'AM',
    studentLogin: 'StudentNurse_ARamos',
    studentId: 'SN-0051',
    supervisor: 'Nurse Supervisor B. Cruz, RN',
    patient: {
      name: 'Lou Gaw',
      age: 28,
      room: 'OB-101',
      priority: 'EMERGENCY',
      diagnosis: 'Postpartum Hemorrhage',
      allergies: [],
      vitals: [
        { label: 'BP', value: '90/60', icon: <Activity size={16} />, status: 'low' },
        { label: 'HR', value: '118', icon: <Heart size={16} />, status: 'high' },
        { label: 'O2 Sat', value: '96', unit: '%', icon: <Droplets size={16} />, status: 'normal' },
      ],
      nursingNote: "Patient showing signs of hypovolemia. Bleeding is significant.",
      endorsement: "Postpartum Day 1. Active bleeding. Initiating hemorrhage protocol.",
      mrn: 'MRN-66192'
    },
    medOrder: {
      medication: {
        name: 'Oxytocin',
        orderedDose: '20 units',
        availableDose: '10 units/mL ampoules',
        route: 'IV infusion in 1L PNSS',
        frequency: 'STAT',
        barcode: 'BC-OXY-20'
      },
      physician: 'Dr. Lopez'
    },
    twists: {
      prep: {
        question: "What is the ordered route for Oxytocin?",
        options: [
          { id: '5a', text: "Oral", isCorrect: false, feedback: "Oxytocin is not administered orally for postpartum hemorrhage." },
          { id: '5b', text: "IV Infusion", isCorrect: true, feedback: "Correct. IV infusion is standard for PPH control." },
          { id: '5c', text: "IM", isCorrect: false, feedback: "While IM is possible, the order specified IV infusion." }
        ]
      },
      decisionPoint: {
        title: "Immediate Action Required",
        question: "Bleeding is heavy. Vitals show hypovolemia. Next step?",
        options: [
          { id: '5d', text: "Administer oxytocin as ordered", isCorrect: true, feedback: "Correct. Timely uterotonic administration is the primary treatment for PPH." },
          { id: '5e', text: "Delay medication to finish charting", isCorrect: false, feedback: "Delay in uterotonic increases maternal bleeding risk significantly." },
          { id: '5f', text: "Give oral instead", isCorrect: false, feedback: "Route mismatch. Oral is ineffective in this emergency." }
        ]
      }
    }
  },
  {
    id: 'case-6',
    ward: 'OB',
    shift: 'DAY',
    studentLogin: 'StudentNurse_NBautista',
    studentId: 'SN-0062',
    supervisor: 'Nurse Supervisor C. Go, RN',
    patient: {
      name: 'Ley Cheflan',
      age: 32,
      room: 'OB-204',
      priority: 'CRITICAL',
      diagnosis: 'Severe Preeclampsia',
      allergies: [],
      vitals: [
        { label: 'BP', value: '170/110', icon: <Activity size={16} />, status: 'critical' },
        { label: 'RR', value: '14', icon: <Wind size={16} />, status: 'normal' },
        { label: 'HR', value: '88', icon: <Heart size={16} />, status: 'normal' },
      ],
      nursingNote: "36 weeks pregnant. Complaint of severe headache and blurred vision.",
      endorsement: "Severe preeclampsia. High risk for seizure. Maintain seizure precautions.",
      mrn: 'MRN-88221'
    },
    medOrder: {
      medication: {
        name: 'Magnesium Sulfate',
        orderedDose: '4g',
        availableDose: '50% solution 1g/2mL',
        route: 'IV loading dose',
        frequency: 'STAT',
        barcode: 'BC-MAGS-4G',
        highAlert: true
      },
      physician: 'Dr. Chua'
    },
    twists: {
      prep: {
        question: "What must be assessed strictly BEFORE and DURING Magnesium Sulfate administration?",
        options: [
          { id: '6a', text: "Respiratory rate", isCorrect: true, feedback: "Correct. Magnesium toxicity causes respiratory depression." },
          { id: '6b', text: "Hair color", isCorrect: false, feedback: "Irrelevant." },
          { id: '6c', text: "Height", isCorrect: false, feedback: "Irrelevant for current administration monitoring." }
        ]
      },
      deterioration: {
        triggerStep: 'administration',
        newVitals: [
          { label: 'RR', value: '10', icon: <Wind size={16} />, status: 'low' },
          { label: 'BP', value: '160/100', icon: <Activity size={16} />, status: 'high' }
        ],
        actions: [
          { id: '6d', text: "Continue infusion", isCorrect: false, feedback: "Unsafe. Toxicity signs are appearing." },
          { id: '6e', text: "Stop infusion and notify physician", isCorrect: true, feedback: "Correct. Magnesium toxicity requires immediate cessation and medical intervention (Calcium Gluconate)." },
          { id: '6f', text: "Ignore", isCorrect: false, feedback: "Negligence." }
        ]
      }
    }
  },
  {
    id: 'case-7',
    ward: 'OB',
    shift: 'PM',
    studentLogin: 'StudentNurse_CMendoza',
    studentId: 'SN-0071',
    supervisor: 'Nurse Supervisor D. Lim, RN',
    patient: {
      name: 'Chi Sharon',
      age: 26,
      room: 'OB-305',
      priority: 'NORMAL',
      diagnosis: 'Postpartum Infection',
      allergies: [],
      vitals: [
        { label: 'Temp', value: '39.0', unit: '°C', icon: <Thermometer size={16} />, status: 'high' },
        { label: 'BP', value: '110/70', icon: <Activity size={16} />, status: 'normal' },
        { label: 'HR', value: '100', icon: <Heart size={16} />, status: 'high' },
      ],
      nursingNote: "Fever persistently high. Patient appears flushed.",
      endorsement: "Postpartum Day 2. Blood cultures pending. Initiating IV antibiotics.",
      mrn: 'MRN-11003'
    },
    medOrder: {
      medication: {
        name: 'Ceftriaxone',
        orderedDose: '1g',
        availableDose: '1g vial',
        route: 'IV q12h',
        frequency: 'SCHEDULED',
        barcode: 'BC-CEFT-1G'
      },
      physician: 'Dr. Rivera'
    },
    twists: {
      malfunction: true,
      decisionPoint: {
        title: "Scanner Error",
        question: "Scanner is not responding. How do you troubleshoot? (Select ALL)",
        isSata: true,
        options: [
          { id: '7a', text: "Restart scanner", isCorrect: true, feedback: "Standard troubleshooting step." },
          { id: '7b', text: "Ignore and continue", isCorrect: false, feedback: "Never skip verification." },
          { id: '7c', text: "Verify patient manually", isCorrect: true, feedback: "Checking ID band and asking name/DOB is the fallback." },
          { id: '7d', text: "Notify IT support", isCorrect: true, feedback: "Important for long-term fix." }
        ]
      },
      administration: {
        question: "What should be reassessed post-administration of Ceftriaxone?",
        options: [
          { id: '7e', text: "Temperature", isCorrect: true, feedback: "Correct. To evaluate antibiotic effectiveness against the fever." },
          { id: '7f', text: "Shoe size", isCorrect: false, feedback: "Irrelevant." }
        ]
      }
    }
  },
  {
    id: 'case-8',
    ward: 'Pedia',
    shift: 'AM',
    studentLogin: 'Nurse_JaneDoe',
    studentId: 'RN-4022',
    supervisor: 'Nurse Supervisor K. Lee, RN',
    patient: {
      name: 'Tin Nola',
      age: 4,
      weight: 16,
      room: 'Pedia-3B',
      priority: 'NORMAL',
      diagnosis: 'Otitis Media',
      allergies: [],
      vitals: [
        { label: 'Temp', value: '38.2', unit: '°C', icon: <Thermometer size={16} />, status: 'high' },
        { label: 'HR', value: '110', icon: <Heart size={16} />, status: 'normal' },
        { label: 'RR', value: '24', icon: <Wind size={16} />, status: 'normal' },
      ],
      nursingNote: "Crying, touching right ear. Fever persistent.",
      endorsement: "Pediatric patient with ear infection. Monitor hydration and pain.",
      mrn: 'MRN-55421'
    },
    medOrder: {
      medication: {
        name: 'Amoxicillin Suspension',
        orderedDose: '250mg',
        availableDose: '250mg/5mL',
        route: 'PO q8h',
        frequency: 'SCHEDULED',
        barcode: 'BC-AMOX-250'
      },
      physician: 'Dr. Park'
    },
    twists: {
      prep: {
        question: "Medication is an oral suspension. What tool will you use?",
        options: [
          { id: '8a', text: "Oral syringe", isCorrect: true, feedback: "Correct for accurate pediatric dosing." },
          { id: '8b', text: "IV line", isCorrect: false, feedback: "Dose is PO (By Mouth)." }
        ]
      }
    }
  },
  {
    id: 'case-9',
    ward: 'Pedia',
    shift: 'PM',
    studentLogin: 'Nurse_JaneDoe',
    studentId: 'RN-4022',
    supervisor: 'Nurse Supervisor K. Lee, RN',
    patient: {
      name: 'Bats Choy',
      age: 5,
      weight: 18,
      room: 'Pedia-3B',
      priority: 'CRITICAL',
      diagnosis: 'Bacterial Pneumonia',
      allergies: ['PENICILLIN'],
      vitals: [
        { label: 'Temp', value: '38.5', unit: '°C', icon: <Thermometer size={16} />, status: 'high' },
        { label: 'RR', value: '24', icon: <Wind size={16} />, status: 'high' },
        { label: 'O2 Sat', value: '92', unit: '%', icon: <Droplets size={16} />, status: 'low' },
      ],
      nursingNote: "Productive cough, high fever. Documented allergy to Penicillin (Rash).",
      endorsement: "Pneumonia patient. Monitor respiratory status closely.",
      mrn: 'MRN-22104'
    },
    medOrder: {
      medication: {
        name: 'Ampicillin',
        orderedDose: '500mg',
        availableDose: '500mg vial',
        route: 'IV q6h',
        frequency: 'SCHEDULED',
        barcode: 'BC-AMP-500'
      },
      physician: 'Dr. Sato'
    },
    twists: {
      scan: {
        alertMsg: "⚠ CRITICAL ALLERGY ALERT: Ampicillin is a Penicillin. Patient has documented Penicillin allergy."
      },
      decisionPoint: {
        title: "CRITICAL ALLERGY ALERT",
        question: "BCMA detect Ampicillin (Penicillin class) conflict with allergy. Actions?",
        options: [
          { id: '9a', text: "Administer anyway", isCorrect: false, fatal: true, feedback: "Fatal alert. Patient develops hives and anaphylaxis." },
          { id: '9b', text: "Hold & Notify Physician", isCorrect: true, feedback: "Correct. Ampicillin is a penicillin and will trigger an allergic reaction." },
          { id: '9c', text: "Override alert", isCorrect: false, fatal: true, feedback: "Fatal alert system override led to code blue." }
        ]
      }
    }
  },
  {
    id: 'case-10',
    ward: 'Pedia',
    shift: 'DAY',
    studentLogin: 'Student_Nurse_Mike',
    studentId: 'SN-1120',
    supervisor: 'Nurse Supervisor L. White, RN',
    patient: {
      name: 'Mamisa Baw',
      age: 8,
      weight: 25,
      room: 'Pedia-2A',
      priority: 'CLOSE MONITORING',
      diagnosis: 'Post-Appendectomy Day 1',
      allergies: [],
      vitals: [
        { label: 'BP', value: '110/72', icon: <Activity size={16} />, status: 'normal' },
        { label: 'HR', value: '98', icon: <Heart size={16} />, status: 'normal' },
        { label: 'Pain', value: '7/10', icon: <AlertCircle size={16} />, status: 'high' },
      ],
      nursingNote: "Mamisa is holding his abdomen. Pain is severe.",
      endorsement: "Post-op Day 1. Complaining of 7/10 pain. Order for PRN analgesics.",
      mrn: 'MRN-33041'
    },
    medOrder: {
      medication: {
        name: 'Acetaminophen',
        orderedDose: '400mg',
        availableDose: '500mg table (ADULT formula)',
        route: 'PO PRN',
        frequency: 'PRN',
        barcode: 'BC-ACE-500'
      },
      physician: 'Dr. Drake'
    },
    twists: {
      prep: {
        question: "Safe pediatric dose is 10mg/kg (250-375mg). Max 400mg ordered. Scanned med is 500mg. Action?",
        options: [
          { id: '10a', text: "Give full 500mg tablet", isCorrect: false, feedback: "Overdose risk! Liver toxicity is a significant danger in children." },
          { id: '10b', text: "Hold medication, notify the physician and consult the pharmacist", isCorrect: true, feedback: "Correct. You hold the medication, notify the physician and consult the pharmacist. The pharmacist provides a new pediatric-dose tablet (250mg) to replace the adult dosage." },
          { id: '10c', text: "Split tablet (250mg)", isCorrect: false, feedback: "Inaccurate dosing. Splitting non-scored tablets is unsafe." }
        ]
      }
    }
  }
];

// --- Utilities ---

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// --- Components ---

const AlertPanel = ({ type, message, onDismiss }: { type: 'INFO' | 'WARNING' | 'CRITICAL', message: string, onDismiss?: () => void }) => {
  const styles = {
    INFO: 'border-accent-teal bg-accent-teal/10 text-accent-teal shadow-[0_0_15px_rgba(0,212,200,0.2)]',
    WARNING: 'border-accent-amber bg-accent-amber/10 text-accent-amber pulse-amber border-2 shadow-[0_0_20px_rgba(255,179,71,0.2)]',
    CRITICAL: 'border-accent-crimson bg-accent-crimson/10 text-accent-crimson pulse-crimson border-4 shadow-[0_0_30px_rgba(255,68,68,0.3)]'
  };

  const icons = {
    INFO: <Info className="shrink-0" />,
    WARNING: <AlertTriangle className="shrink-0" />,
    CRITICAL: <ShieldAlert className="shrink-0" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("p-4 rounded-xl flex items-start gap-4 mb-6", styles[type])}
    >
      <div className="mt-1">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-mono text-sm font-bold uppercase tracking-wider mb-1">{type}</h4>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded transition-colors">
          <X size={18} />
        </button>
      )}
    </motion.div>
  );
};

const Header = ({ studentInfo }: { studentInfo?: { login: string, id: string } }) => {
  return (
    <header className="h-16 border-b border-white/10 bg-hospital-slate/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center text-hospital-navy">
          <Database size={20} />
        </div>
        <div>
          <h1 className="font-mono text-sm font-bold tracking-tighter uppercase leading-none">Scan2<span className="text-accent-teal">BSafe</span></h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">BCMA Simulation Unit</p>
        </div>
      </div>

      {studentInfo && (
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
             <div className="flex flex-col items-end">
                <span className="text-slate-400">SESSION</span>
                <span className="text-white font-bold">{studentInfo.id}</span>
             </div>
             <div className="w-[1px] h-6 bg-white/10" />
             <div className="flex flex-col items-start px-3 py-1 bg-white/5 border border-white/10 rounded">
                <span className="text-slate-400 text-[10px]">USER</span>
                <span className="text-accent-teal font-bold">{studentInfo.login}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-accent-crimson/10 border border-accent-crimson/30 rounded text-accent-crimson text-[10px] font-mono animate-pulse uppercase">
             <div className="w-1.5 h-1.5 bg-accent-crimson rounded-full" />
             LIVE SCANNER
          </div>
        </div>
      )}
    </header>
  );
};

const StepIndicator = ({ current, total }: { current: number, total: number }) => {
  const progress = (current / total) * 100;
  return (
    <div className="fixed bottom-0 left-0 w-full bg-hospital-navy/80 backdrop-blur-sm px-6 py-3 border-t border-white/5 flex items-center justify-between z-40">
       <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase shrink-0">STEP {current} OF {total}</div>
          <div className="h-1 bg-white/10 rounded-full flex-1 overflow-hidden">
             <motion.div 
               className="h-full bg-accent-teal" 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ type: 'spring', damping: 20, stiffness: 50 }}
             />
          </div>
       </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<string>('login');
  const [selectedCase, setSelectedCase] = useState<CaseScenario | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ login: string, id: string } | null>(null);
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(100);
  const [errors, setErrors] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [safetyLog, setSafetyLog] = useState({
    handHygiene: 'PENDING',
    bcmaVerification: 'PENDING',
    fiveRights: 'PENDING',
    clinicalJudgment: 'PENDING',
    documentation: 'PENDING',
    emergencyResponse: 'N/A'
  });
  
  // Simulation State
  const [handHygienePerformed, setHandHygienePerformed] = useState(false);
  const [prepAnswered, setPrepAnswered] = useState(false);
  const [isScanningPatient, setIsScanningPatient] = useState(false);
  const [patientScanned, setPatientScanned] = useState(false);
  const [isScanningMedication, setIsScanningMedication] = useState(false);
  const [medicationScanned, setMedicationScanned] = useState(false);
  const [fiveRights, setFiveRights] = useState<Record<string, boolean>>({
    patient: false,
    drug: false,
    dose: false,
    route: false,
    time: false
  });
  const [decisionAnswered, setDecisionAnswered] = useState(false);
  const [adminAnswered, setAdminAnswered] = useState(false);
  const [adverseEventTriggered, setAdverseEventTriggered] = useState(false);
  const [adminComplete, setAdminComplete] = useState(false);
  const [formData, setFormData] = useState({ eMarNote: '' });
  const [currentTwistFeedback, setCurrentTwistFeedback] = useState<string | null>(null);
  const [currentTwistFatal, setCurrentTwistFatal] = useState(false);
  const [sataSelections, setSataSelections] = useState<string[]>([]);

  // Custom simulation states for enhanced pathways
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [selectedPrepOption, setSelectedPrepOption] = useState<string | null>(null);
  const [selectedAdminOption, setSelectedAdminOption] = useState<string | null>(null);
  const [selectedDecisionOption, setSelectedDecisionOption] = useState<string | null>(null);
  const [isNewMedicationScanned, setIsNewMedicationScanned] = useState(false);
  const [isWristbandChanged, setIsWristbandChanged] = useState(false);
  const [isWristbandVerifying, setIsWristbandVerifying] = useState(false);
  const [wristbandVerified, setWristbandVerified] = useState(false);
  const [hasDoseDiscrepancy, setHasDoseDiscrepancy] = useState(false);
  const [isNewDoseScanned, setIsNewDoseScanned] = useState(false);
  const [deteriorationStep, setDeteriorationStep] = useState(0);
  const [hasLabAlert, setHasLabAlert] = useState(false);
  const [activeResponseStep, setActiveResponseStep] = useState(0);

  useEffect(() => {
    if (selectedCase) {
      setCurrentMedication(selectedCase.medOrder.medication);
    } else {
      setCurrentMedication(null);
    }
    setSelectedPrepOption(null);
    setSelectedAdminOption(null);
    setSelectedDecisionOption(null);
    setIsNewMedicationScanned(false);
    setIsWristbandChanged(false);
    setIsWristbandVerifying(false);
    setWristbandVerified(false);
    setHasDoseDiscrepancy(false);
    setIsNewDoseScanned(false);
    setDeteriorationStep(0);
    setHasLabAlert(false);
    setActiveResponseStep(0);
  }, [selectedCase]);

  const totalSteps = selectedCase ? 15 : 0;

  const nextStep = (nextScreen: string) => {
    setStep(prev => prev + 1);
    setScreen(nextScreen);
  };

  const handleFatal = (feedback: string) => {
    setScore(0);
    setErrors(prev => [...prev, feedback]);
    setScreen('results');
  };

  // --- Screen Handlers ---

  const renderLogin = () => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const login = (form.elements.namedItem('username') as HTMLInputElement).value;
      const id = (form.elements.namedItem('studentid') as HTMLInputElement).value;
      setStudentInfo({ login, id });
      setScreen('selection');
    };

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-accent-teal/20 text-accent-teal rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/10">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="font-mono text-xl font-bold text-center mb-2">SYSTEM ACCESS</h2>
          <p className="text-slate-400 text-sm text-center mb-8 uppercase tracking-widest font-mono">Input Credentials to Initialize</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input required name="username" type="text" placeholder="e.g. Nurse_JaneDoe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all outline-none text-sm font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider ml-1">Student / RN ID</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input required name="studentid" type="text" placeholder="e.g. SN-4022" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all outline-none text-sm font-mono" />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-accent-teal/80 to-accent-teal text-hospital-navy font-bold py-4 rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group font-mono uppercase text-sm">
              Initialize Environment
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </form>
          
          <div className="mt-12 pt-12 border-t border-white/5 flex justify-between items-center opacity-40 grayscale pointer-events-none">
             <Activity size={24} />
             <Activity size={24} />
             <Activity size={24} />
          </div>
        </motion.div>
      </div>
    );
  };

  const renderSelection = () => {
    const wards: WardType[] = ['Medical', 'Surgery', 'OB', 'Pedia'];
    
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 pb-24">
        <div className="mb-12">
          <h2 className="font-mono text-2xl font-bold mb-2">WARD SELECTION</h2>
          <p className="text-slate-400 text-sm">Select an active clinical case to begin simulation.</p>
        </div>

        <div className="space-y-16">
          {wards.map(ward => (
            <section key={ward}>
              <div className="flex items-center gap-4 mb-6">
                <div className="px-3 py-1 bg-accent-teal/10 border border-accent-teal/20 rounded-full text-accent-teal text-[10px] font-mono uppercase tracking-widest leading-none">ACTIVE {ward.toUpperCase()} UNIT</div>
                <div className="h-[1px] bg-white/5 flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_CASES.filter(c => c.ward === ward)
                  .sort((a, b) => a.patient.name.localeCompare(b.patient.name))
                  .map(c => (
                  <motion.button
                    key={c.id}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                        setSelectedCase(c);
                        setScreen('endorsement');
                        setStep(3);
                    }}
                    className="flex flex-col text-left bg-hospital-slate/40 border border-white/10 rounded-3xl overflow-hidden hover:border-accent-teal/30 hover:bg-hospital-slate/60 transition-all group relative"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
                          c.patient.priority === 'CRITICAL' ? 'bg-accent-crimson/20 text-accent-crimson' : 
                          c.patient.priority === 'EMERGENCY' ? 'bg-accent-amber/20 text-accent-amber' : 
                          'bg-accent-teal/20 text-accent-teal'
                        )}>
                          {c.patient.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">ROOM {c.patient.room}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{c.patient.name}</h3>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-1">{c.patient.diagnosis}</p>
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2 font-mono">
                          <Clock size={12} />
                          {c.shift} SHIFT
                        </div>
                        <div className="flex items-center gap-1 group-hover:text-accent-teal transition-colors">
                           START CASE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  };

  const renderEndorsement = () => {
    if (!selectedCase) return null;
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-3xl bg-white text-hospital-navy p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          {/* Clipboard Style */}
          <div className="absolute top-0 left-0 w-full h-12 bg-slate-200 flex items-center justify-center border-b shadow-sm">
             <div className="w-24 h-4 bg-slate-400 rounded-full" />
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-start mb-8 border-b border-hospital-navy/10 pb-6">
               <div>
                  <h2 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">SHIFT ENDORSEMENT</h2>
                  <p className="text-2xl font-bold tracking-tight">Shift Handoff Summary</p>
               </div>
               <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5">
                  <p>UNIT: MEDICAL-{selectedCase.ward.toUpperCase()}</p>
                  <p>DATE: 2026-05-19</p>
                  <p>SUPERVISOR: {selectedCase.supervisor}</p>
               </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 italic text-lg leading-relaxed text-slate-700">
              "{selectedCase.patient.endorsement}"
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
               <div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3">CURRENT NURSE</h4>
                  <p className="font-medium text-hospital-navy">M. Santos, RN (outgoing)</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3">INCOMING NURSE</h4>
                  <p className="font-medium text-hospital-navy">{studentInfo?.login} (incoming)</p>
               </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => nextStep('profile')}
                className="w-full bg-hospital-navy text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group"
              >
                TAKE OVER CARE 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  setSelectedCase(null);
                  setScreen('selection');
                }}
                className="w-full bg-transparent hover:bg-slate-100 text-slate-500 hover:text-hospital-navy font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wider font-mono"
              >
                ← Back to Ward Selection
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderProfile = () => {
     if (!selectedCase) return null;
     const p = selectedCase.patient;
     return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24 font-sans">
           <div className="flex flex-col md:flex-row gap-8 mb-12 items-start">
              <div className="grow">
                 <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                       "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                       p.priority === 'CRITICAL' ? 'bg-accent-crimson/20 text-accent-crimson' : 'bg-accent-teal/20 text-accent-teal'
                    )}>{p.priority}</div>
                    <div className="text-slate-500 font-mono text-[10px]">MRN: {p.mrn}</div>
                 </div>
                 <h2 className="text-4xl font-bold mb-4">{p.name}</h2>
                 <div className="flex flex-wrap gap-4 text-sm">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono">AGE: {p.age}</div>
                    {p.weight && <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono">WEIGHT: {p.weight}kg</div>}
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono">ROOM: {p.room}</div>
                 </div>
              </div>

              {p.allergies.length > 0 && (
                 <div className="bg-accent-crimson/10 border border-accent-crimson/30 p-6 rounded-3xl shrink-0 w-full md:w-64 pulse-crimson">
                    <div className="flex items-center gap-2 text-accent-crimson font-bold uppercase text-[10px] tracking-widest mb-3">
                       <AlertTriangle size={14} />
                       CRITICAL ALLERGIES
                    </div>
                    {p.allergies.map(a => (
                       <div key={a} className="font-mono text-sm font-bold text-accent-crimson mb-1">— {a}</div>
                    ))}
                 </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="md:col-span-2 space-y-6">
                 <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                    <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Activity size={14} /> LATEST CLINICAL VITALS
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {p.vitals.map(v => (
                          <div key={v.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-colors">
                             <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                v.status === 'low' ? 'bg-blue-500/20 text-blue-400' :
                                v.status === 'high' || v.status === 'critical' ? 'bg-accent-crimson/20 text-accent-crimson' :
                                'bg-accent-teal/20 text-accent-teal'
                             )}>
                                {v.icon}
                             </div>
                             <div>
                                <div className="text-[10px] font-mono text-slate-400 uppercase">{v.label}</div>
                                <div className="font-bold text-lg font-mono leading-none">{v.value}<span className="text-xs font-normal ml-0.5 opacity-60">{v.unit}</span></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl">
                    <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ClipboardCheck size={14} /> NURSING NOTES
                    </h3>
                    <p className="text-lg text-slate-300 leading-relaxed italic">"{p.nursingNote}"</p>
                    {(p.ivf || p.ivAccess) && (
                       <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-xs font-mono">
                          <div>
                             <span className="text-slate-500 uppercase block mb-1">IV FLUIDS</span>
                             <span className="text-accent-teal">{p.ivf || 'N/A'}</span>
                          </div>
                          <div>
                             <span className="text-slate-500 uppercase block mb-1">IV ACCESS</span>
                             <span className="text-accent-teal">{p.ivAccess || 'N/A'}</span>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              <div className="space-y-6">
                  <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl h-full flex flex-col">
                     <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">DIAGNOSIS</h3>
                     <p className="text-xl font-bold text-white mb-auto">{p.diagnosis}</p>
                     
                     <button 
                        onClick={() => nextStep('order')}
                        className="mt-8 w-full bg-accent-teal text-hospital-navy font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-400 transition-all font-mono uppercase text-sm"
                     >
                        VIEW ACTIVE ORDERS <ArrowRight size={18} />
                     </button>
                  </div>
              </div>
           </div>
        </div>
     );
  };

  const renderOrder = () => {
    if (!selectedCase) return null;
    const o = selectedCase.medOrder;
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 pb-24">
         <div className="mb-10 flex items-center justify-between">
            <div>
               <h2 className="font-mono text-2xl font-bold">eMAR ACTIVE ORDERS</h2>
               <p className="text-slate-400 text-sm">Verify physician orders before preparation.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-400">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
               SYSTEM SYNCHRONIZED
            </div>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-hospital-slate/40 border-l-4 border-l-accent-teal border-y border-r border-white/10 rounded-3xl overflow-hidden"
         >
            <div className="p-10">
               <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pt-2">
                  <div>
                     <span className="bg-accent-teal/10 text-accent-teal text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">MEDICATION ORDER #8221</span>
                     <h3 className="text-3xl font-bold mb-2">{o.medication.name}</h3>
                     <p className="text-slate-400 font-mono">AUTHORIZED BY: {o.physician}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl flex items-center gap-4 text-accent-teal border border-white/5">
                     <Clock size={32} />
                     <div>
                        <div className="text-[10px] font-mono uppercase opacity-60">Frequency</div>
                        <div className="text-xl font-bold font-mono">{o.medication.frequency}</div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                  <div className="space-y-4">
                     <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">DOSE TO ADMINISTER</span>
                        <span className="text-xl font-bold font-mono text-white">{o.medication.orderedDose}</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">ADMINISTRATION ROUTE</span>
                        <span className="text-xl font-bold font-mono text-white">{o.medication.route}</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">SUPPLY AVAILABLE</span>
                        <span className="text-xl font-bold font-mono text-slate-400">{o.medication.availableDose}</span>
                     </div>
                     {o.medication.highAlert && (
                         <div className="flex items-center gap-3 p-3 bg-accent-crimson/10 border border-accent-crimson/20 rounded-xl">
                            <ShieldAlert className="text-accent-crimson" size={20} />
                            <span className="text-[10px] font-mono font-bold text-accent-crimson uppercase">HIGH-ALERT MEDICATION - DUAL SIGN-OFF REQUIRED</span>
                         </div>
                     )}
                  </div>
               </div>

               <div className="mt-10 flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={() => nextStep('hygiene')}
                    className="flex-1 bg-white text-hospital-navy font-bold py-5 rounded-2xl hover:bg-slate-100 transition-all text-center flex items-center justify-center gap-3 group"
                  >
                     PROCEDURE INITIATION 
                     <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
         </motion.div>
      </div>
    );
  };

  const renderHygiene = () => {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
         <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-hospital-slate/40 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl text-center"
         >
            <div className="relative mb-10 inline-block">
               <div className="w-24 h-24 bg-accent-teal/20 rounded-3xl flex items-center justify-center text-accent-teal mx-auto relative z-10">
                  <Hand size={48} />
               </div>
               <div className="absolute -inset-4 bg-accent-teal/5 rounded-full pulse-teal" />
            </div>
            <h2 className="font-mono text-xl font-bold mb-3 uppercase tracking-tighter">Hand Hygiene Protocol</h2>
            <p className="text-slate-400 text-sm mb-10">Always sanitize hands before preparing or administering medications.</p>
            
            <div className="space-y-4">
               <button 
                  onClick={() => {
                     setHandHygienePerformed(true);
                     setSafetyLog(prev => ({ ...prev, handHygiene: 'PASS' }));
                     setStrengths(prev => [...prev, 'Followed hand hygiene protocol prior to care']);
                     nextStep('prep');
                  }}
                  className="w-full py-5 bg-accent-teal text-hospital-navy font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-mono uppercase"
               >
                  Perform Hygiene
               </button>
               <button 
                  onClick={() => {
                     setHandHygienePerformed(false);
                     setScore(prev => prev - 10);
                     setErrors(prev => [...prev, 'Skipped critical hand hygiene step.']);
                     setSafetyLog(prev => ({ ...prev, handHygiene: 'FAIL' }));
                     nextStep('prep');
                  }}
                  className="w-full py-5 text-slate-500 border border-white/5 hover:bg-white/5 rounded-2xl transition-all font-mono text-xs uppercase"
               >
                  Skip Procedure
               </button>
            </div>
         </motion.div>
      </div>
    );
  };

  const renderPrep = () => {
    if (!selectedCase) return null;
    const twist = selectedCase.twists.prep;
    const med = currentMedication || selectedCase.medOrder.medication;
    
    return (
       <div className="max-w-4xl mx-auto p-6 md:p-12">
          <div className="flex items-center gap-3 mb-8 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
             <Layers size={14} /> MEDICATION PREPARATION UNIT
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl">
                   <h4 className="font-mono text-[10px] text-slate-500 uppercase mb-4">Medication Label Recognition</h4>
                   <div className="p-6 bg-white rounded-xl text-hospital-navy border-b-4 border-slate-300">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-12 h-6 bg-slate-200" />
                         <span className="text-[8px] font-mono opacity-60">RX: 99120-A</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase mb-1">{med.name}</h3>
                      <div className="text-[10px] font-mono opacity-60 mb-4">{med.availableDose}</div>
                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <div className="w-20 h-2 bg-slate-100" />
                            <div className="w-16 h-2 bg-slate-100" />
                            <div className="w-24 h-2 bg-slate-100" />
                         </div>
                         <div className="text-[8px] font-mono">EXP: 12/2027</div>
                      </div>
                   </div>
                </div>

                <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-3xl">
                   <h4 className="font-mono text-[10px] text-slate-500 uppercase mb-4">Dosage Computation Verification</h4>
                   <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between text-xs font-mono">
                         <span className="text-slate-500 uppercase">Input Required Dosage</span>
                         <span className="text-accent-teal">{med.orderedDose}</span>
                      </div>
                      <div className="h-[1px] bg-white/5" />
                      <div className="flex justify-between text-xs font-mono">
                         <span className="text-slate-500 uppercase">Available Strength</span>
                         <span className="text-slate-300">{med.availableDose}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                {twist ? (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="bg-accent-amber/10 border border-accent-amber/30 p-8 rounded-[2.5rem] h-full"
                   >
                      <div className="w-12 h-12 bg-accent-amber text-hospital-navy rounded-2xl flex items-center justify-center mb-6">
                         <Zap size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-4">{twist.question}</h3>
                      <div className="space-y-3">
                         {twist.options.map(opt => {
                            const isSelected = selectedPrepOption === opt.id;
                            return (
                               <button 
                                  key={opt.id}
                                  onClick={() => {
                                     setSelectedPrepOption(opt.id);
                                     if (!opt.isCorrect) {
                                        setScore(prev => prev - 10);
                                        setErrors(prev => [...prev, opt.feedback]);
                                     } else {
                                        setStrengths(prev => [...prev, 'Correctly handled preparation clinical judgment']);
                                     }
                                     let feedback = opt.feedback;
                                     if (selectedCase.id === 'case-10' && opt.id === '10b') {
                                        feedback = "Correct. You hold the medication, notify the physician and consult the pharmacist. The pharmacist provides a new pediatric-dose tablet (250mg) to replace the adult dosage.";
                                     }
                                     setCurrentTwistFeedback(feedback);
                                     setPrepAnswered(true);
                                  }}
                                  disabled={prepAnswered}
                                  className={cn(
                                     "w-full p-4 rounded-2xl border transition-all text-left text-sm font-medium",
                                     prepAnswered && opt.isCorrect ? 'bg-accent-teal/20 border-accent-teal text-accent-teal font-bold' :
                                     prepAnswered && isSelected && !opt.isCorrect ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson font-bold' :
                                     prepAnswered ? 'bg-white/5 border-white/10 opacity-50' :
                                     'bg-white/5 border-white/10 hover:border-accent-amber/50 hover:bg-white/10'
                                  )}
                               >
                                  {opt.text}
                               </button>
                            );
                         })}
                      </div>

                      <AnimatePresence>
                         {prepAnswered && currentTwistFeedback && (
                            <motion.div 
                               initial={{ opacity: 0, y: 10 }} 
                               animate={{ opacity: 1, y: 0 }}
                               className="mt-8 pt-8 border-t border-accent-amber/20"
                            >
                               <div className="bg-white/5 p-4 rounded-xl text-xs leading-relaxed text-slate-300 italic mb-6">
                                  {currentTwistFeedback}
                               </div>

                               {selectedCase.id === 'case-10' && selectedPrepOption === '10b' && !isNewMedicationScanned ? (
                                  <div className="space-y-4">
                                     <p className="text-xs text-slate-400">Scan the new 250mg pediatric dose package received from pharmacy to proceed.</p>
                                     
                                     <button 
                                        onClick={() => {
                                           setIsNewMedicationScanned(true);
                                           setCurrentMedication({
                                              name: 'Acetaminophen (Pediatric)',
                                              orderedDose: '250mg',
                                              availableDose: '250mg tablet',
                                              route: 'PO PRN',
                                              frequency: 'PRN',
                                              barcode: 'BC-ACE-250'
                                           });
                                           setStrengths(prev => [...prev, 'Scanned safe rectified pediatric dose package']);
                                        }}
                                        className="w-full py-4 bg-accent-teal text-hospital-navy font-bold rounded-xl text-sm transition-all"
                                     >
                                        Scan new Pediatric 250mg package
                                     </button>
                                  </div>
                               ) : selectedCase.id === 'case-10' && selectedPrepOption === '10b' && isNewMedicationScanned ? (
                                  <div className="space-y-4">
                                     <div className="p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-xl flex items-center gap-4 text-accent-teal text-xs">
                                        <CheckCircle2 size={18} />
                                        <span>Pediatric 250mg dose package confirmed. Ready to scan patient.</span>
                                     </div>
                                     
                                     <button 
                                        onClick={() => {
                                           setCurrentTwistFeedback(null);
                                           nextStep('scan-patient');
                                        }}
                                        className="w-full py-4 bg-accent-amber text-hospital-navy font-bold rounded-xl transition-all"
                                     >
                                        PROCEED TO SCANNING PATIENT
                                     </button>
                                  </div>
                               ) : (
                                  <button 
                                     onClick={() => {
                                        setCurrentTwistFeedback(null);
                                        nextStep('scan-patient');
                                     }}
                                     className="w-full py-4 bg-accent-amber text-hospital-navy font-bold rounded-xl transition-all"
                                  >
                                     PROCEED TO SCANNING
                                  </button>
                               )}
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </motion.div>
                ) : (
                   <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-[2.5rem] h-full flex flex-col justify-between">
                      <div>
                         <h3 className="text-xl font-bold mb-4">Medication Prepared</h3>
                         <p className="text-slate-400 text-sm">Verify the preparation complies with the five rights and proceed to patient identification.</p>
                      </div>
                      <button 
                         onClick={() => nextStep('scan-patient')}
                         className="w-full py-4 bg-accent-teal text-hospital-navy font-bold rounded-xl flex items-center justify-center gap-2 group transition-all"
                      >
                         SCAN PATIENT WRISTBAND <Smartphone size={18} />
                      </button>
                   </div>
                )}
             </div>
          </div>
       </div>
    );
  };

  const renderScanPatient = () => {
    const triggerScan = () => {
       setIsScanningPatient(true);
       setTimeout(() => {
          setIsScanningPatient(false);
          setPatientScanned(true);
          const override = selectedCase?.twists.scan?.patientBarcodeOverride;
          if (override && !(selectedCase?.id === 'case-1' && isWristbandChanged)) {
             setSafetyLog(prev => ({ ...prev, bcmaVerification: 'PARTIAL' }));
          } else {
             setStrengths(prev => [...prev, 'Accurately scanned and verified patient identity via BCMA']);
          }
       }, 1500);
    };

    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
          <div className="w-full max-w-xl text-center mb-12">
             <h2 className="text-2xl font-bold mb-4 uppercase font-mono tracking-tighter">Point-of-Care Identification</h2>
             <p className="text-slate-400">Position the mobile scanner over the patient's wristband barcode.</p>
          </div>

          <div className="relative mb-12">
             <div className="w-80 h-48 border-4 border-dashed border-white/10 rounded-[3rem] flex items-center justify-center relative bg-black/20">
                {/* Wristband Representation */}
                <div className="w-56 h-12 bg-white rounded-full flex items-center px-6 relative overflow-hidden">
                   <div className="text-[10px] font-mono text-slate-800 font-bold uppercase tracking-widest">
                      {selectedCase?.id === 'case-1' && !isWristbandChanged ? 'Sisig Gang' : selectedCase?.patient.name}
                   </div>
                   <div className="ml-auto flex items-center gap-1 opacity-40 grayscale">
                      <div className="w-1 h-8 bg-black" />
                      <div className="w-2 h-8 bg-black" />
                      <div className="w-1 h-8 bg-black" />
                      <div className="w-0.5 h-8 bg-black" />
                      <div className="w-3 h-8 bg-black" />
                      <div className="w-1 h-8 bg-black" />
                   </div>
                </div>

                {isScanningPatient && (
                   <motion.div 
                     initial={{ top: '10%' }}
                     animate={{ top: '80%' }}
                     transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', repeatType: 'reverse' }}
                     className="absolute left-0 w-full h-1 bg-accent-teal shadow-[0_0_15px_#00D4C8] z-20"
                   />
                )}
             </div>
             
             <div className="absolute -top-10 -right-10 w-24 h-24 border-t-4 border-r-4 border-accent-teal rounded-tr-[2rem] opacity-20" />
             <div className="absolute -bottom-10 -left-10 w-24 h-24 border-b-4 border-l-4 border-accent-teal rounded-bl-[2rem] opacity-20" />
          </div>

          {!patientScanned ? (
             <button 
                onClick={triggerScan}
                disabled={isScanningPatient}
                className="px-12 py-5 bg-accent-teal text-hospital-navy font-bold rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/10 font-mono"
             >
                {isScanningPatient ? <Loader2 className="animate-spin" /> : <Scan />}
                {isScanningPatient ? 'READING BARCODE...' : 'INITIATE CAPTURE'}
             </button>
          ) : (
             <div className="space-y-6 w-full max-w-lg">
                {selectedCase?.id === 'case-1' && !isWristbandChanged ? (
                   <div className="space-y-6">
                      <AlertPanel type="WARNING" message={selectedCase.twists.scan!.alertMsg!} />
                      
                      <div className="bg-hospital-slate/40 border border-white/10 p-6 rounded-2xl">
                         <h4 className="font-mono text-xs font-bold text-accent-amber uppercase mb-4">Mismatched Wristband Action Required</h4>
                         <p className="text-sm text-slate-300 mb-6">The scanned patient wristband ("Sisig Gang") does not match the active eMAR record ("Sinig Gang"). Choose your next action:</p>
                                <div className="space-y-3">
                            <button 
                               onClick={() => handleFatal("Fatal Error: Administered medication to a patient with an incorrect identity wristband without resolving the name discrepancy. This is a severe clinical safety failure.")}
                               className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 text-left text-sm font-medium transition-all text-slate-300"
                            >
                               Proceed to administer medication anyway
                            </button>
                            
                            <button 
                               onClick={() => {
                                  setIsWristbandVerifying(true);
                                }}
                               className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 text-left text-sm font-medium transition-all text-slate-300"
                            >
                               Ask the patient to state their full name and birthday for manual identity verification
                            </button>
                         </div>
                      </div>

                      {isWristbandVerifying && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6"
                         >
                            <div className="p-4 bg-slate-100/5 rounded-xl border border-white/5 italic text-sm text-slate-300">
                               "The patient states: 'My name is Sinig Gang, and my birthday is June 14, 1945.'"
                            </div>
                            <p className="text-xs text-slate-400">Verbal identity matches eMAR details. You must obtain and apply the correct wristband before administering care.</p>
                            
                            <button 
                               onClick={() => {
                                  setIsWristbandChanged(true);
                                  setPatientScanned(false); // Let them scan again with correct wristband!
                                  setIsWristbandVerifying(false);
                                  setStrengths(prev => [...prev, 'Appropriately verified identity verbally and replaced mismatched wristband']);
                               }}
                               className="w-full py-4 bg-accent-teal text-hospital-navy font-bold rounded-xl text-sm transition-all"
                            >
                               Apply Correct, Updated Wristband
                            </button>
                         </motion.div>
                      )}
                   </div>
                ) : (
                   <div className="space-y-6">
                      {selectedCase?.twists.scan?.patientBarcodeOverride && !(selectedCase?.id === 'case-1' && isWristbandChanged) ? (
                         <AlertPanel type="WARNING" message={selectedCase.twists.scan.alertMsg!} />
                      ) : (
                         <div className="p-6 bg-accent-teal/10 border border-accent-teal/30 rounded-3xl flex items-center gap-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-14 h-14 bg-accent-teal rounded-2xl flex items-center justify-center text-hospital-navy">
                               <CheckCircle2 size={32} />
                            </div>
                            <div>
                               <div className="text-[10px] font-mono text-slate-400 uppercase">IDENTIFICATION CONFIRMED</div>
                               <div className="text-lg font-bold">{selectedCase?.patient.name}</div>
                            </div>
                         </div>
                      )}
                      
                      <button 
                         onClick={() => nextStep('scan-med')}
                         className="w-full py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-mono"
                      >
                         NEXT: SCAN MEDICATION BARCODE <Plus />
                      </button>
                   </div>
                )}
             </div>
          )}
       </div>
    );
  };

  const renderScanMed = () => {
    const triggerScan = () => {
       setIsScanningMedication(true);
       setTimeout(() => {
          setIsScanningMedication(false);
          setMedicationScanned(true);
          const needsAlert = selectedCase?.twists.scan?.alertMsg && !selectedCase?.twists.scan?.patientBarcodeOverride;
          if (needsAlert || selectedCase?.twists.decisionPoint?.title.includes('ALLERGY')) {
             setSafetyLog(prev => ({ ...prev, bcmaVerification: 'PARTIAL' }));
          } else {
             setStrengths(prev => [...prev, 'Verified correct medication and dose via BCMA system']);
             setSafetyLog(prev => ({ ...prev, bcmaVerification: 'PASS' }));
          }
       }, 1500);
    };

    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-6">
          <div className="w-full max-w-xl text-center mb-12">
             <h2 className="text-2xl font-bold mb-4 uppercase font-mono tracking-tighter">Medication Authentication</h2>
             <p className="text-slate-400">Scan the unit-dose packaging to verify against the eMAR server.</p>
          </div>

          <div className="relative mb-12">
             <div className="w-64 h-64 border-4 border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center relative bg-black/20 group overflow-hidden">
                <AnimatePresence mode="wait">
                  {!medicationScanned ? (
                    <motion.div 
                      key="pack" 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-32 h-40 bg-white rounded-lg shadow-xl p-4 flex flex-col items-center rotate-3 border-b-8 border-slate-300">
                         <div className="w-full h-8 bg-slate-100 mb-4" />
                         <div className="w-20 h-1 bg-slate-200 mb-1" />
                         <div className="w-16 h-1 bg-slate-200 mb-auto" />
                         <div className="w-full h-6 flex items-center justify-center gap-0.5 mt-4 opacity-50 grayscale">
                            {[1,4,2,6,3,5,1,2].map((w, i) => <div key={i} className="h-full bg-black shrink-0" style={{ width: `${w}px` }} />)}
                         </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                       key="done"
                       initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                       className="flex flex-col items-center text-accent-teal"
                    >
                       <ShieldCheck size={80} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isScanningMedication && (
                   <motion.div 
                     initial={{ top: '10%' }}
                     animate={{ top: '90%' }}
                     transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', repeatType: 'reverse' }}
                     className="absolute left-0 w-full h-1 bg-accent-teal shadow-[0_0_15px_#00D4C8] z-20"
                   />
                )}
             </div>
          </div>

          {!medicationScanned ? (
             <button 
                onClick={triggerScan}
                disabled={isScanningMedication}
                className="px-12 py-5 bg-accent-teal text-hospital-navy font-bold rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-teal-500/10 font-mono"
             >
                {isScanningMedication ? <Loader2 className="animate-spin" /> : <Scan />}
                {isScanningMedication ? 'VERIFYING...' : 'SCAN PACKAGE'}
             </button>
          ) : (
             <div className="space-y-6 w-full max-w-lg">
                {selectedCase?.id === 'case-2' && !isNewMedicationScanned ? (
                   <div className="space-y-6">
                      <AlertPanel type="WARNING" message={selectedCase.twists.scan!.alertMsg!} />
                      
                      <div className="bg-hospital-slate/40 border border-white/10 p-6 rounded-2xl">
                         <h4 className="font-mono text-xs font-bold text-accent-amber uppercase mb-4">Medication Timing/Type Mismatch Action Required</h4>
                         <p className="text-sm text-slate-300 mb-6">The scanned package is the Routine dose. The active eMAR order requires a STAT dose. Choose your action:</p>
                                <div className="space-y-3">
                            <button 
                               onClick={() => handleFatal("Fatal Error: Administered routine medication dose instead of STAT dose. This timing mismatch violates critical acute-care safety guidelines.")}
                               className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 text-left text-sm font-medium transition-all text-slate-300"
                            >
                               Proceed to administer this routine dose anyway
                            </button>
                            
                            <button 
                               onClick={() => {
                                  setHasDoseDiscrepancy(true);
                                }}
                               className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 text-left text-sm font-medium transition-all text-slate-300"
                            >
                               Notify physician and pharmacy to rectify the order and obtain the STAT dose
                            </button>
                         </div>
                      </div>

                      {hasDoseDiscrepancy && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6"
                         >
                            <p className="text-xs text-slate-300 font-mono text-xs">
                               The physician updates the system, and the pharmacy immediately delivers the correct <strong>Salbutamol STAT Nebulizer</strong>.
                            </p>
                            
                            <button 
                               onClick={() => {
                                  setIsNewMedicationScanned(true);
                                  setCurrentMedication({
                                     name: 'Salbutamol STAT Nebulizer',
                                     orderedDose: '5mg/10mL',
                                     availableDose: '5mg/10mL unit pack',
                                     route: 'Inhalation',
                                     frequency: 'STAT',
                                     barcode: 'BC-SAL-STAT'
                                  });
                                  setStrengths(prev => [...prev, 'Successfully notified the team and scanned correct STAT medication']);
                               }}
                               className="w-full py-4 bg-accent-teal text-hospital-navy font-bold rounded-xl text-sm transition-all"
                            >
                               Scan the New STAT Medication Package
                            </button>
                         </motion.div>
                      )}
                   </div>
                ) : selectedCase?.id === 'case-2' && isNewMedicationScanned ? (
                   <div className="space-y-6">
                      <div className="p-6 bg-accent-teal/10 border border-accent-teal/30 rounded-3xl flex items-center gap-6">
                         <div className="w-14 h-14 bg-accent-teal rounded-2xl flex items-center justify-center text-hospital-navy">
                            <Check size={32} />
                         </div>
                         <div>
                            <div className="text-[10px] font-mono text-slate-400 uppercase">Medication Confirmed (STAT Dose)</div>
                            <div className="text-lg font-bold">Salbutamol STAT Nebulizer</div>
                         </div>
                      </div>
                      
                      <button 
                         onClick={() => nextStep('rights')}
                         className="w-full py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-mono"
                      >
                         PROCEED TO FIVE RIGHTS <ArrowRight />
                      </button>
                   </div>
                ) : selectedCase?.id === 'case-3' && !hasLabAlert ? (
                   <div className="space-y-6">
                      <div className="p-6 bg-accent-teal/10 border border-accent-teal/30 rounded-3xl flex items-center gap-6">
                         <div className="w-14 h-14 bg-accent-teal rounded-2xl flex items-center justify-center text-hospital-navy">
                            <Check size={32} />
                         </div>
                         <div>
                            <div className="text-[10px] font-mono text-slate-400 uppercase">Medication Confirmed</div>
                            <div className="text-lg font-bold">Furosemide IV Push</div>
                         </div>
                      </div>
                      
                      <button 
                         onClick={() => {
                            setHasLabAlert(true);
                         }}
                         className="w-full py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-mono"
                      >
                         NEXT: VERIFY LAB INTEGRATION RESULTS <ArrowRight />
                      </button>
                   </div>
                ) : selectedCase?.id === 'case-3' && hasLabAlert ? (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <AlertPanel 
                         type="CRITICAL" 
                         message="SYSTEM LAB INTEGRATION WARNING: Serum Potassium (K+) level is 2.9 mmol/L (Critical Low). Furosemide is a potassium-wasting loop diuretic. Administration presents extreme risk of severe arrhythmias or cardiac arrest." 
                      />
                      
                      <button 
                         onClick={() => {
                            nextStep('decision');
                         }}
                         className="w-full py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-mono shadow-xl shadow-red-500/10 border border-accent-crimson/30 text-accent-crimson"
                      >
                         NEXT: CLINICAL DECISION REQUIREMENT <ArrowRight />
                      </button>
                   </div>
                ) : (selectedCase?.id === 'case-4' || selectedCase?.id === 'case-9') ? (
                   <div className="space-y-6">
                      <AlertPanel type="CRITICAL" message={selectedCase.twists.scan!.alertMsg!} />
                      
                      <button 
                         onClick={() => {
                            nextStep('decision');
                         }}
                         className="w-full py-5 bg-accent-crimson text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 transition-all font-mono"
                      >
                         NEXT: RESOLVE SAFETY ALERT <ArrowRight />
                      </button>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {selectedCase?.twists.scan?.alertMsg && !selectedCase?.twists.scan?.patientBarcodeOverride ? (
                         <AlertPanel type="WARNING" message={selectedCase.twists.scan.alertMsg!} />
                      ) : selectedCase?.medOrder.medication.highAlert ? (
                         <AlertPanel type="INFO" message="HIGH ALERT medication detected. Automated safety checks active." />
                      ) : (
                        <div className="p-6 bg-accent-teal/10 border border-accent-teal/30 rounded-3xl flex items-center gap-6">
                           <div className="w-14 h-14 bg-accent-teal rounded-2xl flex items-center justify-center text-hospital-navy">
                              <Check size={32} />
                           </div>
                           <div>
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Medication Confirmed</div>
                              <div className="text-lg font-bold">{selectedCase?.medOrder.medication.name}</div>
                           </div>
                        </div>
                      )}
                      
                      <button 
                         onClick={() => nextStep('rights')}
                         className="w-full py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-mono"
                      >
                         PROCEED TO FIVE RIGHTS <ArrowRight />
                      </button>
                   </div>
                )}
             </div>
           )}
        </div>
     );
  };

  const renderRights = () => {
    const allChecked = Object.values(fiveRights).every(v => v);
    
    return (
       <div className="max-w-xl mx-auto p-6 md:p-12 pb-24">
          <div className="mb-10 text-center">
             <h2 className="text-2xl font-bold mb-2">FIVE RIGHTS CHECKLIST</h2>
             <p className="text-slate-400 text-sm">Perform final manual verification of clinical safety.</p>
          </div>

          <div className="space-y-3">
             {Object.keys(fiveRights).map(r => (
                <button 
                   key={r}
                   onClick={() => {
                      setFiveRights(prev => ({ ...prev, [r]: !prev[r] }));
                   }}
                   className={cn(
                      "w-full flex items-center justify-between p-6 rounded-2xl border transition-all group",
                      fiveRights[r] ? 'bg-accent-teal/10 border-accent-teal text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                   )}
                >
                   <div className="flex items-center gap-4 uppercase font-mono font-bold tracking-widest">
                      <div className={cn(
                         "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                         fiveRights[r] ? 'bg-accent-teal border-accent-teal text-hospital-navy' : 'border-white/20'
                      )}>
                         {fiveRights[r] && <Check size={14} strokeWidth={4} />}
                      </div>
                      Right {r}
                   </div>
                   {fiveRights[r] && <span className="text-[10px] font-mono text-accent-teal uppercase">VERIFIED</span>}
                </button>
             ))}
          </div>

          <div className="mt-12">
             <button 
                disabled={!allChecked}
                onClick={() => {
                   setSafetyLog(prev => ({ ...prev, fiveRights: 'PASS' }));
                   if (selectedCase?.twists.decisionPoint && selectedCase.id !== 'case-4' && selectedCase.id !== 'case-9') {
                      nextStep('decision');
                   } else {
                      nextStep('admin');
                   }
                }}
                className={cn(
                   "w-full py-5 rounded-2xl font-black font-mono uppercase text-lg transition-all flex items-center justify-center gap-3",
                   allChecked ? 'bg-accent-teal text-hospital-navy shadow-lg shadow-teal-500/20' : 'bg-white/5 text-slate-600 grayscale cursor-not-allowed border border-white/5'
                )}
             >
                {allChecked ? 'Proceed to Clinical Finalization' : 'Complete All Rights to Continue'}
                {allChecked && <ArrowRight />}
             </button>
          </div>
       </div>
    );
  };

  const renderDecision = () => {
    if (!selectedCase?.twists.decisionPoint) return null;
    const dp = selectedCase.twists.decisionPoint;

    return (
       <div className="max-w-4xl mx-auto p-6 md:p-12 pb-24">
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-hospital-slate/40 border border-white/10 p-10 rounded-[3rem]"
          >
             <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-accent-amber/20 text-accent-amber rounded-2xl flex items-center justify-center">
                   <Activity size={32} />
                </div>
                <div>
                   <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">{dp.title}</h3>
                   <p className="text-xl font-bold text-white">Critical Clinical Decision Point</p>
                </div>
             </div>

             <h2 className="text-2xl font-medium mb-10 leading-relaxed text-slate-100">{dp.question}</h2>

             <div className="space-y-4">
                {dp.options.map(opt => {
                   const isSelected = dp.isSata ? sataSelections.includes(opt.id) : (selectedDecisionOption === opt.id);
                   return (
                      <button 
                         key={opt.id}
                         onClick={() => {
                            setSelectedDecisionOption(opt.id);
                            if (dp.isSata) {
                               setSataSelections(prev => isSelected ? prev.filter(id => id !== opt.id) : [...prev, opt.id]);
                            } else {
                               setDecisionAnswered(true);
                               setCurrentTwistFeedback(opt.feedback);
                               if (opt.fatal) {
                                  setCurrentTwistFatal(true);
                               } else if (!opt.isCorrect) {
                                  setScore(prev => prev - 20);
                                  setErrors(prev => [...prev, opt.feedback]);
                                  setSafetyLog(prev => ({ ...prev, clinicalJudgment: 'FAIL' }));
                               } else {
                                  setSafetyLog(prev => ({ ...prev, clinicalJudgment: 'PASS' }));
                                  setStrengths(prev => [...prev, 'Demonstrated excellent clinical judgment during a critical event']);
                               }
                            }
                         }}
                         disabled={decisionAnswered}
                         className={cn(
                            "w-full p-6 text-left rounded-3xl border transition-all relative overflow-hidden group",
                            decisionAnswered && opt.isCorrect ? 'bg-accent-teal/10 border-accent-teal text-accent-teal font-bold' :
                            decisionAnswered && isSelected && !opt.isCorrect ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson font-bold' :
                            decisionAnswered ? 'bg-white/5 border-white/10 opacity-50' :
                            isSelected ? 'bg-accent-teal/20 border-accent-teal' :
                            'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                         )}
                      >
                         <div className="flex items-center gap-4">
                            {dp.isSata && (
                               <div className={cn(
                                  "w-6 h-6 border rounded-lg flex items-center justify-center transition-colors shrink-0",
                                  isSelected ? 'bg-accent-teal border-accent-teal text-hospital-navy' : 'border-white/20'
                               )}>
                                  {isSelected && <Check size={14} strokeWidth={4} />}
                               </div>
                            )}
                            <span className="text-lg">{opt.text}</span>
                         </div>
                      </button>
                   );
                })}
             </div>

             {dp.isSata && !decisionAnswered && (
                <button 
                  onClick={() => {
                     const correctIds = dp.options.filter(o => o.isCorrect).map(o => o.id);
                     const isPerfect = correctIds.length === sataSelections.length && correctIds.every(id => sataSelections.includes(id));
                     setDecisionAnswered(true);
                     if (isPerfect) {
                        setSafetyLog(prev => ({ ...prev, clinicalJudgment: 'PASS' }));
                        setStrengths(prev => [...prev, 'Correctly identified all appropriate clinical actions']);
                        setCurrentTwistFeedback("Perfect identification of all necessary safety measures.");
                     } else {
                        setScore(prev => prev - 15);
                        setErrors(prev => [...prev, 'Partially correct SATA answer. Clinical safety requires complete identification of steps.']);
                        setSafetyLog(prev => ({ ...prev, clinicalJudgment: 'PARTIAL' }));
                        setCurrentTwistFeedback("Incomplete or inaccurate selection. Review local protocols for safety events.");
                     }
                  }}
                  className="w-full mt-8 py-5 bg-accent-teal text-hospital-navy font-bold rounded-2xl font-mono uppercase"
                >
                   Finalize Selection
                </button>
             )}

             <AnimatePresence>
                {decisionAnswered && currentTwistFeedback && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }}
                     className="mt-10"
                   >
                     <div className={cn(
                        "p-6 rounded-2xl border text-sm italic mb-10",
                        currentTwistFatal ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson' : 'bg-white/5 border-white/10 text-slate-300'
                     )}>
                        {currentTwistFeedback}
                     </div>

                     {currentTwistFatal ? (
                        <button 
                           onClick={() => handleFatal(currentTwistFeedback)}
                           className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-crimson text-white transition-all"
                        >
                           VIEW CRITICAL INCIDENT REPORT
                        </button>
                     ) : selectedCase.id === 'case-3' && selectedDecisionOption === '3b' ? (
                        <button 
                           onClick={() => {
                              setCurrentTwistFeedback(null);
                              nextStep('document');
                           }}
                           className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-teal text-hospital-navy transition-all"
                        >
                           PROCEED TO FINAL DOCUMENTATION
                        </button>
                     ) : selectedCase.id === 'case-4' && selectedDecisionOption === '4a' && !isNewMedicationScanned ? (
                        <div className="space-y-4">
                           <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-mono text-xs">
                              The physician cancels the Cefazolin order and prescribes <strong>Clindamycin 600mg IV</strong>. Scan the newly delivered clindamycin package.
                           </div>
                           
                           <button 
                              onClick={() => {
                                 setIsNewMedicationScanned(true);
                                 setCurrentMedication({
                                    name: 'Clindamycin',
                                    orderedDose: '600mg',
                                    availableDose: '600mg/4mL injection vial',
                                    route: 'IV infusion',
                                    frequency: 'q8h',
                                    barcode: 'BC-CLIN-600'
                                 });
                                 setStrengths(prev => [...prev, 'Scanned correct replacement medication Clindamycin 600mg IV']);
                              }}
                              className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-teal text-hospital-navy transition-all"
                           >
                              Scan Clindamycin 600mg Package
                           </button>
                        </div>
                     ) : selectedCase.id === 'case-4' && selectedDecisionOption === '4a' && isNewMedicationScanned ? (
                        <div className="space-y-4">
                           <div className="p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-xl flex items-center gap-4 text-accent-teal text-xs">
                              <CheckCircle2 size={18} />
                              <span>Clindamycin 600mg IV verified. Ready to proceed to Five Rights.</span>
                           </div>
                           
                           <button 
                              onClick={() => {
                                 setCurrentTwistFeedback(null);
                                 nextStep('rights');
                              }}
                              className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-amber text-hospital-navy transition-all"
                           >
                              Proceed to Five Rights
                           </button>
                        </div>
                     ) : selectedCase.id === 'case-9' && selectedDecisionOption === '9b' && !isNewMedicationScanned ? (
                        <div className="space-y-4">
                           <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-mono text-xs">
                              The physician cancels the Ampicillin order and prescribes <strong>Ceftriaxone 500mg IV</strong>. Scan the newly delivered ceftriaxone package.
                           </div>
                           
                           <button 
                              onClick={() => {
                                 setIsNewMedicationScanned(true);
                                 setCurrentMedication({
                                    name: 'Ceftriaxone',
                                    orderedDose: '500mg',
                                    availableDose: '500mg vial',
                                    route: 'IV q12h',
                                    frequency: 'SCHEDULED',
                                    barcode: 'BC-CEF-500'
                                 });
                                 setStrengths(prev => [...prev, 'Scanned correct replacement medication Ceftriaxone 500mg IV']);
                              }}
                              className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-teal text-hospital-navy transition-all"
                           >
                              Scan Ceftriaxone 500mg Package
                           </button>
                        </div>
                     ) : selectedCase.id === 'case-9' && selectedDecisionOption === '9b' && isNewMedicationScanned ? (
                        <div className="space-y-4">
                           <div className="p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-xl flex items-center gap-4 text-accent-teal text-xs">
                              <CheckCircle2 size={18} />
                              <span>Ceftriaxone 500mg IV verified. Ready to proceed to Five Rights.</span>
                           </div>
                           
                           <button 
                              onClick={() => {
                                 setCurrentTwistFeedback(null);
                                 nextStep('rights');
                              }}
                              className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-amber text-hospital-navy transition-all"
                           >
                              Proceed to Five Rights
                           </button>
                        </div>
                     ) : (
                        <button 
                           onClick={() => {
                              setCurrentTwistFeedback(null);
                              nextStep('admin');
                           }}
                           className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-amber text-hospital-navy transition-all"
                        >
                           CONTINUE WITH PROCEDURE
                        </button>
                     )}
                   </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
       </div>
    );
  };

  const renderAdmin = () => {
    if (!selectedCase) return null;
    const adminTwist = selectedCase.twists.administration;
    const med = currentMedication || selectedCase.medOrder.medication;

    return (
       <div className="max-w-4xl mx-auto p-6 md:p-12 pb-24">
          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="flex-1 space-y-8">
                <div className="bg-hospital-slate/40 border border-white/10 p-10 rounded-[3rem]">
                   <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                      <Stethoscope size={14} /> ADMINISTRATION PHASE
                   </h3>

                   <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-3xl mb-12 group bg-black/10">
                      <motion.div 
                         initial={{ y: 0 }}
                         animate={{ y: [0, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 2 }}
                         className="text-accent-teal mb-6"
                      >
                         <Pill size={64} />
                      </motion.div>
                      <div className="text-center">
                         <div className="text-sm font-mono text-slate-400 mb-1 uppercase">Ready to Administer</div>
                         <div className="text-2xl font-bold">{med.name} ({med.orderedDose})</div>
                      </div>
                   </div>

                   {selectedCase.id === 'case-6' && !adverseEventTriggered && !adminComplete ? (
                      <button 
                         onClick={() => {
                            setAdverseEventTriggered(true);
                            setScore(prev => prev - 20);
                            setErrors(prev => [...prev, 'Patient developed critical magnesium toxicity. Urgent rescue required.']);
                            setSafetyLog(prev => ({ ...prev, emergencyResponse: 'TRIGGERED' }));
                         }}
                         className="w-full py-5 bg-accent-crimson text-white font-bold rounded-2xl pulse-crimson animate-bounce uppercase font-mono"
                      >
                         Assess Patient - RESPIRATION DROPPED TO 10! 🚨
                      </button>
                   ) : selectedCase.twists.deterioration?.triggerStep === 'administration' && !adverseEventTriggered ? (
                       <button 
                          onClick={() => {
                             setAdverseEventTriggered(true);
                             setScore(prev => prev - 20);
                             setErrors(prev => [...prev, 'Patient condition deteriorated during administration. Critical response initiated.']);
                             setSafetyLog(prev => ({ ...prev, emergencyResponse: 'TRIGGERED' }));
                          }}
                          className="w-full py-5 bg-accent-crimson text-white font-bold rounded-2xl pulse-crimson animate-bounce uppercase font-mono"
                       >
                          Patient Deteriorating - ACTION REQUIRED 🚨
                       </button>
                   ) : adminComplete ? (
                      <div className="bg-accent-teal/10 border border-accent-teal/30 p-6 rounded-2xl flex items-center gap-4 text-accent-teal">
                         <CheckCircle size={24} />
                         <span className="font-bold font-mono uppercase">Medication Administered Successfully</span>
                      </div>
                   ) : (
                      <button 
                         onClick={() => {
                            if (adminTwist && !adminAnswered) {
                               // Force twist first
                            } else {
                               setAdminComplete(true);
                               setSafetyLog(prev => ({ ...prev, documentation: 'PASS' }));
                            }
                         }}
                         disabled={adminTwist && !adminAnswered}
                         className={cn(
                            "w-full py-5 rounded-2xl font-black font-mono uppercase text-lg transition-all",
                            adminTwist && !adminAnswered ? 'bg-white/5 text-slate-600 grayscale cursor-not-allowed' : 'bg-accent-teal text-hospital-navy hover:scale-[1.02]'
                         )}
                      >
                         {adminTwist && !adminAnswered ? 'Confirm Administration Settings Below' : 'Perform Administration'}
                      </button>
                   )}
                </div>

                {selectedCase.id === 'case-2' && adverseEventTriggered && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-accent-crimson/10 border-2 border-accent-crimson p-10 rounded-[3rem] space-y-6"
                   >
                        <div className="flex items-center gap-3 text-accent-crimson">
                           <Wind className="animate-pulse" />
                           <h3 className="text-xl font-black uppercase font-mono tracking-tighter">EMERGENCY: Patient Crashing</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">BP</span>
                              <div className="text-xl font-bold text-accent-crimson">88/60</div>
                           </div>
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">HR</span>
                              <div className="text-xl font-bold text-accent-crimson">130</div>
                           </div>
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">RR</span>
                              <div className="text-xl font-bold text-accent-crimson">10</div>
                           </div>
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">O2 Sat</span>
                              <div className="text-xl font-bold text-accent-crimson">76%</div>
                           </div>
                        </div>

                        {deteriorationStep === 0 && (
                           <div className="space-y-4">
                              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Step 1: Rapidly assess the patient's clinical status:</label>
                              <div className="space-y-2">
                                 <button 
                                    onClick={() => {
                                       setDeteriorationStep(1);
                                       setStrengths(prev => [...prev, 'Assessed responsiveness and pulse in acute distress']);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-teal text-left text-sm transition-all"
                                 >
                                    Assess pulse, chest rise, and responsiveness
                                 </button>
                                 <button 
                                    onClick={() => {
                                       setScore(prev => prev - 10);
                                       setErrors(prev => [...prev, 'Continuing nebulizer in an unresponsive/bradypneic patient is ineffective. Assess ABCs.']);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-crimson text-left text-sm transition-all"
                                 >
                                    Continue nebulization therapy at a higher oxygen rate
                                 </button>
                              </div>
                           </div>
                        )}

                        {deteriorationStep === 1 && (
                           <div className="space-y-4">
                              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Step 2: Patient is semi-responsive. Severe respiratory depression. Next action:</label>
                              <div className="space-y-2">
                                 <button 
                                    onClick={() => {
                                       setDeteriorationStep(2);
                                       setStrengths(prev => [...prev, 'Appropriately triggered Rapid Response Team and notified physician']);
                                       setSafetyLog(prev => ({ ...prev, emergencyResponse: 'PASS' }));
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-teal text-left text-sm transition-all"
                                 >
                                    Call the Rapid Response Team and notify the physician immediately
                                 </button>
                                 <button 
                                    onClick={() => {
                                       setScore(prev => prev - 10);
                                       setErrors(prev => [...prev, 'Never leave an unstable crashing patient unattended. Use call bell.']);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-crimson text-left text-sm transition-all"
                                 >
                                    Leave the room to find a ventilation bag
                                 </button>
                              </div>
                           </div>
                        )}

                        {deteriorationStep === 2 && (
                           <div className="space-y-4">
                              <div className="p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-xl flex items-center gap-4 text-accent-teal text-xs">
                                 <CheckCircle2 size={18} />
                                 <span>Patient stabilized by Rapid Response Team and prepared for ICU transfer.</span>
                              </div>
                              
                              <button 
                                 onClick={() => {
                                    setAdverseEventTriggered(false);
                                    setAdminComplete(true);
                                    nextStep('document');
                                 }}
                                 className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-teal text-hospital-navy transition-all"
                              >
                                 PROCEED TO eMAR DOCUMENTATION
                              </button>
                           </div>
                        )}
                   </motion.div>
                )}

                {selectedCase.id === 'case-6' && adverseEventTriggered && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-accent-crimson/10 border-2 border-accent-crimson p-10 rounded-[3rem] space-y-6"
                   >
                        <div className="flex items-center gap-3 text-accent-crimson">
                           <AlertCircle className="animate-pulse" />
                           <h3 className="text-xl font-black uppercase font-mono tracking-tighter">EMERGENCY: Magnesium Sulfate Toxicity</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">Respiration Rate</span>
                              <div className="text-xl font-bold text-accent-crimson">10 / min</div>
                           </div>
                           <div className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">Patellar Reflexes</span>
                              <div className="text-xl font-bold text-accent-crimson">Absent (0+)</div>
                           </div>
                        </div>

                        {activeResponseStep === 0 && (
                           <div className="space-y-4">
                              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Immediate Suspected Toxicity Action:</label>
                              <div className="space-y-2">
                                 <button 
                                    onClick={() => {
                                       setActiveResponseStep(1);
                                       setStrengths(prev => [...prev, 'Suspected magnesium toxicity, stopped infusion, called physician']);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-teal text-left text-sm transition-all"
                                 >
                                    Stop the infusion immediately, call the physician, and request Calcium Gluconate 1g IV slowly
                                 </button>
                                 <button 
                                    onClick={() => {
                                       setScore(prev => prev - 10);
                                       setErrors(prev => [...prev, 'Continuing infusion under active toxicity leads to respiratory arrest. Hold immediately.']);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-crimson text-left text-sm transition-all"
                                 >
                                    Lower head of bed and continue infusion
                                 </button>
                              </div>
                           </div>
                        )}

                        {activeResponseStep === 1 && (
                           <div className="space-y-4">
                              <p className="text-sm text-slate-300 font-mono text-xs">
                                 The physician is at bedside and orders: <strong>Calcium Gluconate 1g IV slowly (over 5-10 minutes)</strong> as the toxicity antidote.
                              </p>
                              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Do you carry out the order to administer Calcium Gluconate?</label>
                              <div className="space-y-2">
                                 <button 
                                    onClick={() => {
                                       setStrengths(prev => [...prev, 'Administered Calcium Gluconate antidote over 10 minutes to stabilize respiratory depression.']);
                                       setSafetyLog(prev => ({ ...prev, emergencyResponse: 'PASS' }));
                                       setActiveResponseStep(2);
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-teal text-left text-sm transition-all font-mono"
                                 >
                                    YES: Administer Calcium Gluconate 1g IV slowly
                                 </button>
                                 <button 
                                    onClick={() => {
                                       handleFatal("Fatal Error: Delayed antidote administration during severe respiratory depression from Magnesium toxicity. Patient went into cardiopulmonary arrest.");
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-crimson text-left text-sm transition-all font-mono"
                                 >
                                    NO: Wait for lab verification of serum Magnesium levels
                                 </button>
                              </div>
                           </div>
                        )}

                        {activeResponseStep === 2 && (
                           <div className="space-y-4">
                              <div className="p-4 bg-accent-teal/10 border border-accent-teal/30 rounded-xl flex items-center gap-4 text-accent-teal text-xs">
                                 <CheckCircle2 size={18} />
                                 <span>Antidote administered. Patient's respirations have stabilized to 14/min and deep tendon reflexes are returning. Vitals have stabilized.</span>
                              </div>
                              
                              <button 
                                 onClick={() => {
                                    setAdverseEventTriggered(false);
                                    setAdminComplete(true);
                                    nextStep('document');
                                 }}
                                 className="w-full py-5 rounded-2xl font-bold font-mono uppercase bg-accent-teal text-hospital-navy transition-all"
                              >
                                 PROCEED TO FINAL DOCUMENTATION
                              </button>
                           </div>
                        )}
                   </motion.div>
                )}

                {selectedCase.id !== 'case-2' && selectedCase.id !== 'case-6' && adverseEventTriggered && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-accent-crimson/10 border-2 border-accent-crimson p-10 rounded-[3rem] space-y-6"
                   >
                        <div className="flex items-center gap-3 text-accent-crimson">
                           <Wind className="animate-pulse" />
                           <h3 className="text-xl font-black uppercase font-mono tracking-tighter">EMERGENCY: Vitals Dropping</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           {selectedCase.twists.deterioration?.newVitals.map(v => (
                              <div key={v.label} className="bg-hospital-navy/60 p-4 rounded-2xl border border-accent-crimson/30">
                                 <span className="text-[10px] font-mono text-slate-500 uppercase">{v.label}</span>
                                 <div className="text-xl font-bold text-accent-crimson">{v.value}</div>
                              </div>
                           ))}
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Immediate Rescue Actions</label>
                           <div className="grid grid-cols-1 gap-2">
                              {selectedCase.twists.deterioration?.actions.map(act => (
                                 <button 
                                    key={act.id}
                                    onClick={() => {
                                       if (act.isCorrect) {
                                          setStrengths(prev => [...prev, 'Responded correctly to patient deterioration']);
                                          setSafetyLog(prev => ({ ...prev, emergencyResponse: 'PASS' }));
                                          setAdverseEventTriggered(false);
                                          setAdminComplete(true);
                                       } else {
                                          setScore(prev => prev - 10);
                                          setErrors(prev => [...prev, act.feedback]);
                                       }
                                    }}
                                    className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:border-accent-crimson text-left text-sm transition-all"
                                 >
                                    {act.text}
                                 </button>
                              ))}
                           </div>
                        </div>
                   </motion.div>
                )}
             </div>

             {adminTwist && (
                <div className="w-full md:w-80 shrink-0">
                   <div className="bg-accent-amber/10 border border-accent-amber/30 p-8 rounded-[2.5rem] sticky top-8">
                      <div className="w-10 h-10 bg-accent-amber text-hospital-navy rounded-xl flex items-center justify-center mb-6">
                         <Search size={20} />
                      </div>
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 tracking-widest">Protocol Verification</h4>
                      <p className="font-bold text-white mb-6 leading-snug">{adminTwist.question}</p>
                      
                      <div className="space-y-2">
                         {adminTwist.options.map(opt => (
                            <button 
                               key={opt.id}
                               onClick={() => {
                                  setSelectedAdminOption(opt.id);
                                  setAdminAnswered(true);
                                  setCurrentTwistFeedback(opt.feedback);
                                  if (!opt.isCorrect) {
                                     setScore(prev => prev - 15);
                                     setErrors(prev => [...prev, opt.feedback]);
                                  }
                               }}
                               disabled={adminAnswered}
                               className={cn(
                                  "w-full p-4 text-left rounded-xl border text-xs font-mono transition-all",
                                  adminAnswered && opt.isCorrect ? 'bg-accent-teal/10 border-accent-teal text-accent-teal font-bold' :
                                  adminAnswered && (selectedAdminOption === opt.id) && !opt.isCorrect ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson font-bold' :
                                  adminAnswered ? 'bg-white/5 border-white/10 opacity-50' :
                                  'bg-white/5 border-white/10 hover:border-accent-amber/50'
                               )}
                            >
                               {opt.text}
                            </button>
                         ))}
                      </div>

                      {adminAnswered && (
                         <div className="mt-6 text-[10px] italic text-slate-400 leading-relaxed">
                            {currentTwistFeedback}
                         </div>
                      )}
                   </div>
                </div>
             )}
          </div>

          <AnimatePresence>
             {adminComplete && (
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-12 flex justify-center"
                >
                   <button 
                      onClick={() => nextStep('document')}
                      className="px-16 py-6 bg-white text-hospital-navy font-bold rounded-[2rem] shadow-2xl hover:bg-slate-100 transition-all text-xl uppercase font-mono flex items-center gap-4"
                   >
                      FINAL DOCUMENTATION <FileCheck size={24} />
                   </button>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    );
  };

  const renderDocument = () => {
    if (!selectedCase) return null;
    const p = selectedCase.patient;
    const m = selectedCase.medOrder.medication;
    
    return (
       <div className="max-w-4xl mx-auto p-6 md:p-12 pb-24">
          <div className="mb-10">
             <h2 className="text-2xl font-bold mb-2">eMAR DOCUMENTATION</h2>
             <p className="text-slate-400 text-sm">Review clinical data and submit final record to the hospital database.</p>
          </div>

          <div className="bg-hospital-slate/40 border border-white/10 rounded-[3rem] overflow-hidden">
             <div className="p-10 border-b border-white/5 bg-white/5 grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                   <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">PATIENT</span>
                   <span className="font-bold">{p.name}</span>
                </div>
                <div>
                   <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">MEDICATION</span>
                   <span className="font-bold">{m.name}</span>
                </div>
                <div>
                   <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TOTAL DOSE</span>
                   <span className="font-bold">{m.orderedDose}</span>
                </div>
                <div>
                   <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TIMESTAMP</span>
                   <span className="font-bold font-mono">2026-05-19 13:39:27</span>
                </div>
             </div>

             <div className="p-10 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest ml-1">Administration Notes & Observations</label>
                   <textarea 
                      value={formData.eMarNote}
                      onChange={(e) => setFormData({ eMarNote: e.target.value })}
                      placeholder="Enter specific nursing assessments, patient response, and site conditions..."
                      className="w-full h-48 bg-black/20 border border-white/10 rounded-2xl p-6 text-slate-300 font-mono text-sm outline-none focus:border-accent-teal transition-all resize-none"
                   />
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="w-10 h-10 bg-accent-teal/20 text-accent-teal rounded-xl flex items-center justify-center">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="text-xs text-slate-400 leading-relaxed italic">
                      "I hereby certify that I have verified the correct patient, medication, dosage, route, and time according to standard hospital BCMA protocols."
                   </div>
                </div>

                <button 
                   onClick={() => {
                      if (formData.eMarNote.length < 10) {
                         setScore(prev => prev - 5);
                         setErrors(prev => [...prev, 'Documentation was too brief/incomplete. Professional nursing notes require clinical detail.']);
                         setSafetyLog(prev => ({ ...prev, documentation: 'PARTIAL' }));
                      } else {
                         setStrengths(prev => [...prev, 'Provided clear and concise professional documentation']);
                         setSafetyLog(prev => ({ ...prev, documentation: 'PASS' }));
                      }
                      nextStep('results');
                   }}
                   className="w-full py-6 bg-accent-teal text-hospital-navy font-black rounded-2xl shadow-xl shadow-teal-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all font-mono uppercase tracking-widest"
                >
                   SUBMIT TO MEDICAL RECORDS
                </button>
             </div>
          </div>
       </div>
    );
  };

  const renderResults = () => {
    return (
       <div className="max-w-5xl mx-auto p-6 md:p-12 pb-24 font-mono">
          <div className="mb-12 text-center">
             <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }}
               className="w-24 h-24 bg-accent-teal text-hospital-navy rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/30"
             >
                <LayoutDashboard size={48} />
             </motion.div>
             <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Clinical Performance Dashboard</h2>
             <p className="text-slate-400 text-sm">Simulation Summary & Competency Evaluation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
             <div className="space-y-6">
                {/* Score Circular Rep */}
                <div className="bg-hospital-slate/40 border border-white/10 p-10 rounded-[3rem] text-center relative overflow-hidden group">
                   <div className="relative z-10">
                      <div className="text-xs text-slate-500 uppercase mb-2">Final Safety Score</div>
                      <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 1, delay: 0.5 }}
                         className={cn(
                            "text-7xl font-black mb-4",
                            score >= 90 ? 'text-accent-teal' : score >= 70 ? 'text-accent-amber' : 'text-accent-crimson'
                         )}
                      >
                         {Math.max(0, score)}%
                      </motion.div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${Math.max(0, score)}%` }}
                            className={cn("h-full", score >= 90 ? 'bg-accent-teal' : score >= 70 ? 'bg-accent-amber' : 'bg-accent-crimson')} 
                         />
                      </div>
                   </div>
                </div>

                <div className="bg-hospital-slate/40 border border-white/10 p-8 rounded-[3rem]">
                   <h3 className="text-xs font-bold text-slate-500 uppercase mb-6 tracking-widest border-b border-white/5 pb-4">Safety Grid</h3>
                   <div className="space-y-4">
                      {Object.entries(safetyLog).map(([key, val]) => (
                         <div key={key} className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <div className={cn(
                               "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                               val === 'PASS' ? 'bg-green-500/20 text-green-400' :
                               val === 'PARTIAL' ? 'bg-accent-amber/20 text-accent-amber' :
                               val === 'TRIGGERED' ? 'bg-blue-500/20 text-blue-400' :
                               val === 'N/A' ? 'bg-white/5 text-slate-600' :
                               'bg-accent-crimson/20 text-accent-crimson'
                            )}>
                               {val}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="md:col-span-2 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                      <div className="flex items-center gap-3 text-accent-teal mb-6">
                         <CheckCircle size={20} />
                         <span className="text-xs font-bold uppercase">Strengths Identified</span>
                      </div>
                      <div className="space-y-4">
                         {strengths.length > 0 ? strengths.map((s, i) => (
                            <div key={i} className="flex gap-4 group">
                               <span className="text-accent-teal font-black">/</span>
                               <p className="text-xs text-slate-300 leading-relaxed">{s}</p>
                            </div>
                         )) : (
                            <p className="text-xs text-slate-500 italic">No specific strengths recorded.</p>
                         )}
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                      <div className="flex items-center gap-3 text-accent-crimson mb-6">
                         <ShieldAlert size={20} />
                         <span className="text-xs font-bold uppercase">Areas for Improvement</span>
                      </div>
                      <div className="space-y-4">
                         {errors.length > 0 ? errors.map((e, i) => (
                            <div key={i} className="flex gap-4 group">
                               <span className="text-accent-crimson font-black">!</span>
                               <p className="text-xs text-slate-300 leading-relaxed">{e}</p>
                            </div>
                         )) : (
                            <p className="text-xs text-slate-500 italic">Excellent! No errors detected.</p>
                         )}
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                      onClick={() => {
                        // Reset all simulation state
                        setStep(1);
                        setScreen('selection');
                        setScore(100);
                        setErrors([]);
                        setStrengths([]);
                        setSataSelections([]);
                        setDecisionAnswered(false);
                        setPrepAnswered(false);
                        setPatientScanned(false);
                        setMedicationScanned(false);
                        setAdminComplete(false);
                        setAdverseEventTriggered(false);
                        setFormData({ eMarNote: '' });
                        setFiveRights({
                           patient: false,
                           drug: false,
                           dose: false,
                           route: false,
                           time: false
                        });
                        setSafetyLog({
                           handHygiene: 'PENDING',
                           bcmaVerification: 'PENDING',
                           fiveRights: 'PENDING',
                           clinicalJudgment: 'PENDING',
                           documentation: 'PENDING',
                           emergencyResponse: 'N/A'
                        });
                      }}
                      className="flex-1 py-5 bg-white text-hospital-navy font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase"
                   >
                      <RefreshCcw size={18} /> New Patient Case
                   </button>
                   <button 
                      onClick={() => window.location.reload()}
                      className="flex-1 py-5 bg-hospital-slate text-white border border-white/10 font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase"
                   >
                      <LogOut size={18} /> Exit Simulation
                   </button>
                </div>
             </div>
          </div>
       </div>
    );
  };

  const renderContent = () => {
    switch (screen) {
      case 'login': return renderLogin();
      case 'selection': return renderSelection();
      case 'endorsement': return renderEndorsement();
      case 'profile': return renderProfile();
      case 'order': return renderOrder();
      case 'hygiene': return renderHygiene();
      case 'prep': return renderPrep();
      case 'scan-patient': return renderScanPatient();
      case 'scan-med': return renderScanMed();
      case 'rights': return renderRights();
      case 'decision': return renderDecision();
      case 'admin': return renderAdmin();
      case 'document': return renderDocument();
      case 'results': return renderResults();
      default: return renderLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-accent-teal selection:text-hospital-navy">
      <Header studentInfo={studentInfo || undefined} />
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {screen !== 'login' && screen !== 'selection' && screen !== 'results' && (
        <StepIndicator current={step} total={15} />
      )}
    </div>
  );
}
